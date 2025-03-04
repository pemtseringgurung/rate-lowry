import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('rate_lowry');

    if (req.method === 'GET') {
      const { foodItem, station } = req.query;
      let query = {};
      
      if (foodItem) query.foodItem = foodItem;
      if (station && station !== 'all') query.station = station;
      
      const reviews = await db.collection('reviews').find(query).sort({ createdAt: -1 }).toArray();
      res.status(200).json(reviews);
    } 
    else if (req.method === 'POST') {
      const { foodItem, station, rating, content, username } = req.body;
      
      if (!foodItem || !station || !rating || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const newReview = {
        foodItem,
        station,
        rating: parseInt(rating),
        content,
        username: username || 'Anonymous',
        createdAt: new Date()
      };
      
      const result = await db.collection('reviews').insertOne(newReview);
      res.status(201).json({ success: true, reviewId: result.insertedId });
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}