import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [selectedStation, setSelectedStation] = useState('all');
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFoodItems = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const query = selectedStation !== 'all' ? `?station=${selectedStation}` : '';
        const response = await fetch(`/api/foodItems${query}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch food items');
        }
        
        const data = await response.json();
        setFoodItems(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching food items:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchFoodItems();
  }, [selectedStation]);
  
  const handleStationChange = (station) => {
    setSelectedStation(station);
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <header className="bg-yellow-500 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between">
            {/* Logo and Name Section */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center" onClick={() => setSelectedStation('all')}>
                <div className="bg-white p-2 rounded-md shadow-sm mr-3 transform transition-all hover:translate-y-[-2px]">
                  <span className="text-2xl">🍴</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Rate <span className="text-white border-b-2 border-white/70 pb-0.5">Lowry</span>
                </h1>
              </Link>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="font-medium text-white hover:text-white/80 transition-colors px-3 py-2">
                Home
              </Link>
              
              {/* Add Review Button */}
              <Link 
                href="/new" 
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
        {/* Station Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            <button
              onClick={() => handleStationChange('all')}
              className={`px-4 py-2 transition-all ${
                selectedStation === 'all'
                  ? 'bg-yellow-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } rounded-md w-full`}
            >
              All Stations
            </button>
            
            {['Garden & Provisions', 'Hearth 66', 'Globe Wooster', 'Lemongrass', 'Zone', 'The Graden', 'The Kitchen Table', 'Mom\'s Kitchen'].map(station => (
              <button
                key={station}
                onClick={() => handleStationChange(station)}
                className={`px-4 py-2 transition-all whitespace-nowrap ${
                  selectedStation === station
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } rounded-md w-full overflow-hidden text-ellipsis`}
              >
                {station}
              </button>
            ))}
          </div>
        </div>
        
        {/* Food Items Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-md animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md border-l-4 border-red-400">
            <p>Oops! Something went wrong: {error}</p>
          </div>
        ) : foodItems.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No food items found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {selectedStation === 'all' 
                ? "Looks like there aren't any reviews yet!" 
                : `Looks like no one has reviewed food from ${selectedStation} yet!`}
            </p>
            <Link 
              href="/new" 
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-md transition-all"
            >
              Be the first reviewer
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedStation === 'all' ? 'Popular Food Items' : `Food at ${selectedStation}`}
            </h2>
            
            {/* Food items grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems.map((item) => (
                <div 
                  key={`${item.foodItem}-${item.station}`} 
                  className="overflow-hidden rounded-md"
                >
                  {/* Food image container */}
                  <div className="h-48 bg-[#fffbeb] flex items-center justify-center relative">
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <span className="text-4xl">{getFoodEmoji(item.foodItem)}</span>
                    </div>
                    <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 text-sm font-medium">
                      {item.station}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white border border-gray-200 border-t-0">
                    <h3 className="text-lg font-bold mb-2 text-gray-800">{item.foodItem}</h3>
                    
                    {/* Rating display */}
                    <div className="flex items-center mb-4">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= Math.round(item.avgRating || 0) ? "text-yellow-500" : "text-gray-200"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-600 font-medium">
                        {item.avgRating ? Number(item.avgRating).toFixed(1) : 'Unrated'} 
                      </span>
                      <span className="ml-auto text-sm text-gray-500">
                        {item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                    
                    {/* View Reviews button */}
                    <Link 
                      href={`/food/${encodeURIComponent(item.foodItem)}?station=${encodeURIComponent(item.station)}`}
                      className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-md transition-colors"
                    >
                      Read Reviews
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
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

// Helper function to get emoji based on food name
function getFoodEmoji(foodName) {
  const foodName_lower = foodName.toLowerCase();
  
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
}
