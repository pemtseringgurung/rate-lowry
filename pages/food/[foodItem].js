import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function FoodItemPage() {
  const router = useRouter();
  const { foodItem, station } = router.query;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!foodItem || !station) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/reviews?foodItem=${encodeURIComponent(foodItem)}&station=${encodeURIComponent(station)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data);
        
        // Calculate average rating
        if (data.length > 0) {
          const total = data.reduce((sum, review) => sum + review.rating, 0);
          setAvgRating(total / data.length);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [foodItem, station]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout
      title={foodItem ? `${foodItem} at ${station} - Rate Lowry` : 'Food Details - Rate Lowry'}
      description={`Reviews for ${foodItem} at ${station}`}
    >
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-amber-600 hover:text-amber-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to All Foods
        </Link>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 rounded-2xl"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="bg-amber-50 w-28 h-28 flex items-center justify-center rounded-full p-4 shrink-0">
            <span className="text-5xl" role="img" aria-label="Food emoji">🍽️</span>
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-['Plus_Jakarta_Sans']">{foodItem}</h1>
            <div className="inline-flex bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              {station}
            </div>
            
            <div className="mt-4 flex items-center justify-center md:justify-start">
              <div className="flex text-xl text-amber-500 mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(avgRating) ? "" : "text-gray-200"}>★</span>
                ))}
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {avgRating ? avgRating.toFixed(1) : 'N/A'}
              </span>
              <span className="ml-2 text-gray-500">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
          
          <div className="md:ml-auto mt-6 md:mt-0">
            <Link
              href={`/new?foodItem=${encodeURIComponent(foodItem || '')}&station=${encodeURIComponent(station || '')}`}
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-all"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Write a Review
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 rounded-2xl"></div>
        <div className="relative">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center font-['Plus_Jakarta_Sans']">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Reviews
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-semibold">Error</span>
              </div>
              <p>Oops! Something went wrong: {error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3 font-['Plus_Jakarta_Sans']">No reviews yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Be the first to share your thoughts about this item!</p>
              <Link 
                href={`/new?foodItem=${encodeURIComponent(foodItem || '')}&station=${encodeURIComponent(station || '')}`} 
                className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-8 rounded-lg shadow-sm transition-all"
              >
                Write a Review
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-gray-50 p-6 rounded-xl border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex items-center mb-3">
                    <div className="flex text-amber-500 mr-2 text-xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= review.rating ? "" : "text-gray-200"}>★</span>
                      ))}
                    </div>
                    <span className="text-gray-700 font-medium ml-1">{review.rating}/5</span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 text-lg">{review.comment}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                    <div className="flex items-center">
                      <div className="bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center text-amber-600 font-bold mr-2">
                        {review.reviewer.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700 font-['Plus_Jakarta_Sans']">{review.reviewer}</span>
                    </div>
                    <span className="text-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 