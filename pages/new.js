import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

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
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      router.push('/');
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
      setLoading(false);
    }
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
            Back to home
          </Link>
        </div>
        
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 p-6 rounded-md shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
            Add Your Review
          </h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md border-l-4 border-red-400 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="foodItem" className="block mb-2 font-medium text-gray-700">
                Food Item Name
              </label>
              <input
                type="text"
                id="foodItem"
                name="foodItem"
                value={formData.foodItem}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="e.g., Pizza, Pasta, Salad"
              />
            </div>
            
            <div>
              <label htmlFor="station" className="block mb-2 font-medium text-gray-700">
                Food Station
              </label>
              <select
                id="station"
                name="station"
                value={formData.station}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
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
                  ['Garden & Provisions', 'Hearth 66', 'Globe Wooster', 'Lemongrass', 'Zone', 'The Graden', 'The Kitchen Table', 'Mom\'s Kitchen'].map((station) => (
                    <option key={station} value={station}>
                      {station}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div>
              <span className="block mb-2 font-medium text-gray-700">
                Your Rating
              </span>
              <div className="flex flex-wrap gap-2">
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
                    <div className={`flex items-center justify-center w-10 h-10 text-lg font-bold transition-all ${
                      formData.rating === value 
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } rounded-md`}>
                      {value}
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-1 text-sm text-gray-500 flex justify-between">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="comment" className="block mb-2 font-medium text-gray-700">
                Your Comment
              </label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Share your thoughts about this food item..."
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="reviewer" className="block mb-2 font-medium text-gray-700">
                Your Name (Optional)
              </label>
              <input
                type="text"
                id="reviewer"
                name="reviewer"
                value={formData.reviewer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Anonymous"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-3 border-t">
              <Link
                href="/"
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </main>
      
      <footer className="bg-yellow-500 text-white py-4 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p className="font-medium">&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
} 