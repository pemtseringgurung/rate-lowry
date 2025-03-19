import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

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
  
  const getFoodEmoji = (foodName) => {
    const foodName_lower = foodName?.toLowerCase() || '';
    
    if (foodName_lower.includes('pizza')) return '🍕';
    if (foodName_lower.includes('burger')) return '🍔';
    if (foodName_lower.includes('salad')) return '🥗';
    if (foodName_lower.includes('pasta')) return '🍝';
    if (foodName_lower.includes('chicken')) return '🍗';
    if (foodName_lower.includes('sandwich')) return '🥪';
    if (foodName_lower.includes('taco')) return '🌮';
    if (foodName_lower.includes('ice cream') || foodName_lower.includes('dessert')) return '🍦';
    if (foodName_lower.includes('cake')) return '🍰';
    if (foodName_lower.includes('cookie')) return '🍪';
    
    return '🍲';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-yellow-500 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between">
            {/* Logo and Name */}
            <Link href="/" className="flex items-center">
              <div className="bg-white p-2 rounded-md shadow-sm mr-3 transform transition-all hover:translate-y-[-2px]">
                <span className="text-2xl">🍴</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Rate <span className="text-white border-b-2 border-white/70 pb-0.5">Lowry</span>
              </h1>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="font-medium text-white hover:text-white/80 transition-colors px-3 py-2">
                Home
              </Link>
              
              {/* Add Review Button */}
              <Link 
                href={`/new?foodItem=${encodeURIComponent(foodItem || '')}&station=${encodeURIComponent(station || '')}`}
                className="bg-white text-yellow-600 hover:bg-yellow-50 py-2 px-4 rounded-md font-medium transition-all flex items-center"
              >
                <span>Add Review</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to all foods
          </Link>
        </div>
        
        {/* Food Item Header */}
        <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-yellow-50 p-5 rounded-md flex-shrink-0">
              <span className="text-5xl">{getFoodEmoji(foodItem)}</span>
            </div>
            
            <div className="flex-grow text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{foodItem}</h1>
              <div className="inline-flex bg-yellow-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                {station}
              </div>
              
              <div className="mt-3 flex items-center justify-center sm:justify-start">
                <div className="flex text-lg text-yellow-500 mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= Math.round(avgRating) ? "" : "text-gray-200"}>★</span>
                  ))}
                </div>
                <span className="text-xl font-bold text-gray-700">
                  {avgRating ? avgRating.toFixed(1) : 'N/A'}
                </span>
                <span className="ml-2 text-gray-500">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
            
            <div className="sm:ml-auto mt-4 sm:mt-0">
              <Link
                href={`/new?foodItem=${encodeURIComponent(foodItem || '')}&station=${encodeURIComponent(station || '')}`}
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-5 rounded-md transition-all"
              >
                Write a Review
              </Link>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-md animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md border-l-4 border-red-400">
            <p>Oops! Something went wrong: {error}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Be the first to share your thoughts about this food item!
            </p>
            <Link
              href={`/new?foodItem=${encodeURIComponent(foodItem || '')}&station=${encodeURIComponent(station || '')}`}
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-md transition-all"
            >
              Write a Review
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
              Reviews
            </h2>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white border border-gray-200 rounded-md p-5 transition-all hover:border-yellow-300">
                  <div className="flex flex-wrap justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-800">
                        {review.reviewer || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </div>
                    </div>
                    <div className="flex text-yellow-500 mt-1 sm:mt-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= review.rating ? "" : "text-gray-200"}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8 pt-4 border-t border-gray-200">
              <Link
                href={`/new?foodItem=${encodeURIComponent(foodItem || '')}&station=${encodeURIComponent(station || '')}`}
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-md transition-all"
              >
                Add Your Review
              </Link>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-yellow-500 text-white py-4 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p className="font-medium">&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
} 