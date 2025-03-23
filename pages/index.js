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

  return (
    <Layout title="Rate Lowry - Food Reviews at Lowry Cafeteria" description="Find and rate food items at Lowry Cafeteria dining hall">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-10 overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-amber-50 to-yellow-50 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold text-gray-800 mb-3 font-['Plus_Jakarta_Sans']">Find & Rate Food at Lowry</h1>
            <p className="text-gray-600 mb-8 max-w-2xl">See what others are saying about the food options at Lowry Cafeteria and share your own experiences.</p>
          </div>
        </div>
        
        <div className="px-8 py-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-3xl mx-auto relative">
            <h2 className="text-white text-xl font-semibold mb-4 font-['Plus_Jakarta_Sans']">Select a Dining Station</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedStation('all')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedStation === 'all'
                    ? 'bg-white text-amber-600 shadow-md'
                    : 'bg-amber-400 hover:bg-amber-300 text-white'
                }`}
              >
                All Stations
              </button>
            
              {stations.map((station) => (
                <button
                  key={station._id}
                  onClick={() => setSelectedStation(station.name)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedStation === station.name
                      ? 'bg-white text-amber-600 shadow-md'
                      : 'bg-amber-400 hover:bg-amber-300 text-white'
                  }`}
                >
                  {station.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center font-['Plus_Jakarta_Sans']">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        {selectedStation === 'all' ? 'All Food Items' : `Food Items at ${selectedStation}`}
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-20">
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
      ) : foodItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3 font-['Plus_Jakarta_Sans']">No food items found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {selectedStation === 'all' 
              ? "There are no reviews yet. Be the first to add one!"
              : `There are no reviews for food at ${selectedStation} yet. Be the first to add a review!`}
          </p>
          <Link 
            href={selectedStation === 'all' ? '/new' : `/new?station=${encodeURIComponent(selectedStation)}`}
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-8 rounded-lg shadow-sm transition-all"
          >
            Add First Review
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((item) => (
            <Link
              key={`${item.foodItem}-${item.station}`}
              href={`/food/${encodeURIComponent(item.foodItem)}?station=${encodeURIComponent(item.station)}`}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col"
            >
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl}
                    alt={item.foodItem}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/600x400/f3f4f6/94a3b8?text=${encodeURIComponent(item.foodItem)}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-50">
                    <span className="text-5xl">{getFoodEmoji(item.foodItem)}</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 font-['Plus_Jakarta_Sans'] mb-1">{item.foodItem}</h3>
                <div className="text-amber-600 mb-4">{item.station}</div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex text-amber-500 mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= Math.round(item.avgRating) ? "" : "text-gray-200"}>★</span>
                      ))}
                    </div>
                    <span className="font-bold text-gray-700">
                      {item.avgRating ? item.avgRating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
} 