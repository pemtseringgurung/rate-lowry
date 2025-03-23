import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function NewReview() {
  const router = useRouter();
  const { foodItem: initialFoodItem, station: initialStation } = router.query;
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    foodItem: '',
    station: '',
    rating: 3,
    comment: '',
    reviewer: ''
  });

  // Update form data when URL parameters change
  useEffect(() => {
    if (initialFoodItem) {
      setFormData(prev => ({ ...prev, foodItem: initialFoodItem }));
    }
    if (initialStation) {
      setFormData(prev => ({ ...prev, station: initialStation }));
    }
  }, [initialFoodItem, initialStation]);

  // Fetch available stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error('Error fetching stations:', error);
        setError('Failed to load stations. Please try again later.');
      }
    };

    fetchStations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Use "Anonymous" as default if reviewer field is empty
      const reviewerName = formData.reviewer.trim() || "Anonymous";
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          reviewer: reviewerName,
          createdAt: new Date()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
      
      // Redirect to the food item page
      router.push(`/food/${encodeURIComponent(formData.foodItem)}?station=${encodeURIComponent(formData.station)}`);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Layout title="Add a New Review - Rate Lowry" description="Add a new food review at Lowry dining hall">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 rounded-2xl"></div>
        <div className="relative">
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-br from-amber-500 to-yellow-400 p-3 rounded-lg shadow-md mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Add a New Review</h1>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 mb-6 rounded-xl border border-red-100">
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-semibold">Error</span>
              </div>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="foodItem" className="block mb-2 font-medium text-gray-700 font-['Plus_Jakarta_Sans']">
                Food Item Name
              </label>
              <input
                type="text"
                id="foodItem"
                name="foodItem"
                value={formData.foodItem}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="e.g., Pizza, Pasta, Salad"
              />
            </div>
            
            <div>
              <label htmlFor="station" className="block mb-2 font-medium text-gray-700 font-['Plus_Jakarta_Sans']">
                Food Station
              </label>
              <div className="relative">
                <select
                  id="station"
                  name="station"
                  value={formData.station}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Select a station</option>
                  {/* Use hardcoded station options in case the API fails */}
                  {stations.length > 0 ? (
                    stations.map((station) => (
                      <option key={station._id} value={station.name}>
                        {station.name}
                      </option>
                    ))
                  ) : (
                    ['Garden & Provisions', 'Hearth 66', 'Globe Wooster', 'Lemongrass', 'Zone', 'The Garden', 'The Kitchen Table', 'Mom\'s Kitchen'].map((station) => (
                      <option key={station} value={station}>
                        {station}
                      </option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <span className="block mb-3 font-medium text-gray-700 font-['Plus_Jakarta_Sans']">
                Your Rating
              </span>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={value}
                      checked={formData.rating === value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`flex items-center justify-center w-12 h-12 text-lg font-bold transition-all rounded-full ${
                      formData.rating === value 
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-400 text-white ring-2 ring-amber-300 ring-offset-2'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}>
                      {value}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="comment" className="block mb-2 font-medium text-gray-700 font-['Plus_Jakarta_Sans']">
                Your Comment
              </label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="How was the food? What did you like or dislike about it?"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="reviewer" className="block mb-2 font-medium text-gray-700 font-['Plus_Jakarta_Sans']">
                Your Name <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="reviewer"
                name="reviewer"
                value={formData.reviewer}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="Leave blank to post anonymously"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </div>
                ) : 'Submit Review'}
              </button>
              <Link
                href="/"
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all text-center border border-gray-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 