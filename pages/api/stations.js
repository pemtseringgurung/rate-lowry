import clientPromise from '../../lib/mongodb';

// Fallback data when MongoDB is not available
const fallbackStations = [
  { _id: '1', name: 'Grill Station', createdAt: new Date() },
  { _id: '2', name: 'Pizza Station', createdAt: new Date() },
  { _id: '3', name: 'Salad Bar', createdAt: new Date() },
  { _id: '4', name: 'Asian Station', createdAt: new Date() },
  { _id: '5', name: 'Dessert Station', createdAt: new Date() },
];

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('rate_lowry');

    if (req.method === 'GET') {
      try {
        const stations = await db.collection('stations').find({}).toArray();
        res.status(200).json(stations.length > 0 ? stations : fallbackStations);
      } catch (dbError) {
        console.log('MongoDB not available, using fallback data');
        res.status(200).json(fallbackStations);
      }
    } else if (req.method === 'POST') {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Station name is required' });
      }
      
      const result = await db.collection('stations').insertOne({
        name,
        createdAt: new Date()
      });
      
      res.status(201).json({ success: true, stationId: result.insertedId });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    // Fallback to mock data
    if (req.method === 'GET') {
      res.status(200).json(fallbackStations);
    } else {
      res.status(500).json({ error: 'An error occurred' });
    }
  }
} 