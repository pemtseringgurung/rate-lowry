import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('rate_lowry');
    
    if (req.method === 'GET') {
      const { foodItem, station } = req.query;
      
      if (!foodItem || !station) {
        return res.status(400).json({ error: 'Food item and station are required' });
      }
      
      const reviews = await db.collection('reviews')
        .find({ foodItem, station })
        .sort({ createdAt: -1 })
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
      
      const result = await db.collection('reviews').insertOne({
        foodItem,
        station,
        rating,
        comment,
        reviewer,
        imageUrl,
        createdAt: new Date()
      });
      
      res.status(201).json({ 
        success: true, 
        reviewId: result.insertedId,
        review: {
          foodItem,
          station,
          rating,
          comment,
          reviewer,
          imageUrl,
          createdAt: new Date()
        }
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
} 