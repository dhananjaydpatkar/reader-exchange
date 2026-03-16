'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Book as BookIcon, Calendar, IndianRupee, Clock, CheckCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function BookDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (id) fetchBook();
    }, [id]);

    const fetchBook = async () => {
        try {
            // Need a single book endpoint. Dashboard fetches all. 
            // Assuming GET /books/:id exists or we filter from list? 
            // Best practice: GET /books/:id. Let's assume we might need to add it to backend if missing.
            // For now, let's try to list specific book or create endpoint. 
            // Wait, BookController doesn't have getOne. 
            // I should add getOne to BookController first/concurrently.
            // But let's write the frontend assuming it will exist.
            const res = await api.get(`/books/${id}`);
            setBook(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load book details');
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (type: 'RENT' | 'BUY' | 'EXCHANGE') => {
        setActionLoading(true);
        setError('');
        try {
            await api.post('/exchange', {
                bookId: book.id,
                type
            });
            setSuccess(`Request for ${type} sent successfully!`);
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Request failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!book) return <div className="min-h-screen flex items-center justify-center">Book not found</div>;

    return (
        <div className="min-h-screen bg-[#fdfbf7] p-6 text-gray-900 flex items-center justify-center font-sans">
            <div className="w-full max-w-2xl">
                <Link href="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-orange-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-xl shadow-orange-100/20 border border-orange-100 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-r from-orange-400 to-orange-600">
                        <div className="absolute -bottom-12 left-8 p-1.5 bg-white rounded-xl shadow-lg shadow-black/5">
                            {book.coverImageUrl ? (
                                <img src={book.coverImageUrl} alt={book.title} className="w-24 h-36 object-cover rounded-lg" />
                            ) : (
                                <div className="w-24 h-36 bg-orange-50 flex items-center justify-center rounded-lg text-orange-300">
                                    <BookIcon className="h-10 w-10" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                        <h1 className="text-3xl font-bold font-serif text-gray-900">{book.title}</h1>
                        <p className="text-lg text-gray-500 mt-1">{book.author}</p>

                        <div className="flex gap-2 mt-6">
                            <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-xs font-bold uppercase tracking-wide">{book.genre}</span>
                            <span className="px-3 py-1 bg-gray-50 text-gray-600 border border-gray-100 rounded-full text-xs font-bold uppercase tracking-wide">{book.condition}</span>
                        </div>

                        {success && (
                            <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center shadow-sm">
                                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start">
                                <div className="mr-2 mt-0.5">⚠️</div>
                                {error}
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Status Check */}
                            {book.status !== 'available' ? (
                                <div className="col-span-1 md:col-span-2 p-8 bg-gray-50 border border-gray-200 rounded-2xl text-center relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                            <Clock className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="text-gray-900 font-bold text-xl mb-2 font-serif">
                                            {book.status === 'pending' ? 'Transaction Pending' :
                                                book.status === 'sold' ? 'Book Sold Out' :
                                                    book.status === 'exchanged' ? 'Rented Out' : 'Currently Unavailable'}
                                        </h3>
                                        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                                            {book.status === 'pending'
                                                ? "This book is currently being processed for a transaction. If the requester cancels, it will become available again."
                                                : book.status === 'exchanged'
                                                    ? "This book is currently rented out and will be back in the exchange pool once returned to the owner."
                                                    : "This book is no longer available in the exchange pool."}
                                        </p>
                                    </div>
                                </div>
                            ) : user && user.locality && !user.locality.isLive ? (
                                <div className="col-span-1 md:col-span-2 p-8 bg-orange-50 border border-orange-100 rounded-2xl text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <MapPin className="h-24 w-24 text-orange-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                            <MapPin className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <h3 className="text-orange-900 font-bold text-xl mb-2 font-serif">Launch Pending in {user.locality.name}</h3>
                                        <p className="text-orange-800/80 text-sm max-w-md mx-auto leading-relaxed">
                                            We're expanding fast! While you can't participate in exchanges yet, you can still list your books to build your library.
                                            We'll notify you as soon as we go live in your area.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Exchange Option */}
                                    {book.isForExchange && (
                                        <button
                                            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-md hover:shadow-orange-500/10 transition-all cursor-pointer group text-left"
                                            onClick={() => handleRequest('EXCHANGE')}
                                            disabled={actionLoading}
                                        >
                                            <div className="text-orange-500 mb-3 group-hover:scale-110 transition-transform origin-left bg-orange-50 w-fit p-2 rounded-lg">
                                                <BookIcon className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-bold text-gray-900">Give Away</h3>
                                            <p className="text-xs text-gray-500 mt-1">Get this book for Free</p>
                                        </button>
                                    )}

                                    {/* Rent Option */}
                                    {book.isForRent && (
                                        <button
                                            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-md hover:shadow-orange-500/10 transition-all cursor-pointer group text-left"
                                            onClick={() => handleRequest('RENT')}
                                            disabled={actionLoading}
                                        >
                                            <div className="text-orange-500 mb-3 group-hover:scale-110 transition-transform origin-left bg-orange-50 w-fit p-2 rounded-lg">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-bold text-gray-900">Rent</h3>
                                            <div className="mt-1 flex items-baseline space-x-2">
                                                <p className="text-sm font-bold text-gray-900">₹{book.rentPrice}</p>
                                                <p className="text-xs text-gray-500">for {book.rentDuration} Days</p>
                                            </div>
                                        </button>
                                    )}

                                    {/* Buy Option */}
                                    {book.isForSale && (
                                        <button
                                            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-md hover:shadow-orange-500/10 transition-all cursor-pointer group text-left"
                                            onClick={() => handleRequest('BUY')}
                                            disabled={actionLoading}
                                        >
                                            <div className="text-orange-500 mb-3 group-hover:scale-110 transition-transform origin-left bg-orange-50 w-fit p-2 rounded-lg">
                                                <IndianRupee className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-bold text-gray-900">Buy</h3>
                                            <p className="text-sm font-bold text-gray-900 mt-1">₹{book.askingPrice}</p>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Ownership History Timeline */}
                        {book.ownershipHistory && book.ownershipHistory.length > 0 && (
                            <div className="mt-10 border-t border-gray-100 pt-8">
                                <h2 className="text-xl font-bold text-gray-900 font-serif mb-6 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-orange-500" />
                                    Ownership History
                                </h2>
                                <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-orange-200 via-orange-300 to-orange-100 rounded-full" />

                                    <div className="space-y-6">
                                        {book.ownershipHistory.map((entry: any, index: number) => (
                                            <div key={index} className="relative flex items-start gap-4 pl-10">
                                                {/* Timeline dot */}
                                                <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${entry.transactionType === 'sale' ? 'bg-green-500' :
                                                        entry.transactionType === 'exchange' ? 'bg-orange-500' :
                                                            'bg-gray-400'
                                                    }`} />

                                                <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-orange-100 transition-colors">
                                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border ${entry.transactionType === 'sale'
                                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                                : entry.transactionType === 'exchange'
                                                                    ? 'bg-orange-50 text-orange-700 border-orange-100'
                                                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                                            }`}>
                                                            {entry.transactionType === 'sale' ? '💰 Sale' : entry.transactionType === 'exchange' ? '🤝 Give Away' : 'Initial'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(entry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-semibold text-gray-700">{entry.userName}</span>
                                                        <span className="text-gray-300">→</span>
                                                        <span className="font-semibold text-gray-700">{entry.toUserName || 'N/A'}</span>
                                                    </div>
                                                    {entry.price !== undefined && entry.price !== null && (
                                                        <div className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                                            <IndianRupee className="h-3 w-3" />
                                                            {entry.price === 0 ? 'Free' : `${entry.price}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Current owner indicator */}
                                    <div className="relative flex items-start gap-4 pl-10 mt-6">
                                        <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm animate-pulse" />
                                        <div className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Current Owner</div>
                                            <div className="text-sm font-semibold text-gray-900">{book.owner?.name}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
