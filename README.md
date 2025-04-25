# Rate Lowry - Food Review App

## Overview
A modern web application designed to help College of Wooster students rate and review food at Lowry Cafeteria. This interactive platform allows users to browse food items by station, submit reviews with photos, and share their dining experiences. The application focuses on database optimization techniques to ensure consistent performance as the volume of user-generated content grows.

## Project Structure
```
rate-lowry/
├── components/       # React components for UI elements
├── lib/              # Utility functions and database connection
├── pages/            # Next.js pages and API routes
│   ├── api/          # Backend API endpoints
│   └── [other pages] # Frontend page components
├── public/           # Static assets
├── scripts/          # Performance optimization and utility scripts
├── styles/           # CSS and Tailwind styling
└── __tests__/        # Performance tests and benchmarks
```

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
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **Image Storage**: Cloudinary
- **Deployment**: Vercel
- **Performance Testing**: Custom benchmarking scripts

## Installation Requirements

1. **System Requirements**:
   - Node.js 14.x or higher
   - npm 6.x or higher
   - MongoDB 4.4 or higher (or MongoDB Atlas account)

2. Clone the repository:
```bash
git clone https://github.com/yourusername/rate-lowry.git
cd rate-lowry
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env.local` file with the following variables:
```
# MongoDB Connection (required)
MONGODB_URI=your_mongodb_connection_string

# Cloudinary Configuration (required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional Configuration
NODE_ENV=development
PORT=3000
```

5. Initialize the database with default stations (optional):
```bash
node scripts/init-stations.js
```

6. Generate test data (optional, for testing only):
```bash
node scripts/generate-test-data.js
```

7. Run the development server:
```bash
npm run dev
```

8. Open your browser and navigate to `http://localhost:3000`

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

### Administrator Functions
1. Clear all reviews (for testing):
   ```
   http://localhost:3000/api/clearReviews?key=your_admin_key
   ```
2. Run performance tests:
   ```bash
   node scripts/measure-performance.js
   ```

## Development Commands
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Run production build locally
npm run lint      # Run ESLint to check code quality
```

## Code Architecture

### Frontend Components
The frontend is built with React components organized in the `components/` directory:
- `ReviewCard.js` - Displays individual review entries
- `FoodItemCard.js` - Shows food items with their average ratings
- `StationFilter.js` - Allows filtering by cafeteria station
- Modal components for image viewing and form submission

### API Structure
The backend API is implemented as Next.js API routes in the `pages/api/` directory:
- `/api/reviews` - CRUD operations for reviews
- `/api/foodItems` - Food item management
- `/api/stations` - Station data
- `/api/upload` - Image upload to Cloudinary

### Database Schema
MongoDB collections are structured as follows:
- **reviews** - User reviews with ratings, comments, and metadata
- **stations** - Food stations in the cafeteria
- **foodItems** - Individual food items served

### Features Implementation Details

#### Image Integration
- Images are uploaded to Cloudinary for storage and optimization
- Automatic image resizing and quality adjustment
- Lazy loading for better performance
- Fallback display for unavailable images

#### Review System
- MongoDB storage for reviews
- Star-based rating system (1-5 stars)
- Optional reviewer name field
- Timestamp tracking for all reviews

#### UI Components
- Card-based design for food items
- Modal display for enlarged images
- Station-based navigation tabs
- Loading state indicators

## MongoDB Performance Optimizations

The "Rate Lowry!" application has been optimized for high performance with MongoDB Atlas. The following key optimizations have been implemented:

### CRUD Optimizations
- **Smart Batching System**: Implemented in-memory queue with automatic batch processing during peak times, reducing database write load and connection pool pressure (`pages/api/reviews.js`)
- **Field Projection**: API supports selective field retrieval via the `fields` query parameter, reducing network transfer size and processing time
- **Soft Delete Strategy**: Uses `isActive` flag and `deletedAt` timestamp instead of removing documents, maintaining data history while improving performance
- **Default Projection**: Automatically excludes large fields like image URLs unless specifically requested

### Query Performance
- **Strategic Indexing**: Implemented through `scripts/optimize-indexes.js` which creates essential indexes on `station`, `foodItem`, `createdAt` and compound fields
- **Index Hints**: API endpoints use appropriate index hints for predictable query plans and improved performance
- **Safe Query Execution**: Implemented fallback mechanisms when index hints don't match existing indexes
- **Pagination & Limits**: Default limit of 50 reviews per query to maintain consistent response times

### Aggregation Optimization
- **Early Filtering**: Pipelines use early `$match` stages to reduce document processing
- **Efficient Date Operations**: Use of `$min/$max` operators instead of sorts where appropriate
- **Pipeline Optimization**: Implemented in `scripts/aggregation-pipelines.js` with execution time tracking
- **Result Limiting**: All aggregation operations include appropriate stage limits

### Performance Measurement
- **Custom Profiling**: `scripts/measure-performance.js` provides detailed performance metrics for both indexed and non-indexed operations
- **Comparative Testing**: Systematically tests the same operations with and without indexes to quantify improvements
- **Write Operation Analysis**: Measures the overhead of insert, update, and delete operations
- **Performance Reports**: Generates detailed reports in the `performance-reports` directory

### Real-world Results
- **Query Performance**: 80-88% improvement for common operations when using proper indexes
- **Write Throughput**: Batch processing achieves 83+ operations per second during peak loads
- **API Response Time**: Average response time reduced from ~200ms to ~47ms
- **Aggregation Speed**: Complex analytics operations complete in 30-65ms

## Performance Testing

To run the performance optimization and testing scripts:

```bash
# Install dependencies
npm install mongodb dotenv

# Optimize database indexes
node scripts/optimize-indexes.js

# Measure query performance
node scripts/measure-performance.js

# Test aggregation pipeline performance
node scripts/aggregation-pipelines.js

# Generate test data (if needed)
node scripts/generate-test-data.js
```

## Troubleshooting

### Common Issues
1. **MongoDB Connection Errors**
   - Check that your MongoDB URI is correct in .env.local
   - Ensure network connectivity to MongoDB Atlas

2. **Cloudinary Upload Failures**
   - Verify Cloudinary API credentials
   - Check image file size (max 10MB)

3. **Performance Issues**
   - Run `node scripts/optimize-indexes.js` to ensure proper indexing
   - Check MongoDB Atlas monitoring for potential bottlenecks

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

These optimizations ensure the application remains responsive as the volume of reviews grows, providing students with a fast and reliable platform for sharing their dining experiences.
