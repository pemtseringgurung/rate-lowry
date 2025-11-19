import Link from 'next/link';
import Head from 'next/head';

export default function Layout({ children, title, description }) {
  const defaultTitle = 'Rate Lowry - Food Ratings for Lowry Cafeteria';
  const defaultDescription = 'Rate and review food items at Lowry Cafeteria dining hall';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Head>
        <title>{title || defaultTitle}</title>
        <meta name="description" content={description || defaultDescription} />
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/logo.png?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <header className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 py-3 relative shadow-lg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center transition-transform hover:scale-105 duration-200">
              <div className="mr-3 bg-white/20 p-1.5 rounded-xl backdrop-blur-sm shadow-sm">
                <img
                  src="/logo.png"
                  alt="Rate Lowry Logo"
                  className="w-8 h-8 object-contain drop-shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'inline';
                  }}
                />
                <span className="text-2xl" style={{ display: 'none' }}>🍽️</span>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold tracking-tight font-['Plus_Jakarta_Sans'] drop-shadow-sm">Rate Lowry</h1>
                <p className="text-white text-[10px] font-medium opacity-90 tracking-wide">Rate food in Lowry Cafeteria!</p>
              </div>
            </Link>

            <Link
              href="/new"
              className="bg-white text-amber-600 hover:text-amber-700 font-bold py-2 px-4 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-xs font-['Plus_Jakarta_Sans'] border border-amber-100"
            >
              + Add Review
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex-grow max-w-7xl">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Rate Lowry.</p>
        </div>
      </footer>
    </div>
  );
}
