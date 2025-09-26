import Link from 'next/link';
import Head from 'next/head';

export default function Layout({ children, title, description }) {
  const defaultTitle = 'Rate Lowry - Food Ratings for Lowry Cafeteria';
  const defaultDescription = 'Rate and review food items at Lowry Cafeteria dining hall';
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>{title || defaultTitle}</title>
        <meta name="description" content={description || defaultDescription} />
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/logo.png?v=2" />
      </Head>
      
      <header className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 py-6 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center">
              <div className="mr-3">
                <img 
                  src="/logo.png" 
                  alt="Rate Lowry Logo" 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'inline';
                  }}
                />
                <span className="text-3xl" style={{display: 'none'}}>🍽️</span>
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold tracking-tight font-['Plus_Jakarta_Sans']">Rate Lowry</h1>
                <p className="text-white text-xs font-medium opacity-80 tracking-wide">Rate food in Lowry Cafeteria!</p>
              </div>
            </Link>
            
            <Link 
              href="/new" 
              className="bg-white text-amber-500 hover:text-amber-600 font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 text-sm font-['Outfit']"
              style={{ color: "#f59e0b" }}
            >
              + Add Review
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-10 flex-grow font-['Outfit']">
        {children}
      </main>
    </div>
  );
} 