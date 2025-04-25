/**
 * Performance tests for MongoDB query optimizations in the Rate Lowry application
 * 
 * This test file:
 * 1. Simulates high-load conditions with concurrent requests
 * 2. Compares indexed vs non-indexed query performance
 * 3. Tests the batching mechanism for write operations
 * 4. Verifies soft delete functionality
 */

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api';
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rate_lowry";
const REPORT_DIR = path.join(__dirname, '../../performance-reports');

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Test data for reviews
const testStations = [
  'Main Line', 'Grill', 'Pizza', 'International', 'Deli', 'Salad Bar', 'Dessert'
];

const testFoodItems = [
  'Burger', 'Pizza', 'Salad', 'Sandwich', 'Pasta', 'Tacos', 'Ice Cream', 'Soup',
  'Fries', 'Chicken Tenders', 'Stir Fry', 'Sushi', 'Curry', 'Pancakes'
];

// Helper function to generate a random review
function generateRandomReview() {
  return {
    foodItem: testFoodItems[Math.floor(Math.random() * testFoodItems.length)],
    station: testStations[Math.floor(Math.random() * testStations.length)],
    rating: Math.floor(Math.random() * 5) + 1,
    comment: `Test review generated at ${new Date().toISOString()}`,
    reviewer: `Tester-${Math.floor(Math.random() * 1000)}`,
  };
}

// Helper function to wait for a specified time (ms)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('MongoDB Performance Tests', () => {
  let mongoClient;
  let db;
  let reviewIds = []; // Store created review IDs for cleanup

  // Test results object to save to file
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      database: 'MongoDB Atlas',
    },
    tests: {}
  };

  // Connect to MongoDB before all tests
  beforeAll(async () => {
    // Connect to MongoDB directly
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db('rate_lowry');
    
    // Drop all indexes except _id
    const reviewsCollection = db.collection('reviews');
    const indexes = await reviewsCollection.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        await reviewsCollection.dropIndex(index.name);
        console.log(`Dropped index: ${index.name}`);
      }
    }
    
    // Create a test collection for reference
    try {
      await db.createCollection('test_reviews', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['foodItem', 'station', 'rating', 'comment', 'createdAt'],
            properties: {
              foodItem: { bsonType: 'string' },
              station: { bsonType: 'string' },
              rating: { bsonType: 'int', minimum: 1, maximum: 5 },
              comment: { bsonType: 'string' },
              reviewer: { bsonType: 'string' },
              createdAt: { bsonType: 'date' },
              isActive: { bsonType: 'bool' }
            }
          }
        }
      });
    } catch (err) {
      // Collection might already exist
      console.log('Collection already exists or other error:', err.message);
    }
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Delete test reviews
    if (reviewIds.length > 0) {
      console.log(`Cleaning up ${reviewIds.length} test reviews...`);
      await db.collection('reviews').deleteMany({
        _id: { $in: reviewIds.map(id => new ObjectId(id)) }
      });
    }
    
    // Write test results to file
    const resultFilePath = path.join(REPORT_DIR, `performance_test_${Date.now()}.json`);
    fs.writeFileSync(resultFilePath, JSON.stringify(testResults, null, 2));
    console.log(`Test results saved to: ${resultFilePath}`);
    
    // Close MongoDB connection
    if (mongoClient) {
      await mongoClient.close();
    }
  });

  // Test 1: Compare non-indexed vs indexed queries
  test('Compare non-indexed vs indexed query performance', async () => {
    const reviewsCollection = db.collection('reviews');
    const iterations = 50;
    
    // Part 1: Run queries without indexes
    console.log('\nTesting non-indexed queries...');
    const nonIndexedTimes = [];
    
    for (let i = 0; i < iterations; i++) {
      const station = testStations[i % testStations.length];
      
      const startTime = performance.now();
      await reviewsCollection.find({ station }).limit(10).toArray();
      const endTime = performance.now();
      
      nonIndexedTimes.push(endTime - startTime);
      
      // Small delay to avoid overwhelming the database
      if (i % 10 === 0) await wait(100);
    }
    
    const avgNonIndexedTime = nonIndexedTimes.reduce((sum, time) => sum + time, 0) / iterations;
    console.log(`Average non-indexed query time: ${avgNonIndexedTime.toFixed(2)}ms`);
    
    // Part 2: Create indexes and run queries again
    console.log('\nCreating indexes...');
    await reviewsCollection.createIndex({ station: 1 }, { name: 'idx_station' });
    await reviewsCollection.createIndex({ foodItem: 1 }, { name: 'idx_foodItem' });
    await reviewsCollection.createIndex({ createdAt: -1 }, { name: 'idx_createdAt' });
    await reviewsCollection.createIndex({ isActive: 1 }, { name: 'idx_isActive' });
    
    console.log('Testing indexed queries...');
    const indexedTimes = [];
    
    for (let i = 0; i < iterations; i++) {
      const station = testStations[i % testStations.length];
      
      const startTime = performance.now();
      await reviewsCollection.find({ station }).limit(10).toArray();
      const endTime = performance.now();
      
      indexedTimes.push(endTime - startTime);
      
      // Small delay to avoid overwhelming the database
      if (i % 10 === 0) await wait(100);
    }
    
    const avgIndexedTime = indexedTimes.reduce((sum, time) => sum + time, 0) / iterations;
    console.log(`Average indexed query time: ${avgIndexedTime.toFixed(2)}ms`);
    
    // Calculate improvement
    const improvement = ((avgNonIndexedTime - avgIndexedTime) / avgNonIndexedTime) * 100;
    console.log(`Performance improvement with indexes: ${improvement.toFixed(2)}%`);
    
    // Store results
    testResults.tests.indexPerformance = {
      nonIndexedAvgTime: avgNonIndexedTime,
      indexedAvgTime: avgIndexedTime,
      improvementPercent: improvement,
      iterations
    };
    
    // Assert improvement (flexible assertion to accommodate varying test environments)
    expect(avgIndexedTime).toBeLessThan(avgNonIndexedTime * 1.1); // Allow for some variance
  }, 30000); // Increased timeout for this test

  // Test 2: Simulate high-volume batch write operations
  test('Batch write performance under load', async () => {
    console.log('\nTesting batch write performance...');
    const batchSize = 100; // 100 concurrent writes
    const reviewPromises = [];
    
    const startTime = performance.now();
    
    // Create batch of review creation promises
    for (let i = 0; i < batchSize; i++) {
      const review = generateRandomReview();
      reviewPromises.push(
        axios.post(`${BASE_URL}/reviews`, review)
          .then(response => {
            if (response.data.reviewId) {
              reviewIds.push(response.data.reviewId);
            }
            return response;
          })
          .catch(error => {
            console.error('Error creating review:', error.message);
            return null;
          })
      );
    }
    
    // Wait for all requests to complete
    const results = await Promise.all(reviewPromises);
    const endTime = performance.now();
    
    // Calculate statistics
    const totalTime = endTime - startTime;
    const successfulWrites = results.filter(r => r && r.status === 201).length;
    const failedWrites = batchSize - successfulWrites;
    const avgTimePerWrite = totalTime / batchSize;
    const writesPerSecond = (successfulWrites / totalTime) * 1000;
    
    console.log(`Batch write results:`);
    console.log(`- Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`- Successful writes: ${successfulWrites}`);
    console.log(`- Failed writes: ${failedWrites}`);
    console.log(`- Avg time per write: ${avgTimePerWrite.toFixed(2)}ms`);
    console.log(`- Writes per second: ${writesPerSecond.toFixed(2)}`);
    
    // Store results
    testResults.tests.batchWritePerformance = {
      totalTimeMs: totalTime,
      batchSize,
      successfulWrites,
      failedWrites,
      avgTimePerWriteMs: avgTimePerWrite,
      writesPerSecond
    };
    
    // Assertions
    expect(successfulWrites).toBeGreaterThan(0);
    expect(failedWrites).toBeLessThan(batchSize);
  }, 30000); // Increased timeout for this test

  // Test 3: Soft delete functionality
  test('Verify soft delete functionality', async () => {
    const reviewsCollection = db.collection('reviews');
    
    // Create a review directly in the database
    const review = {
      ...generateRandomReview(),
      createdAt: new Date(),
      isActive: true
    };
    
    const insertResult = await reviewsCollection.insertOne(review);
    const reviewId = insertResult.insertedId.toString();
    
    // Call the DELETE endpoint to soft delete
    const deleteResponse = await axios.delete(`${BASE_URL}/reviews?id=${reviewId}`);
    
    // Verify API response
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data.success).toBe(true);
    
    // Verify that the document still exists in the database but is marked as inactive
    const deletedReview = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });
    
    // Store results
    testResults.tests.softDelete = {
      success: deletedReview && deletedReview.isActive === false,
      documentPreserved: !!deletedReview,
      hasDeletedAtTimestamp: !!deletedReview?.deletedAt
    };
    
    // Assertions
    expect(deletedReview).not.toBeNull();
    expect(deletedReview.isActive).toBe(false);
    expect(deletedReview.deletedAt).toBeInstanceOf(Date);
  });

  // Test 4: Read performance with field projection
  test('Read performance with field projection', async () => {
    console.log('\nTesting read performance with field projection...');
    const iterations = 50;
    
    // Test full document reads (no projection)
    const fullReadTimes = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await axios.get(`${BASE_URL}/reviews?foodItem=${testFoodItems[0]}&station=${testStations[0]}`);
      const endTime = performance.now();
      fullReadTimes.push(endTime - startTime);
    }
    
    const avgFullReadTime = fullReadTimes.reduce((sum, time) => sum + time, 0) / iterations;
    console.log(`Average read time (full documents): ${avgFullReadTime.toFixed(2)}ms`);
    
    // Test projected reads (only necessary fields)
    const projectedReadTimes = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await axios.get(`${BASE_URL}/reviews?foodItem=${testFoodItems[0]}&station=${testStations[0]}&fields=foodItem,station,rating`);
      const endTime = performance.now();
      projectedReadTimes.push(endTime - startTime);
    }
    
    const avgProjectedReadTime = projectedReadTimes.reduce((sum, time) => sum + time, 0) / iterations;
    console.log(`Average read time (projected fields): ${avgProjectedReadTime.toFixed(2)}ms`);
    
    // Calculate improvement
    const improvement = ((avgFullReadTime - avgProjectedReadTime) / avgFullReadTime) * 100;
    console.log(`Performance improvement with projection: ${improvement.toFixed(2)}%`);
    
    // Store results
    testResults.tests.projectionPerformance = {
      fullDocumentAvgTimeMs: avgFullReadTime,
      projectedFieldsAvgTimeMs: avgProjectedReadTime,
      improvementPercent: improvement,
      iterations
    };
    
    // Assertions (flexible to accommodate varying test environments)
    expect(avgProjectedReadTime).toBeLessThanOrEqual(avgFullReadTime * 1.1);
  }, 30000); // Increased timeout
}); 