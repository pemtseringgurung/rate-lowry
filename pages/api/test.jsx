import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('rate_lowry');
    
    await db.command({ ping: 1 });
    
    res.status(200).json({ message: 'Connected successfully to MongoDB' });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({ error: 'Failed to connect to the database', details: error.message });
  }
}