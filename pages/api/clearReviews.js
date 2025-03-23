import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const client = await clientPromise;
    const db = client.db('rate_lowry');
    
    // Delete all reviews
    const result = await db.collection('reviews').deleteMany({});
    
    res.status(200).json({ 
      success: true, 
      message: `${result.deletedCount} reviews deleted successfully` 
    });
  } catch (error) {
    console.error('Error clearing reviews:', error);
    res.status(500).json({ error: 'Failed to clear reviews' });
  }
} 