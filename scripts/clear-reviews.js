// This script deletes all reviews from the database
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/rate_lowry";

async function clearReviews() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('rate_lowry');
    
    // Delete all documents from the reviews collection
    const result = await db.collection('reviews').deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} reviews`);
    console.log('All reviews have been cleared from the database');
  } catch (error) {
    console.error('Error clearing reviews:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
}

// Run the function
clearReviews(); 