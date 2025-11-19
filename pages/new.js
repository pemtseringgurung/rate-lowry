import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function NewReview() {
  const router = useRouter();
  const { foodItem: initialFoodItem, station: initialStation } = router.query;
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: null });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    foodItem: '',
    station: '',
    rating: 3,
    comment: '',
    reviewer: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (initialFoodItem) {
      setFormData(prev => ({ ...prev, foodItem: initialFoodItem }));
    }
    if (initialStation) {
      setFormData(prev => ({ ...prev, station: initialStation }));
    }
  }, [initialFoodItem, initialStation]);

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
      }
    };

    fetchStations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadStatus({ loading: true, error: null });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      setUploadStatus({ loading: false, error: null });
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus({ loading: false, error: 'Failed to upload image. Please try again.' });
    }
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
    <Layout title="Add a New Review - Rate Lowry" description="Add a new food review at Lowry dining hall">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium flex items-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <h1 className="text-3xl font-bold relative z-10 font-['Plus_Jakarta_Sans']">Add a Review</h1>
            <p className="text-amber-100 mt-2 relative z-10">Share your thoughts on the food at Lowry!</p>
          </div>

          <div className="p-8 md:p-10">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="foodItem" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Food Item
                  </label>
                  <input
                    type="text"
                    id="foodItem"
                    name="foodItem"
                    value={formData.foodItem}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none bg-gray-50 focus:bg-white"
                    placeholder="e.g. Pepperoni Pizza"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="station" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Station
                  </label>
                  <select
                    id="station"
                    name="station"
                    value={formData.station}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none bg-gray-50 focus:bg-white appearance-none"
                  >
                    <option value="">Select a station</option>
                    {stations.map((station) => (
                      <option key={station._id} value={station.name}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Rating
                </label>
                <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none transform transition-transform hover:scale-110"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-10 w-10 ${formData.rating >= star ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={formData.rating >= star ? 0 : 1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-4 text-lg font-bold text-gray-700 bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="comment" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Comment (Optional)
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none bg-gray-50 focus:bg-white resize-none"
                  placeholder="What did you think about the food?"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label htmlFor="reviewer" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  id="reviewer"
                  name="reviewer"
                  value={formData.reviewer}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none bg-gray-50 focus:bg-white"
                  placeholder="Anonymous"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Photo (Optional)
                </label>

                <div className="flex items-center space-x-4">
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all group overflow-hidden relative bg-gray-50"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 group-hover:text-amber-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs text-gray-500 group-hover:text-amber-600 font-medium">Add Photo</span>
                      </>
                    )}

                    {uploadStatus.loading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500 mb-2">Upload a photo of your meal to help others see what it looks like.</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="text-sm text-amber-600 font-bold hover:text-amber-700 hover:underline"
                    >
                      Choose a file
                    </button>
                  </div>
                </div>
                {uploadStatus.error && <p className="text-red-500 text-sm mt-1">{uploadStatus.error}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || uploadStatus.loading}
                  className={`w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${(loading || uploadStatus.loading) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        </div>
      </div>
    </Layout>
  );
}