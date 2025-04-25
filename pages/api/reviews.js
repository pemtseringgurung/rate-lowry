import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

// In-memory queue for batch processing
const reviewQueue = [];
let processingQueue = false;
const BATCH_SIZE = 10; // Process in batches of 10
const QUEUE_PROCESS_INTERVAL = 5000; // Process queue every 5 seconds

// Process the review queue in batches
async function processReviewQueue() {
  if (processingQueue || reviewQueue.length === 0) return;
  
  processingQueue = true;
  console.log(`Processing review queue. Items: ${reviewQueue.length}`);
  
  try {
    const client = await clientPromise;
    const db = client.db('rate_lowry');
    
    // Process reviews in batches until the queue is empty
    while (reviewQueue.length > 0) {
      const batch = reviewQueue.splice(0, Math.min(BATCH_SIZE, reviewQueue.length));
      
      if (batch.length > 0) {
        // Add createdAt timestamp to each review
        const reviewsToInsert = batch.map(review => ({
          ...review,
          createdAt: review.createdAt || new Date(),
          isActive: true // For soft delete functionality
        }));
        
        const result = await db.collection('reviews').insertMany(reviewsToInsert);
    console.log(`Batch processed: ${result.insertedCount} reviews`);
        
        // Notify any callbacks waiting for results
        batch.forEach((review, index) => {
          const insertedId = Object.values(result.insertedIds)[index];
          if (review.callback) {
            review.callback({
              success: true,
              reviewId: insertedId,
              review: { ...reviewsToInsert[index], _id: insertedId }
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Error processing review queue:', error);
    // On error, return the items to the queue to try again later
    const failedReviews = reviewQueue.splice(0);
    failedReviews.forEach(review => {
      if (review.callback) {
        review.callback({ success: false, error: 'Failed to process review' });
      }
      });
  } finally {
    processingQueue = false;
  }
}

// Start queue processing timer
setInterval(processReviewQueue, QUEUE_PROCESS_INTERVAL);

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('rate_lowry');
    
    if (req.method === 'GET') {
      const { foodItem, station, fields } = req.query;
      
      if (!foodItem && !station) {
        return res.status(400).json({ error: 'At least one filter (foodItem or station) is required' });
        }
        
      // Build query based on provided parameters
      const query = {
        isActive: { $ne: false } // Only return active (non-deleted) reviews
      };
        
      if (foodItem) query.foodItem = foodItem;
      if (station) query.station = station;
      
      // Build projection based on requested fields
      let projection = {};
      if (fields) {
        const requestedFields = fields.split(',');
        requestedFields.forEach(field => {
          projection[field.trim()] = 1;
        });
      }
      
      // If no specific fields requested, use a default projection that excludes large fields
      if (Object.keys(projection).length === 0) {
        projection = {
          foodItem: 1,
          station: 1,
          rating: 1,
          comment: 1,
          reviewer: 1, 
          createdAt: 1,
          // Exclude potentially large fields like imageUrl, unless specifically requested
        };
      }
      
      const reviews = await db.collection('reviews')
        .find(query)
        .project(projection)
        .sort({ createdAt: -1 })
        .limit(50) // Limit to 50 reviews by default for performance
        .toArray();
      
      res.status(200).json(reviews);
    } else if (req.method === 'POST') {
      const { foodItem, station, rating, comment, reviewer = "Anonymous", imageUrl = null } = req.body;
      
      // Validate required fields
      if (!foodItem || !station || !rating || !comment) {
        return res.status(400).json({ error: 'Food item, station, rating, and comment are required' });
      }
      
      // Validate rating is between 1 and 5
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      
      const newReview = {
        foodItem,
        station,
        rating,
        comment,
        reviewer,
        imageUrl,
        createdAt: new Date(),
        isActive: true  // For soft delete
      };
      
      // Check if we're in high load (queue has pending items or simulated peak time)
      const isPeakTime = reviewQueue.length > 0;
      
      if (isPeakTime) {
        // Add to queue for batch processing
        let resolvePromise;
        const responsePromise = new Promise(resolve => { resolvePromise = resolve; });
        
        reviewQueue.push({
          ...newReview,
          callback: resolvePromise
        });
        
        // Start processing if it's not already running
        if (!processingQueue && reviewQueue.length >= BATCH_SIZE) {
          processReviewQueue();
        }
        
        // Wait for the batch to be processed
        const result = await responsePromise;
        return res.status(201).json(result);
      } else {
        // Direct insert during non-peak times
        const result = await db.collection('reviews').insertOne(newReview);
        
        res.status(201).json({ 
          success: true, 
          reviewId: result.insertedId,
          review: { ...newReview, _id: result.insertedId }
        });
      }
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Review ID is required' });
      }
      
      // Use soft delete by updating isActive flag instead of removing
      const result = await db.collection('reviews').updateOne(
        { _id: new ObjectId(id) },
        { $set: { isActive: false, deletedAt: new Date() } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Review not found' });
      }
      
      res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
} 