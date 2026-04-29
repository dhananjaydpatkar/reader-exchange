import Link from 'next/link';
import { BookOpen, ArrowRight, Users, CreditCard, Truck, Shield, Gift, ShoppingCart, Clock, ChevronRight, Repeat, Star, MapPin, CheckCircle } from 'lucide-react';

export const metadata = {
    title: 'How It Works — Reader Exchange',
    description: 'Learn how Reader Exchange helps you buy, sell, rent, and give away books within your local community.',
};

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-[#fdfbf7] text-gray-800 flex flex-col font-serif">
            {/* Navbar */}
            <nav className="px-6 py-4 flex justify-between items-center glass sticky top-0 z-50 border-b border-orange-100/50">
                <Link href="/" className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-orange-500/20 transform rotate-3 hover:rotate-0 transition-all duration-300">
                        R
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight">
                        Reader Exchange
                    </span>
                </Link>
                <div className="space-x-4">
                    <Link href="/auth/login" className="text-gray-600 hover:text-orange-600 transition-colors font-medium text-sm tracking-wide">
                        Sign In
                    </Link>
                    <Link href="/auth/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 text-sm tracking-wide">
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="flex-1 relative overflow-hidden">
                {/* Background Blurs */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                    <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-orange-300 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[20%] left-[-8%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[120px]" />
                    <div className="absolute top-[60%] right-[20%] w-[400px] h-[400px] bg-green-200 rounded-full blur-[120px]" />
                </div>

                {/* Hero Section */}
                <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-orange-50 border border-orange-100 rounded-full text-orange-700 text-sm font-medium mb-8">
                        <BookOpen className="h-4 w-4" />
                        <span>Platform Guide</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] text-gray-900 tracking-tight mb-6">
                        How Reader Exchange<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                            Works
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-sans font-light">
                        A community-driven platform where students, academicians, and book lovers can share, buy, rent, or give away books — all within your local area.
                    </p>
                </section>

                {/* Step-by-Step Overview */}
                <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Getting Started is Simple</h2>
                        <p className="text-gray-500 font-sans max-w-xl mx-auto">From sign-up to your first book exchange, here&apos;s how the journey looks.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: '01', icon: Users, title: 'Create an Account', desc: 'Sign up with your email, select your locality, and set up your profile. Your locality determines which books you can discover.', color: 'orange' },
                            { step: '02', icon: BookOpen, title: 'List Your Books', desc: 'Add books using their ISBN — we auto-fetch the details. Choose to sell, rent, or give them away for free.', color: 'blue' },
                            { step: '03', icon: ShoppingCart, title: 'Discover & Request', desc: 'Browse books listed by others in your area. Found something you like? Request it with a single click.', color: 'green' },
                            { step: '04', icon: Truck, title: 'Get It Delivered', desc: 'A Local Admin in your area collects the book from the owner and delivers it right to you. No courier needed.', color: 'purple' },
                        ].map((item) => (
                            <div key={item.step} className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/30 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 group">
                                <div className="absolute -top-3 -left-3 h-10 w-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {item.step}
                                </div>
                                <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 ${
                                    item.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                                    item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    item.color === 'green' ? 'bg-green-50 text-green-600' :
                                    'bg-purple-50 text-purple-600'
                                }`}>
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-sans">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Three Ways to Share */}
                <section className="relative z-10 bg-white border-y border-gray-100 py-20">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Three Ways to Share Books</h2>
                            <p className="text-gray-500 font-sans max-w-xl mx-auto">As a book owner, you decide how you want to share your books with the community.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="relative p-8 rounded-2xl border-2 border-green-100 bg-gradient-to-b from-green-50/50 to-white hover:border-green-200 transition-all duration-300 group">
                                <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
                                    <ShoppingCart className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Sell</h3>
                                <p className="text-gray-500 font-sans leading-relaxed mb-4">Set a price in credits and transfer ownership permanently. Great for textbooks you no longer need.</p>
                                <ul className="space-y-2 text-sm text-gray-600 font-sans">
                                    <li className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><span>You set the credit price</span></li>
                                    <li className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><span>Permanent ownership transfer</span></li>
                                    <li className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><span>Earn credits you can withdraw</span></li>
                                </ul>
                            </div>

                            <div className="relative p-8 rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-blue-50/50 to-white hover:border-blue-200 transition-all duration-300 group">
                                <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                                    <Clock className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Rent</h3>
                                <p className="text-gray-500 font-sans leading-relaxed mb-4">Lend your book for a set number of days. The renter returns it when done, and you get it back.</p>
                                <ul className="space-y-2 text-sm text-gray-600 font-sans">
                                    <li className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span>Set price and rental duration</span></li>
                                    <li className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span>Book is returned after the period</span></li>
                                    <li className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span>Renters can request extensions</span></li>
                                </ul>
                            </div>

                            <div className="relative p-8 rounded-2xl border-2 border-purple-100 bg-gradient-to-b from-purple-50/50 to-white hover:border-purple-200 transition-all duration-300 group">
                                <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                                    <Gift className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Give Away</h3>
                                <p className="text-gray-500 font-sans leading-relaxed mb-4">Share a book for free with someone who needs it. No credits involved — just the joy of giving.</p>
                                <ul className="space-y-2 text-sm text-gray-600 font-sans">
                                    <li className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /><span>Completely free for the receiver</span></li>
                                    <li className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /><span>Permanent ownership transfer</span></li>
                                    <li className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /><span>Help a fellow reader</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How the Exchange Process Works */}
                <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">The Exchange Process</h2>
                        <p className="text-gray-500 font-sans max-w-xl mx-auto">Every book request goes through a simple, transparent flow.</p>
                    </div>

                    <div className="space-y-0">
                        {[
                            { icon: ShoppingCart, title: 'You Request a Book', desc: 'Find a book you want and send a request to the owner. If it costs credits, they\'re reserved from your balance.', color: 'orange' },
                            { icon: CheckCircle, title: 'Owner Approves', desc: 'The book owner reviews your request and decides to approve or decline. You\'re always in control of your own books.', color: 'green' },
                            { icon: Truck, title: 'Local Admin Handles Delivery', desc: 'A trusted Local Admin in your area picks up the book from the owner and delivers it to you. Safe. Simple. Local.', color: 'blue' },
                            { icon: Star, title: 'Transaction Complete', desc: 'Credits are transferred to the seller, and you receive your book. For rentals, return it when you\'re done reading!', color: 'purple' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start space-x-6 group">
                                {/* Timeline */}
                                <div className="flex flex-col items-center">
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-110 ${
                                        item.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                                        item.color === 'green' ? 'bg-green-100 text-green-600' :
                                        item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                        'bg-purple-100 text-purple-600'
                                    }`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    {i < 3 && <div className="w-px h-16 bg-gradient-to-b from-gray-200 to-gray-100 my-2" />}
                                </div>
                                {/* Content */}
                                <div className="pb-10">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-gray-500 text-sm font-sans leading-relaxed max-w-lg">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Credits Explainer */}
                <section className="relative z-10 bg-gradient-to-b from-yellow-50/50 to-white border-y border-yellow-100/50 py-20">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 space-y-6">
                                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-yellow-100 rounded-full text-yellow-700 text-sm font-medium">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Credits System</span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">Pay with Credits, Not Complications</h2>
                                <p className="text-gray-500 font-sans leading-relaxed">
                                    Credits are the platform&apos;s simple internal currency. Buy credits with real money, use them to purchase or rent books, and earn them back when you sell your own. It&apos;s like a wallet that keeps the community running.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <ArrowRight className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">Load credits</p>
                                            <p className="text-gray-500 text-sm font-sans">Buy credits securely using UPI, cards, or net banking.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <Repeat className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">Use credits to get books</p>
                                            <p className="text-gray-500 text-sm font-sans">Spend credits to buy or rent books from other users.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <Star className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">Earn & withdraw</p>
                                            <p className="text-gray-500 text-sm font-sans">Earn credits when someone buys or rents your books. Withdraw them as real money anytime.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="w-64 h-64 bg-white rounded-3xl border border-yellow-100 shadow-xl shadow-yellow-100/30 flex flex-col items-center justify-center space-y-4 p-8">
                                    <div className="h-20 w-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-yellow-500/30">
                                        <Star className="h-10 w-10 fill-white" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-gray-900">Credits</p>
                                        <p className="text-sm text-gray-500 font-sans mt-1">Your book currency</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Local Admin / Community */}
                <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Powered by Your Community</h2>
                        <p className="text-gray-500 font-sans max-w-xl mx-auto">Local Admins are trusted volunteers who make book exchanges happen in your neighbourhood.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/30 space-y-5">
                            <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                <Shield className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Who are Local Admins?</h3>
                            <p className="text-gray-500 font-sans leading-relaxed">
                                Local Admins are community members who volunteer to handle the physical side of book exchanges in their area. They collect books from sellers, deliver them to buyers, and manage returns for rentals — all within your locality.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/30 space-y-5">
                            <div className="h-14 w-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                <MapPin className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">How Localities Work</h3>
                            <p className="text-gray-500 font-sans leading-relaxed">
                                When you register, you choose your locality (area + pin code). You can only see and request books from people in the same locality. This keeps exchanges local, fast, and community-focused. Local Admins operate within their assigned locality.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/30 space-y-5">
                            <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                <CreditCard className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Fair & Transparent Fees</h3>
                            <p className="text-gray-500 font-sans leading-relaxed">
                                A small platform fee is shared between the buyer and seller on each transaction. This fee goes directly to the Local Admin as compensation for handling the logistics — keeping the community running sustainably.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/30 space-y-5">
                            <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <Users className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Want to Become a Local Admin?</h3>
                            <p className="text-gray-500 font-sans leading-relaxed">
                                Any registered user can apply to become a Local Admin for their locality. Once approved, you&apos;ll earn platform fees for every delivery you handle. It&apos;s a great way to serve your community and earn rewards.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-12 rounded-3xl shadow-2xl shadow-orange-500/20 text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Exchanging?</h2>
                        <p className="text-orange-100 font-sans text-lg mb-8 max-w-lg mx-auto">
                            Join hundreds of readers in your community. List your first book in under a minute.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/register" className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center group">
                                Create Free Account <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/auth/login" className="px-8 py-4 bg-white/15 text-white font-medium rounded-xl border border-white/30 hover:bg-white/25 transition-all">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="p-8 text-center text-gray-500 text-sm relative z-10 border-t border-gray-100 bg-white">
                <p>&copy; 2026 Reader Exchange. Crafted for Book Lovers.</p>
            </footer>
        </div>
    );
}
