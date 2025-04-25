require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/rate_lowry";
const client = new MongoClient(uri);

/**
 * Optimizes MongoDB indexes for the Rate Lowry application
 * This script will:
 * 1. Create essential indexes if they don't exist
 * 2. Analyze existing indexes for potential improvements
 * 3. Measure performance impact of indexes
 */
async function optimizeIndexes() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('rate_lowry');
    const reviewsCollection = db.collection('reviews');
    
    // Get existing indexes to avoid recreating them
    console.log('Checking existing indexes...');
    const existingIndexes = await reviewsCollection.indexes();
    console.log(`Found ${existingIndexes.length} existing indexes`);
    
    // Extract existing index keys and names for better comparison
    const existingIndexKeys = existingIndexes.map(index => ({
      keys: index.key ? Object.keys(index.key).sort().join(',') : '',
      name: index.name
    }));
    
    console.log('Existing indexes:');
    existingIndexes.forEach(index => {
      const keyInfo = index.key ? Object.entries(index.key).map(([k, v]) => `${k}:${v}`).join(', ') : 'unknown';
      console.log(`- ${index.name}: { ${keyInfo} }`);
    });
    
    // Define essential indexes for our application
    const requiredIndexes = [
      { 
        key: { station: 1 }, 
        name: 'idx_station',
        description: 'Speeds up queries filtering by station'
      },
      { 
        key: { foodItem: 1 }, 
        name: 'idx_foodItem',
        description: 'Speeds up queries filtering by food item'
      },
      { 
        key: { station: 1, foodItem: 1 }, 
        name: 'idx_station_foodItem',
        description: 'Supports queries filtering by both station and food item'
      },
      { 
        key: { createdAt: -1 }, 
        name: 'idx_createdAt',
        description: 'Supports time-based queries and sorting by date'
      },
      { 
        key: { isActive: 1 }, 
        name: 'idx_isActive',
        description: 'Supports queries filtering out "deleted" reviews'
      },
      { 
        key: { station: 1, isActive: 1 }, 
        name: 'idx_station_isActive',
        description: 'Optimizes queries for active reviews by station'
      },
      { 
        key: { foodItem: 1, isActive: 1 }, 
        name: 'idx_foodItem_isActive',
        description: 'Optimizes queries for active reviews by food item'
      },
      { 
        key: { isActive: 1, createdAt: -1 }, 
        name: 'idx_isActive_createdAt',
        description: 'Optimizes time-based queries for active reviews'
      }
    ];
    
    // Create missing indexes
    console.log('\nChecking for missing indexes...');
    let indexesCreated = 0;
    let indexesSkipped = 0;
    
    for (const indexDef of requiredIndexes) {
      // Check if index with this name already exists
      const nameExists = existingIndexes.some(idx => idx.name === indexDef.name);
      
      // Check if similar index exists (same fields, possibly different order or name)
      const indexKeys = Object.keys(indexDef.key).sort().join(',');
      const similarExists = existingIndexKeys.some(idx => idx.keys === indexKeys);
      
      if (nameExists) {
        console.log(`Index already exists with name: ${indexDef.name}`);
        indexesSkipped++;
      } else if (similarExists) {
        console.log(`Similar index already exists for: ${Object.entries(indexDef.key).map(([k, v]) => `${k}:${v}`).join(', ')}`);
        indexesSkipped++;
      } else {
        try {
          console.log(`Creating index: ${indexDef.name} - ${indexDef.description}`);
          await reviewsCollection.createIndex(indexDef.key, { name: indexDef.name });
          indexesCreated++;
        } catch (err) {
          console.error(`Error creating index ${indexDef.name}: ${err.message}`);
        }
      }
    }
    
    console.log(`Created ${indexesCreated} new indexes, skipped ${indexesSkipped} existing indexes`);
    
    // Analyze index usage statistics - only available on MongoDB 4.2+
    try {
      // Basic review count for statistics
      const reviewCount = await reviewsCollection.countDocuments();
      
      console.log('\nCollection Statistics:');
      console.log(`Total reviews: ${reviewCount}`);
      
      // Example queries to test index performance
      console.log('\nRunning performance tests...');
      
      // Test query filtering by station (indexed)
      console.time('station query (indexed)');
      await reviewsCollection.find({ station: 'Main Line' }).limit(10).toArray();
      console.timeEnd('station query (indexed)');
      
      // Test query filtering by foodItem (indexed)
      console.time('foodItem query (indexed)');
      await reviewsCollection.find({ foodItem: 'Pizza' }).limit(10).toArray();
      console.timeEnd('foodItem query (indexed)');
      
      // Test query with compound condition (indexed)
      console.time('compound query (indexed)');
      await reviewsCollection.find({ station: 'Main Line', isActive: true }).limit(10).toArray();
      console.timeEnd('compound query (indexed)');
      
      // Test sorting by date (indexed)
      console.time('date sort (indexed)');
      await reviewsCollection.find({}).sort({ createdAt: -1 }).limit(10).toArray();
      console.timeEnd('date sort (indexed)');
      
      // Test complex aggregation with index hint
      console.time('aggregation (with index hint)');
      await reviewsCollection.aggregate([
        { $match: { isActive: true } },
        { $group: { 
            _id: "$station", 
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" }
          } 
        },
        { $sort: { count: -1 } }
      ], { hint: { isActive: 1 } }).toArray();
      console.timeEnd('aggregation (with index hint)');
      
    } catch (err) {
      console.warn('Index usage analysis is not supported or encountered an error:', err.message);
    }
    
    console.log('\nIndexes optimization complete.');
  } catch (err) {
    console.error('Error optimizing indexes:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Execute the optimization if this script is run directly
if (require.main === module) {
  optimizeIndexes()
    .then(() => console.log('Index optimization completed'))
    .catch(err => console.error('Index optimization failed:', err));
}

module.exports = { optimizeIndexes }; 