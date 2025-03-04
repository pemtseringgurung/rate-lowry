import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('rate_lowry');

    if (req.method === 'GET') {
      const stations = await db.collection('stations').find({}).toArray();
      res.status(200).json(stations);
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
    res.status(500).json({ error: 'An error occurred' });
  }
}