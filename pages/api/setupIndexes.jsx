import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'This endpoint is disabled in production' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('rate_lowry');

    // Create indexes
    await db.collection('reviews').createIndex({ foodItem: 1 });
    await db.collection('reviews').createIndex({ station: 1 });
    await db.collection('reviews').createIndex({ createdAt: -1 });
    await db.collection('stations').createIndex({ name: 1 }, { unique: true });

    res.status(200).json({ message: 'Indexes created successfully' });
  } catch (error) {
    console.error('Error creating indexes:', error);
    res.status(500).json({ error: 'Failed to create indexes' });
  }
}