// Script to clear all reviews from the database

const clearReviews = async () => {
  try {
    // Determine if the app is running locally or in production
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-production-url.com' 
      : 'http://localhost:3000';
    
    console.log('Clearing all reviews from the database...');
    
    const response = await fetch(`${baseUrl}/api/clearReviews`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', data.message);
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Failed to connect to the API:', error.message);
  }
};

// Run the function
clearReviews(); 