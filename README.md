# Rate Lowry

A food review app for College of Wooster students to rate and share their dining experiences at Lowry Cafeteria.

## What It Does

Browse food items by station, see what others think, and add your own reviews with photos. Simple as that.

## Tech Stack

- Next.js + React + Tailwind CSS
- MongoDB Atlas
- Cloudinary (image uploads)
- Deployed on Vercel

## Getting Started

1. **Clone and install**
```bash
git clone https://github.com/yourusername/rate-lowry.git
cd rate-lowry
npm install
```

2. **Set up environment variables**

Create `.env.local`:
```
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Initialize the database** (optional)
```bash
node scripts/init-stations.js
```

4. **Run locally**
```bash
npm run dev
```

Visit `http://localhost:3000`

## Key Features

- Filter food by cafeteria station
- 5-star rating system
- Photo uploads with reviews
- Real-time average ratings
- Mobile-responsive design

## Performance

The app uses MongoDB indexing and aggregation pipelines to stay fast as reviews grow. Run `node scripts/optimize-indexes.js` to set up indexes, or `node scripts/measure-performance.js` to check performance metrics.

## Deploy Your Own

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## Project Structure

```
├── components/     # React UI components
├── lib/           # Database utilities
├── pages/         # Next.js pages & API routes
├── scripts/       # Database scripts & performance tools
└── styles/        # CSS & Tailwind config
```

## License

MIT
