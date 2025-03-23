import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('rate_lowry');

    if (req.method === 'GET') {
      const { station } = req.query;
      let query = {};
      
      if (station && station !== 'all') {
        query.station = station;
      }
      
      // Get unique food items and their average ratings
      const foodItems = await db.collection('reviews')
        .aggregate([
          { $match: query },
          { $group: { 
              _id: { foodItem: "$foodItem", station: "$station" },
              avgRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 }
            }
          },
          { $project: {
              _id: 0,
              foodItem: "$_id.foodItem",
              station: "$_id.station",
              avgRating: 1,
              reviewCount: 1
            }
          },
          { $sort: { foodItem: 1 } }
        ]).toArray();
      
      res.status(200).json(foodItems);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
} 