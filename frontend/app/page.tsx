import Link from 'next/link';
import { BookOpen, User, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] text-gray-800 flex flex-col font-serif">
      {/* Navbar */}
      <nav className="px-6 py-4 flex justify-between items-center glass sticky top-0 z-50 border-b border-orange-100/50">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-orange-500/20 transform rotate-3 hover:rotate-0 transition-all duration-300">
            R
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight">
            Reader Exchange
          </span>
        </div>
        <div className="space-x-4 flex items-center">
          <Link href="/guide" className="text-gray-600 hover:text-orange-600 transition-colors font-medium text-sm tracking-wide">
            How It Works
          </Link>
          <Link href="/auth/login" className="text-gray-600 hover:text-orange-600 transition-colors font-medium text-sm tracking-wide">
            Sign In
          </Link>
          <Link href="/auth/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 text-sm tracking-wide">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-200 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl space-y-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] text-gray-900 tracking-tight">
              Curated Books.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Community Exchange.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-sans font-light">
              Join a refined community of scholars and book lovers. Exchange your collection, discover rare finds, and share the joy of reading.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth/register" className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white text-lg font-medium rounded-lg shadow-xl shadow-orange-600/20 transition-all hover:-translate-y-1 flex items-center group">
              Start Exchanging <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/login" className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-lg font-medium rounded-lg shadow-sm transition-all hover:-translate-y-1">
              Browse Library
            </Link>
          </div>
          <Link href="/guide" className="text-sm text-gray-400 hover:text-orange-600 transition-colors mt-4 underline underline-offset-4 decoration-gray-200 hover:decoration-orange-300">
            Learn how it works →
          </Link>

        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mt-32 relative z-10 px-4">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-300 group">
            <div className="h-14 w-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6 text-orange-600 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Build Your Library</h3>
            <p className="text-gray-600 text-base leading-relaxed">Effortlessly catalogue your books with ISBN lookup. Track your lending history and manage your personal collection.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-300 group">
            <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
              <ArrowRight className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Seamless Exchange</h3>
            <p className="text-gray-600 text-base leading-relaxed">Request books from others in your locality. Our simplified exchange process makes sharing knowledge easy and secure.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-300 group">
            <div className="h-14 w-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform duration-300">
              <User className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Community First</h3>
            <p className="text-gray-600 text-base leading-relaxed">Connect with verified students and academicians. Build trust through our reputation system and local admin verification.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-gray-500 text-sm relative z-10 border-t border-gray-100 bg-white">
        <p>&copy; 2026 Reader Exchange. Crafted for Book Lovers.</p>
      </footer>
    </div>
  );
}
