require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/rate_lowry";
const client = new MongoClient(uri);

// Configuration
const RESULTS_DIR = path.join(__dirname, '../performance-reports');
// Ensure analytics directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

/**
 * Safely runs an aggregation with a hint, falling back to no hint if the hint fails
 * @param {Collection} collection - MongoDB collection
 * @param {Array} pipeline - Aggregation pipeline
 * @param {Object} options - Aggregation options with hint
 * @param {string} operationName - Name of operation for logging
 * @returns {Promise<Array>} - Aggregation results
 */
async function safeAggregation(collection, pipeline, options, operationName) {
  try {
    return await collection.aggregate(pipeline, options).toArray();
  } catch (err) {
    if (err.code === 2 && err.message.includes('hint provided does not correspond to an existing index')) {
      console.log(`Warning: Hint in ${operationName} doesn't match an existing index. Running without hint.`);
      // Run without the hint
      return await collection.aggregate(pipeline).toArray();
    }
    throw err; // Re-throw other errors
  }
}

/**
 * Safely runs a next() operation on an aggregation with a hint, falling back to no hint if the hint fails
 * @param {Collection} collection - MongoDB collection
 * @param {Array} pipeline - Aggregation pipeline
 * @param {Object} options - Aggregation options with hint
 * @param {string} operationName - Name of operation for logging
 * @returns {Promise<Object>} - Single aggregation result
 */
async function safeAggregationNext(collection, pipeline, options, operationName) {
  try {
    return await collection.aggregate(pipeline, options).next();
  } catch (err) {
    if (err.code === 2 && err.message.includes('hint provided does not correspond to an existing index')) {
      console.log(`Warning: Hint in ${operationName} doesn't match an existing index. Running without hint.`);
      // Run without the hint
      return await collection.aggregate(pipeline).next();
    }
    throw err; // Re-throw other errors
  }
}

/**
 * Demonstrates optimized MongoDB aggregation pipelines
 * for the "Rate Lowry!" application
 */
async function runAggregationPipelines() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('rate_lowry');
    const reviewsCollection = db.collection('reviews');
    
    console.log('=== Running Optimized Aggregation Pipelines ===\n');
    
    // Track execution times for performance comparison
    const executionTimes = {};
    
    // 1. Basic aggregation: Average rating per food item (unoptimized)
    const startTimeBasic = Date.now();
    
    const basicAggregationResults = await reviewsCollection.aggregate([
      // Match all active reviews
      { $match: { isActive: { $ne: false } } },
      // Group by food item and station
      { $group: {
          _id: { foodItem: "$foodItem", station: "$station" },
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      },
      // Project to format output
      { $project: {
          _id: 0,
          foodItem: "$_id.foodItem",
          station: "$_id.station",
          averageRating: { $round: ["$averageRating", 1] },
          reviewCount: 1
        }
      },
      // Sort by food item
      { $sort: { "foodItem": 1, "station": 1 } }
    ]).toArray();
    
    executionTimes.basic = Date.now() - startTimeBasic;
    console.log(`1. Basic aggregation completed in ${executionTimes.basic}ms`);
    console.log(`   Results: ${basicAggregationResults.length} items\n`);
    
    // 2. Optimized aggregation: Early filtering with index hints
    const startTimeOptimized = Date.now();
    
    // Get date for 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const optimizedAggregationResults = await safeAggregation(
      reviewsCollection,
      [
        // Early filtering - only recent, active reviews
        { $match: {
            isActive: { $ne: false },
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        // Group by food item and station
        { $group: {
            _id: { foodItem: "$foodItem", station: "$station" },
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 }
          }
        },
        // Project only necessary fields
        { $project: {
            _id: 0,
            foodItem: "$_id.foodItem",
            station: "$_id.station",
            averageRating: { $round: ["$averageRating", 1] },
            reviewCount: 1
          }
        },
        // Sort by food item
        { $sort: { "foodItem": 1, "station": 1 } }
      ],
      { hint: { isActive: 1, createdAt: -1 } },
      "Optimized aggregation"
    );
    
    executionTimes.optimized = Date.now() - startTimeOptimized;
    console.log(`2. Optimized aggregation completed in ${executionTimes.optimized}ms`);
    console.log(`   Results: ${optimizedAggregationResults.length} items\n`);
    
    // 3. Station analytics with early filtering and efficient grouping
    const startTimeStation = Date.now();
    
    const stationAnalyticsResults = await safeAggregation(
      reviewsCollection,
      [
        // Early filtering - active reviews only
        { $match: { isActive: { $ne: false } } },
        // Group by station
        { $group: {
            _id: "$station",
            totalReviews: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            // Efficient use of $min/$max instead of sorting
            latestReview: { $max: "$createdAt" },
            oldestReview: { $min: "$createdAt" },
            // Collect unique food items without additional lookups
            distinctFoodItems: { $addToSet: "$foodItem" }
          }
        },
        // Calculate additional metrics
        { $project: {
            _id: 0,
            station: "$_id",
            totalReviews: 1,
            averageRating: { $round: ["$averageRating", 1] },
            // Calculate days between first and last review
            daysActive: {
              $round: [{ 
                $divide: [
                  { $subtract: ["$latestReview", "$oldestReview"] }, 
                  (1000 * 60 * 60 * 24) // Convert milliseconds to days
                ]
              }, 0]
            },
            // Count distinct food items
            foodItemCount: { $size: "$distinctFoodItems" }
          }
        },
        // Sort by total reviews descending
        { $sort: { totalReviews: -1 } }
      ],
      { hint: { station: 1, isActive: 1 } },
      "Station analytics"
    );
    
    executionTimes.station = Date.now() - startTimeStation;
    console.log(`3. Station analytics completed in ${executionTimes.station}ms`);
    console.log(`   Results: ${stationAnalyticsResults.length} stations\n`);
    
    // 4. Rating distribution with bucketing for efficient analysis
    const startTimeDistribution = Date.now();
    
    const ratingDistributionResults = await safeAggregationNext(
      reviewsCollection,
      [
        // Early filtering - active reviews only
        { $match: { isActive: { $ne: false } } },
        // Use $facet to perform multiple aggregations in a single pipeline
        { $facet: {
            // Overall distribution
            "overall": [
              { $group: {
                  _id: "$rating",
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ],
            // Station distribution - separate facet avoids re-reading documents
            "byStation": [
              { $group: {
                  _id: { station: "$station", rating: "$rating" },
                  count: { $sum: 1 }
                }
              },
              // Restructure data for easier analysis
              { $group: {
                  _id: "$_id.station",
                  ratings: { 
                    $push: { 
                      rating: "$_id.rating", 
                      count: "$count"
                    }
                  },
                  totalCount: { $sum: "$count" }
                }
              },
              { $sort: { totalCount: -1 } }
            ],
            // Period distribution (by month)
            "byMonth": [
              {
                $group: {
                  _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    rating: "$rating"
                  },
                  count: { $sum: 1 }
                }
              },
              { $sort: { "_id.year": 1, "_id.month": 1, "_id.rating": 1 } }
            ]
          }
        }
      ],
      { hint: { isActive: 1 } },
      "Rating distribution"
    );
    
    executionTimes.distribution = Date.now() - startTimeDistribution;
    console.log(`4. Rating distribution analysis completed in ${executionTimes.distribution}ms\n`);
    
    // 5. Recent reviews (last 7 days) with trend analysis
    const startTimeRecent = Date.now();
    
    // Get date for 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentReviewsResults = await safeAggregation(
      reviewsCollection,
      [
        // Early filtering - only recent, active reviews
        { $match: {
            isActive: { $ne: false },
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        // Group by day
        { $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            },
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            stations: { $addToSet: "$station" }
          }
        },
        // Format output
        { $project: {
            _id: 0,
            date: "$_id.date",
            count: 1,
            avgRating: { $round: ["$avgRating", 1] },
            stationCount: { $size: "$stations" }
          }
        },
        // Sort by date
        { $sort: { "date": 1 } }
      ],
      { hint: { isActive: 1, createdAt: -1 } },
      "Recent reviews"
    );
    
    executionTimes.recent = Date.now() - startTimeRecent;
    console.log(`5. Recent reviews analysis completed in ${executionTimes.recent}ms`);
    console.log(`   Results: ${recentReviewsResults.length} days\n`);
    
    // 6. Most common ratings per dish (pre-calculation)
    const startTimeCommonRatings = Date.now();
    
    const commonRatingsResults = await safeAggregation(
      reviewsCollection,
      [
        // Early filtering - active reviews only
        { $match: { isActive: { $ne: false } } },
        // Group by food item, station, and rating
        { $group: {
            _id: { foodItem: "$foodItem", station: "$station", rating: "$rating" },
            count: { $sum: 1 }
          }
        },
        // Restructure to group ratings by food item
        { $group: {
            _id: { foodItem: "$_id.foodItem", station: "$_id.station" },
            ratings: { 
              $push: { 
                rating: "$_id.rating", 
                count: "$count" 
              } 
            },
            totalReviews: { $sum: "$count" }
          }
        },
        // Only include items with meaningful number of reviews
        { $match: { totalReviews: { $gte: 3 } } },
        // Format output
        { $project: {
            _id: 0,
            foodItem: "$_id.foodItem",
            station: "$_id.station",
            ratings: 1,
            totalReviews: 1,
            // Calculate the most common rating
            mostCommonRating: {
              $reduce: {
                input: "$ratings",
                initialValue: { rating: 0, count: 0 },
                in: {
                  rating: {
                    $cond: [
                      { $gt: ["$$this.count", "$$value.count"] },
                      "$$this.rating",
                      "$$value.rating"
                    ]
                  },
                  count: {
                    $cond: [
                      { $gt: ["$$this.count", "$$value.count"] },
                      "$$this.count",
                      "$$value.count"
                    ]
                  }
                }
              }
            }
          }
        },
        // Additional projection to format mostCommonRating
        { $project: {
            foodItem: 1,
            station: 1,
            ratings: 1,
            totalReviews: 1,
            mostCommonRating: "$mostCommonRating.rating",
            mostCommonCount: "$mostCommonRating.count"
          }
        },
        // Sort by number of reviews
        { $sort: { totalReviews: -1 } }
      ],
      { hint: { foodItem: 1, station: 1, isActive: 1 } },
      "Common ratings"
    );
    
    executionTimes.commonRatings = Date.now() - startTimeCommonRatings;
    console.log(`6. Common ratings analysis completed in ${executionTimes.commonRatings}ms`);
    console.log(`   Results: ${commonRatingsResults.length} food items\n`);

    // Save results to files for future reference
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    
    // Format and save all results
    const allResults = {
      executionTimes,
      basicAggregation: basicAggregationResults.slice(0, 10), // First 10 for brevity
      optimizedAggregation: optimizedAggregationResults.slice(0, 10),
      stationAnalytics: stationAnalyticsResults,
      ratingDistribution: ratingDistributionResults,
      recentReviews: recentReviewsResults,
      commonRatings: commonRatingsResults.slice(0, 10)
    };
    
    fs.writeFileSync(
      path.join(RESULTS_DIR, `aggregation-results-${timestamp}.json`),
      JSON.stringify(allResults, null, 2)
    );
    
    console.log('=== Performance Summary ===');
    console.log(`Basic aggregation: ${executionTimes.basic}ms`);
    console.log(`Optimized aggregation: ${executionTimes.optimized}ms`);
    console.log(`Station analytics: ${executionTimes.station}ms`);
    console.log(`Rating distribution: ${executionTimes.distribution}ms`);
    console.log(`Recent reviews: ${executionTimes.recent}ms`);
    console.log(`Common ratings: ${executionTimes.commonRatings}ms`);
    console.log(`\nResults saved to: ${RESULTS_DIR}`);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Execute the aggregation pipelines
if (require.main === module) {
  runAggregationPipelines()
    .then(() => console.log('Aggregation pipelines completed'))
    .catch(err => console.error('Error running aggregation pipelines:', err));
}

module.exports = { runAggregationPipelines }; 