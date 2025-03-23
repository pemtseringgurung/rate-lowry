# Rate Lowry - Food Review App

## Overview
A modern web application designed to help College of Wooster students rate and review food at Lowry Cafeteria. This interactive platform allows users to browse food items by station, submit reviews with photos, and share their dining experiences.

## Key Features

### Food Rating System
- Browse food items by station
- View average ratings for each food item
- Read detailed reviews from other users
- Submit your own ratings on a scale of 1-5

### Photo Reviews
- Upload food photos using Cloudinary integration
- View image previews before submission
- Browse food items with their associated photos
- View full-size images in a modal display

### User Interface
- Modern yellow and white theme
- Clean, intuitive card-based design
- Responsive layout for mobile and desktop
- Station-based navigation

### Review Management
- Add reviews for any food item
- Include optional reviewer name
- Add comments and star ratings
- Browse all reviews for a specific food item

## Technical Stack
- Next.js for server-side rendering
- MongoDB for database
- Cloudinary for image storage and optimization
- Tailwind CSS for styling
- Vercel for deployment

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rate-lowry.git
cd rate-lowry
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment

The application is deployed on Vercel. To deploy your own instance:

1. Push your code to a GitHub repository
2. Import the repository in the Vercel dashboard
3. Add the environment variables in Vercel's project settings
4. Deploy the application

## Usage

### Adding a Review
1. Navigate to the homepage
2. Select a station or browse "All Stations"
3. Click on a food item or "Add New Review" button
4. Fill out the review form, including an optional photo
5. Submit the review

### Browsing Reviews
1. Navigate to the homepage
2. Select a station to filter food items
3. Click on a food item to see all its reviews
4. View photos by clicking on them to open the modal

## Development Commands
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Run production build locally
```

## Features Implementation Details

### Image Integration
- Images are uploaded to Cloudinary for storage and optimization
- Automatic image resizing and quality adjustment
- Lazy loading for better performance
- Fallback display for unavailable images

### Review System
- MongoDB storage for reviews
- Star-based rating system (1-5 stars)
- Optional reviewer name field
- Timestamp tracking for all reviews

### UI Components
- Card-based design for food items
- Modal display for enlarged images
- Station-based navigation tabs
- Loading state indicators

## Future Enhancements
- User authentication system
- Reply to reviews functionality
- Advanced sorting and filtering options
- Nutritional information integration
- Favorite food items feature
- Weekly menu predictions
- Mobile app version
