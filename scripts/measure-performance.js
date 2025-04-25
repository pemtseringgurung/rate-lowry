require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/rate_lowry";
const client = new MongoClient(uri);

/**
 * Measure performance with and without index usage
 */
async function measurePerformance() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('rate_lowry');
    const reviewsCollection = db.collection('reviews');
    
    // Get existing indexes to understand what's available
    console.log('Checking existing indexes...');
    const existingIndexes = await reviewsCollection.indexes();
    console.log(`Found ${existingIndexes.length} existing indexes`);
    
    console.log('Existing indexes:');
    existingIndexes.forEach(index => {
      const keyInfo = index.key ? Object.entries(index.key).map(([k, v]) => `${k}:${v}`).join(', ') : 'unknown';
      console.log(`- ${index.name}: { ${keyInfo} }`);
    });
    
    // ===== NON-INDEXED PERFORMANCE (FORCE COLLSCAN) =====
    console.log('\n===== NON-INDEXED PERFORMANCE (FORCING COLLECTION SCANS) =====');
    
    // Simple find by station (force collection scan)
    console.time('Simple find (non-indexed)');
    await reviewsCollection.find({ station: 'Main Line' })
      .hint({ $natural: 1 }) // Force collection scan
      .limit(10)
      .toArray();
    console.timeEnd('Simple find (non-indexed)');
    
    // Find with filter (force collection scan)
    console.time('Filtered query (non-indexed)');
    await reviewsCollection.find({ 
      station: 'Main Line',
      rating: { $gte: 4 }
    })
      .hint({ $natural: 1 }) // Force collection scan
      .limit(10)
      .toArray();
    console.timeEnd('Filtered query (non-indexed)');
    
    // Find with sort (force collection scan)
    console.time('Sort operation (non-indexed)');
    await reviewsCollection.find({})
      .hint({ $natural: 1 }) // Force collection scan
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    console.timeEnd('Sort operation (non-indexed)');
    
    // Complex query (force collection scan)
    console.time('Complex query (non-indexed)');
    await reviewsCollection.find({
      station: 'Main Line',
      isActive: true,
      rating: { $gte: 3 }
    })
      .hint({ $natural: 1 }) // Force collection scan
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    console.timeEnd('Complex query (non-indexed)');
    
    // ===== INDEXED PERFORMANCE =====
    console.log('\n===== INDEXED PERFORMANCE =====');
    
    // Simple find by station (use index)
    console.time('Simple find (indexed)');
    await reviewsCollection.find({ station: 'Main Line' })
      .limit(10)
      .toArray();
    console.timeEnd('Simple find (indexed)');
    
    // Find with filter (use index)
    console.time('Filtered query (indexed)');
    await reviewsCollection.find({ 
      station: 'Main Line',
      rating: { $gte: 4 }
    })
      .limit(10)
      .toArray();
    console.timeEnd('Filtered query (indexed)');
    
    // Find with sort (use index)
    console.time('Sort operation (indexed)');
    await reviewsCollection.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    console.timeEnd('Sort operation (indexed)');
    
    // Complex query (use index)
    console.time('Complex query (indexed)');
    await reviewsCollection.find({
      station: 'Main Line',
      isActive: true,
      rating: { $gte: 3 }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    console.timeEnd('Complex query (indexed)');
    
    // ===== WRITE OPERATION OVERHEAD =====
    console.log('\n===== WRITE OPERATION OVERHEAD =====');
    
    // Sample review for testing
    const sampleReview = {
      foodItem: 'Test Food Item',
      station: 'Test Station',
      rating: 5,
      comment: 'Test comment',
      reviewer: 'Tester',
      createdAt: new Date(),
      isActive: true
    };
    
    // Insert single document
    console.time('Insert single document');
    const insertResult = await reviewsCollection.insertOne(sampleReview);
    console.timeEnd('Insert single document');
    
    // Update document
    console.time('Update operation');
    await reviewsCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { comment: 'Updated comment' } }
    );
    console.timeEnd('Update operation');
    
    // Delete document (cleanup)
    console.time('Delete operation');
    await reviewsCollection.deleteOne({ _id: insertResult.insertedId });
    console.timeEnd('Delete operation');
    
    console.log('\nPerformance measurement complete.');
    
  } catch (err) {
    console.error('Error measuring performance:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Execute the performance measurement
if (require.main === module) {
  measurePerformance()
    .then(() => console.log('Performance measurement completed'))
    .catch(err => console.error('Error:', err));
} 