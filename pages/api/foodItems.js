import clientPromise from '../../lib/mongodb';

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minute cache TTL

// Cleanup expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, { expiry }] of cache.entries()) {
    if (expiry < now) {
      cache.delete(key);
    }
  }
}, CACHE_TTL);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { station, refresh } = req.query;
      const useCache = refresh !== 'true'; // Allow cache bypass with ?refresh=true
      
      // Create a cache key based on query parameters
      const cacheKey = `foodItems_${station || 'all'}`;
      
      // Check if we have a cached response
      if (useCache && cache.has(cacheKey)) {
        const { data, expiry } = cache.get(cacheKey);
        if (expiry > Date.now()) {
          // Return cached data with cache indicator
          return res.status(200).json({
            ...data,
            fromCache: true,
            cachedAt: new Date(expiry - CACHE_TTL).toISOString()
          });
        }
      }
      
      // Connect to database
      const client = await clientPromise;
      const db = client.db('rate_lowry');
      
      // Build query that only includes active reviews
      let query = { isActive: { $ne: false } };
      
      if (station && station !== 'all') {
        query.station = station;
      }
      
      // Get unique food items and their average ratings
      // Use hint to leverage the indexes we'll create
      const foodItems = await db.collection('reviews')
        .aggregate([
          { $match: query },
          { $group: { 
              _id: { foodItem: "$foodItem", station: "$station" },
              avgRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 },
              // Get the most recent image URL to represent this food item
              // This is more efficient than $first which is non-deterministic
              latestImage: { $max: { 
                $cond: [
                  { $ne: ["$imageUrl", null] },
                  { image: "$imageUrl", date: "$createdAt" },
                  null
                ]
              }}
            }
          },
          { $project: {
              _id: 0,
              foodItem: "$_id.foodItem",
              station: "$_id.station",
              avgRating: { $round: ["$avgRating", 1] }, // Round to 1 decimal place
              reviewCount: 1,
              imageUrl: "$latestImage.image"
            }
          },
          { $sort: { reviewCount: -1, avgRating: -1 } } // Sort by popularity & rating
        ], {
          // Hint to use the station and isActive indexes
          hint: { station: 1, isActive: 1 }
        }).toArray();
      
      // Calculate response time for metrics
      const responseData = {
        foodItems,
        total: foodItems.length,
        generatedAt: new Date().toISOString()
      };
      
      // Store in cache
      if (useCache) {
        cache.set(cacheKey, {
          data: responseData,
          expiry: Date.now() + CACHE_TTL
        });
      }
      
      res.status(200).json(responseData);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
} 