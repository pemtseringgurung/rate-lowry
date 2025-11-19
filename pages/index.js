import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

// Helper function to get food emoji
const getFoodEmoji = (foodName) => {
  const foodEmojis = {
    'pizza': '🍕',
    'burger': '🍔',
    'salad': '🥗',
    'pasta': '🍝',
    'sandwich': '🥪',
    'soup': '🍲',
    'rice': '🍚',
    'chicken': '🍗',
    'steak': '🥩',
    'fish': '🐟',
    'dessert': '🍰',
    'cake': '🎂',
    'cookie': '🍪',
    'fruit': '🍎',
    'ice cream': '🍦',
  };

  // Check if the food name includes any of the known food keywords
  const lowerFoodName = foodName.toLowerCase();
  for (const [keyword, emoji] of Object.entries(foodEmojis)) {
    if (lowerFoodName.includes(keyword)) {
      return emoji;
    }
  }

  // Default emoji
  return '🍽️';
};

export default function HomePage() {
  const [selectedStation, setSelectedStation] = useState('all');
  const [stations, setStations] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stations
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
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Fetch food items when station changes
  useEffect(() => {
    const fetchFoodItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = selectedStation === 'all'
          ? '/api/foodItems'
          : `/api/foodItems?station=${encodeURIComponent(selectedStation)}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch food items');
        }

        const data = await response.json();
        setFoodItems(data.foodItems || []); // Access the foodItems property from the response
        setLoading(false);
      } catch (error) {
        console.error('Error fetching food items:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, [selectedStation]);

  return (
    <Layout title="Rate Lowry - Food Reviews at Lowry Cafeteria" description="Find and rate food items at Lowry Cafeteria dining hall">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden transform transition-all hover:shadow-2xl duration-500">
        <div className="p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-600 text-xs font-bold tracking-wider uppercase mb-2">Wooster Dining</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 font-['Plus_Jakarta_Sans'] tracking-tight leading-tight">
              Find & Rate Food at <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Lowry</span>
            </h1>
            <p className="text-gray-600 mb-4 max-w-2xl text-base leading-relaxed">
              See what others are saying about the food options at Lowry Cafeteria and share your own culinary experiences.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-white border-t border-gray-100 relative">
          <div className="max-w-4xl relative">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Filter by Station</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStation('all')}
                className={`px-4 py-2 rounded-full font-semibold text-xs transition-all duration-200 ${selectedStation === 'all'
                  ? 'bg-gray-900 text-white shadow-lg transform -translate-y-0.5'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
              >
                All Stations
              </button>

              {stations.map((station) => (
                <button
                  key={station._id}
                  onClick={() => setSelectedStation(station.name)}
                  className={`px-4 py-2 rounded-full font-semibold text-xs transition-all duration-200 ${selectedStation === station.name
                    ? 'bg-gray-900 text-white shadow-lg transform -translate-y-0.5'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                >
                  {station.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center font-['Plus_Jakarta_Sans']">
          <span className="bg-amber-100 text-amber-600 p-2 rounded-lg mr-3 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </span>
          {selectedStation === 'all' ? 'All Food Items' : `Food Items at ${selectedStation}`}
        </h2>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
          {foodItems.length} items
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium animate-pulse">Loading delicious items...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-500 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : foodItems.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="text-7xl mb-6 opacity-50 grayscale">🍽️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 font-['Plus_Jakarta_Sans']">No food items found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
            {selectedStation === 'all'
              ? "There are no reviews yet. Be the first to add one!"
              : `There are no reviews for food at ${selectedStation} yet. Be the first to add a review!`}
          </p>
          <Link
            href={selectedStation === 'all' ? '/new' : `/new?station=${encodeURIComponent(selectedStation)}`}
            className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-1"
          >
            Add First Review
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {foodItems.map((item) => (
            <Link
              key={`${item.foodItem}-${item.station}`}
              href={`/food/${encodeURIComponent(item.foodItem)}?station=${encodeURIComponent(item.station)}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
            >
              <div className="h-52 bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.foodItem}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/600x400/f3f4f6/94a3b8?text=${encodeURIComponent(item.foodItem)}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-50/50">
                    <span className="text-6xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm filter grayscale-[0.2] group-hover:grayscale-0">
                      {getFoodEmoji(item.foodItem)}
                    </span>
                  </div>
                )}

                <div className="absolute top-3 right-3 z-20">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-white/50">
                    {item.station}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {item.foodItem}
                  </h3>

                  <div className="flex items-center justify-between mt-4 mb-2">
                    <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                      <span className="text-amber-500 text-sm mr-1">★</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {item.avgRating ? item.avgRating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
