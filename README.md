# Rate Lowry

A crowdsourced food review platform for the College of Wooster's Lowry Dining Hall. Built with Next.js, Tailwind CSS, and MongoDB.

## Architecture

The application follows a standard Next.js architecture with server-side API routes handling data persistence and client-side React components managing the UI state.

### Stack

*   **Framework**: Next.js 14 (Pages Router)
*   **Styling**: Tailwind CSS v3 with custom utility extensions
*   **Database**: MongoDB (Atlas)
*   **Image Storage**: Cloudinary
*   **Font**: Plus Jakarta Sans & Outfit via Google Fonts

### Core Components

*   **`pages/index.js`**: Main entry point. Fetches aggregated review data and handles station filtering. Implements client-side caching for performance optimization.
*   **`pages/new.js`**: Review submission interface. Handles form state, client-side validation, and image upload via the internal API.
*   **`pages/api/*`**: Serverless functions acting as the backend interface.
    *   `/api/reviews`: POST endpoint for creating new reviews.
    *   `/api/foodItems`: GET endpoint with aggregation pipelines for calculating average ratings.
    *   `/api/upload`: Multipart form handler for image uploads to Cloudinary.

## Local Development

### Prerequisites

*   Node.js 18+
*   MongoDB instance (local or Atlas)
*   Cloudinary account (for image uploads)

### Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables. Create a `.env.local` file in the root directory:
    ```env
    MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/rate_lowry
    CLOUDINARY_CLOUD_NAME=<your_cloud_name>
    CLOUDINARY_API_KEY=<your_api_key>
    CLOUDINARY_API_SECRET=<your_api_secret>
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Database Schema

The application uses a single `reviews` collection. Aggregations are performed on-the-fly to generate food item summaries.

**Review Document Structure:**
```json
{
  "_id": "ObjectId",
  "foodItem": "String (Indexed)",
  "station": "String",
  "rating": "Number (1-5)",
  "comment": "String",
  "reviewer": "String",
  "imageUrl": "String (URL)",
  "createdAt": "Date",
  "isActive": "Boolean"
}
```

## Scripts

*   `npm run dev`: Starts the Next.js development server.
*   `npm run build`: Builds the application for production.
*   `npm start`: Runs the built production application.
*   `node scripts/clear-reviews.js`: **Caution**. Truncates the `reviews` collection.

## Deployment

This project is optimized for deployment on Vercel. Ensure all environment variables are correctly set in the project settings before deployment.
