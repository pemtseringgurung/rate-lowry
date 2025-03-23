// This script initializes the database with the correct Lowry dining stations
import { MongoClient } from 'mongodb';

// MongoDB connection URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/rate_lowry";

async function initStations() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('rate_lowry');
    
    // First, drop the existing stations collection to start fresh
    try {
      await db.collection('stations').drop();
      console.log('Dropped existing stations collection');
    } catch (e) {
      console.log('No existing stations collection to drop');
    }
    
    // The correct Lowry dining stations
    const stations = [
      { name: 'Garden & Provisions', createdAt: new Date() },
      { name: 'Hearth 66', createdAt: new Date() },
      { name: 'Globe Wooster', createdAt: new Date() },
      { name: 'Lemongrass', createdAt: new Date() },
      { name: 'Zone', createdAt: new Date() },
      { name: 'The Garden', createdAt: new Date() },
      { name: 'The Kitchen Table', createdAt: new Date() },
      { name: 'Mom\'s Kitchen', createdAt: new Date() }
    ];
    
    // Insert the stations
    const result = await db.collection('stations').insertMany(stations);
    console.log(`Successfully inserted ${result.insertedCount} stations`);
    
    // Also update any existing reviews to use the correct station names
    const reviews = await db.collection('reviews').find({}).toArray();
    
    // Create a mapping of old station names to new station names
    // This is a best-guess mapping, you may need to update it
    const stationMapping = {
      'Global Kitchen': 'Globe Wooster',
      'The Grill': 'Hearth 66',
      'Salad Bar': 'Garden & Provisions',
      'Pizza': 'The Kitchen Table',
      'Desserts': 'Mom\'s Kitchen'
    };
    
    let updatedCount = 0;
    
    for (const review of reviews) {
      // If the station name is in our mapping, update it
      if (review.station && stationMapping[review.station]) {
        await db.collection('reviews').updateOne(
          { _id: review._id },
          { $set: { station: stationMapping[review.station] } }
        );
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} reviews with correct station names`);
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing stations:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the function
initStations(); 