require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/rate_lowry";
const client = new MongoClient(uri);

// Sample data for tests
const testStations = [
  'Main Line', 'Grill', 'Pizza', 'International', 'Deli', 'Salad Bar', 'Dessert'
];

const testFoodItems = [
  'Burger', 'Pizza', 'Salad', 'Sandwich', 'Pasta', 'Tacos', 'Ice Cream', 'Soup',
  'Fries', 'Chicken Tenders', 'Stir Fry', 'Sushi', 'Curry', 'Pancakes'
];

const testComments = [
  "Really enjoyed this dish!",
  "Not my favorite, but decent.",
  "Absolutely delicious, will get again!",
  "Portion size was too small for the price.",
  "Great flavor but a bit too salty.",
  "Perfect comfort food on a cold day.",
  "Wish they'd serve this more often.",
  "Consistently good every time.",
  "Was expecting better based on others' reviews.",
  "A solid choice when nothing else looks appealing."
];

/**
 * Generate random test data for performance testing
 * @param {number} count Number of test reviews to generate
 */
async function generateTestData(count = 1000) {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('rate_lowry');
    const reviewsCollection = db.collection('reviews');
    
    // Check if test data already exists
    const existingCount = await reviewsCollection.countDocuments();
    console.log(`Database already contains ${existingCount} reviews`);
    
    if (existingCount >= count) {
      console.log(`Sufficient test data already exists. No new data generated.`);
      return;
    }
    
    const remainingCount = count - existingCount;
    console.log(`Generating ${remainingCount} test reviews...`);
    
    const reviews = [];
    
    // Generate sample reviews
    for (let i = 0; i < remainingCount; i++) {
      // Create reviews with some patterns to test indexing efficiency
      const stationIndex = i % testStations.length;
      const foodItemIndex = i % testFoodItems.length;
      
      // Create a date within the last 90 days for time-based queries
      const date = new Date();
      date.setDate(date.getDate() - (i % 90));
      
      // Create test review
      reviews.push({
        foodItem: testFoodItems[foodItemIndex],
        station: testStations[stationIndex],
        rating: Math.floor(Math.random() * 5) + 1,
        comment: testComments[i % testComments.length],
        reviewer: `Tester-${Math.floor(Math.random() * 1000)}`,
        createdAt: date,
        isActive: Math.random() > 0.05  // 5% chance of being "deleted"
      });
      
      // Add batch to database every 1000 reviews
      if (reviews.length === 1000 || i === remainingCount - 1) {
        await reviewsCollection.insertMany(reviews);
        console.log(`Inserted batch of ${reviews.length} reviews`);
        reviews.length = 0; // Clear array for next batch
      }
    }
    
    const finalCount = await reviewsCollection.countDocuments();
    console.log(`Test data generation complete. Total reviews: ${finalCount}`);
    
  } catch (error) {
    console.error('Error generating test data:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Execute if this script is run directly
if (require.main === module) {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 1000;
  generateTestData(count)
    .then(() => console.log('Test data generation completed'))
    .catch(err => console.error('Error:', err));
}

module.exports = { generateTestData }; 