'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import BuyCreditsModal from '../../components/BuyCreditsModal';
import CreditsLedgerTab from '../../components/CreditsLedgerTab';
import AdminWithdrawals from '../../components/AdminWithdrawals';
import AppTour from '../../components/AppTour';
import { TOUR_PREFS } from '@/lib/tourConfig';
import { LogOut, BookOpen, Repeat, Plus, Star, CheckCircle, XCircle, Clock, Truck, Shield, Search, HelpCircle } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [books, setBooks] = useState<any[]>([]);
    const [myBooks, setMyBooks] = useState<any[]>([]);
    const [requests, setRequests] = useState<{ sent: any[], received: any[], all: any[] }>({ sent: [], received: [], all: [] });
    const [logisticsRequests, setLogisticsRequests] = useState<any[]>([]); // Added logistics state
    const [loading, setLoading] = useState(true);
    const [historyRange, setHistoryRange] = useState('all'); // Re-aligning with typical order or just keeping what's there but ensuring logistics is added
    const [historyEvents, setHistoryEvents] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userProfileData, setUserProfileData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('available'); // available, my_books, history, requests, logistics, admin
    const [searchQuery, setSearchQuery] = useState('');

    // Relist State
    const [relistModalOpen, setRelistModalOpen] = useState(false);
    const [relistingBook, setRelistingBook] = useState<any>(null);
    const [relistData, setRelistData] = useState({
        isForExchange: true,
        isForSale: false,
        isForRent: false,
        creditsRequired: '',
        rentDuration: 14
    });

    // Admin / Logistics State
    const [localExchanges, setLocalExchanges] = useState<any[]>([]);
    const [adminRequests, setAdminRequests] = useState<any[]>([]);
    const [adminExchangeFilter, setAdminExchangeFilter] = useState('');
    const [allExchanges, setAllExchanges] = useState<any[]>([]);
    const [localities, setLocalities] = useState<any[]>([]);
    const [newLocality, setNewLocality] = useState({ name: '', pinCode: '' });

    const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
    const [showTour, setShowTour] = useState(false);

    // Tour tab change handler
    const handleTourTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId);
    }, []);

    // Re-launch tour manually
    const handleRelaunchTour = useCallback(() => {
        // Clear session flag so tour shows again
        sessionStorage.removeItem(TOUR_PREFS.SESSION_SHOWN);
        // Clear skipped flag
        localStorage.removeItem(TOUR_PREFS.SKIPPED);
        localStorage.removeItem(TOUR_PREFS.LAST_SEEN_VERSION);
        // Force re-mount by toggling
        setShowTour(false);
        setTimeout(() => setShowTour(true), 50);
    }, []);

    useEffect(() => {
        // Check auth
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/auth/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Fetch fresh user data from server to sync credits & other fields
        api.get('/users/me')
            .then(res => {
                const freshUser = { ...parsedUser, ...res.data };
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));
            })
            .catch(err => console.error('Failed to fetch fresh user data', err));

        // Fetch initial data
        fetchBooks();
        fetchMyBooks();
        fetchRequests();
        fetchHistory('all');

        // Fetch role specific data
        if (parsedUser.role === 'local_admin') {
            fetchLocalExchanges();
        } else if (parsedUser.role === 'exchange_admin') {
            fetchAdminRequests();
            fetchAllExchanges();
            fetchLocalities();
        }

    }, [router]);

    const fetchLocalities = async () => {
        try {
            const res = await api.get('/localities');
            setLocalities(res.data);
        } catch (error) {
            console.error('Failed to fetch localities', error);
        }
    };

    const handleToggleLocalityLive = async (localityId: string) => {
        try {
            await api.patch(`/localities/${localityId}/toggle-live`);
            fetchLocalities();
        } catch (error) {
            console.error('Failed to toggle locality live status', error);
            alert('Failed to update locality');
        }
    };

    const handleCreateLocality = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/localities', newLocality);
            alert('Locality created successfully!');
            setNewLocality({ name: '', pinCode: '' });
            fetchLocalities();
        } catch (error: any) {
            console.error('Failed to create locality', error);
            alert(error.response?.data?.message || 'Failed to create locality');
        }
    };

    useEffect(() => {
        if (user) {
            fetchRequests();
            fetchHistory('all');

            if (user.role === 'local_admin') {
                fetchLogistics(); // Fetch logistics for local admin
            }
            if (user.role === 'exchange_admin') {
                fetchAdminRequests();
                fetchAllExchanges();
            }
        }
    }, [user]);

    const fetchLogistics = async () => {
        try {
            const res = await api.get('/exchange/logistics');
            setLogisticsRequests(res.data);
        } catch (error) {
            console.error('Failed to fetch logistics', error);
        }
    };

    // ... existing fetch functions ...

    const fetchLocalExchanges = () => {
        api.get('/admin/local-exchanges')
            .then(res => setLocalExchanges(res.data))
            .catch(err => console.error('Failed to fetch local exchanges', err));
    };

    const fetchAdminRequests = () => {
        api.get('/admin/requests')
            .then(res => setAdminRequests(res.data))
            .catch(err => console.error('Failed to fetch admin requests', err));
    };

    const fetchAllExchanges = (zipCode = '') => {
        const url = zipCode ? `/admin/all-exchanges?zipCode=${zipCode}` : '/admin/all-exchanges';
        api.get(url)
            .then(res => setAllExchanges(res.data))
            .catch(err => console.error('Failed to fetch all exchanges', err));
    };



    const handleApproveLocalAdmin = async (userId: string) => {
        try {
            await api.post('/admin/approve-local-admin', { userId });
            fetchAdminRequests();
            alert('User promoted to Local Admin');
        } catch (error) {
            console.error('Failed to approve admin', error);
            alert('Failed to approve request');
        }
    };

    const handleRequestLocalAdmin = async () => {
        try {
            await api.post('/admin/request-local-admin');
            alert('Request sent successfully!');
            // Update local user state to show Pending
            const updatedUser = { ...user, isLocalAdminRequested: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Failed to request admin access', error);
            alert('Failed to send request');
        }
    };

    // ... existing helper functions (fetchBooks, debounce, etc) ...

    const fetchBooks = (query = '') => {
        const url = query ? `/books?search=${encodeURIComponent(query)}` : '/books';
        api.get(url)
            .then(res => setBooks(res.data))
            .catch(err => console.error('Failed to fetch books', err));
    };

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (user) { // Only fetch if user is logged in (to avoid initial multi-fetch)
                fetchBooks(searchQuery);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchMyBooks = () => {
        api.get('/books/my-books')
            .then(res => setMyBooks(res.data))
            .catch(err => console.error('Failed to fetch my books', err));
    };

    const handleRelistBookClick = (book: any) => {
        setRelistingBook(book);
        setRelistData({
            isForExchange: true,
            isForSale: false,
            isForRent: false,
            creditsRequired: '',
            rentDuration: 14
        });
        setRelistModalOpen(true);
    };

    const submitRelistBook = async () => {
        if (!relistData.isForExchange && !relistData.isForSale && !relistData.isForRent) {
            alert('Please select at least one way to list the book.');
            return;
        }
        if (relistData.isForExchange && (relistData.isForSale || relistData.isForRent)) {
            alert('A book cannot be listed for "Give Away" if it is also listed for Sale or Rent.');
            return;
        }

        try {
            await api.post(`/books/${relistingBook.id}/relist`, {
                isForExchange: relistData.isForExchange,
                isForSale: relistData.isForSale,
                isForRent: relistData.isForRent,
                creditsRequired: (relistData.isForSale || relistData.isForRent) ? Number(relistData.creditsRequired) : 0,
                rentDuration: relistData.isForRent ? Number(relistData.rentDuration) : undefined
            });
            alert('Book relisted successfully!');
            setRelistModalOpen(false);
            setRelistingBook(null);
            fetchMyBooks(); // Refresh the list
            fetchBooks(); // Update available books too
        } catch (error: any) {
            console.error('Failed to relist book', error);
            alert(error.response?.data?.message || 'Failed to relist book');
        }
    };

    const fetchRequests = () => {
        api.get('/exchange')
            .then(res => setRequests(res.data))
            .catch(err => console.error('Failed to fetch requests', err));
    };

    const fetchHistory = (range: string) => {
        setHistoryRange(range);
        api.get(`/exchange/history?range=${range}`)
            .then(res => setHistoryEvents(res.data))
            .catch(err => console.error('Failed to fetch history', err));
    };

    const fetchUserProfile = (userId: string) => {
        if (!userId) return;
        setSelectedUser(userId); // Just temporary ID to show loading
        api.get(`/users/${userId}/profile`)
            .then(res => setUserProfileData(res.data))
            .catch(err => console.error('Failed to fetch user profile', err));
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
    };

    const handleRequestAction = async (requestId: string, status: string) => {
        try {
            await api.put(`/exchange/${requestId}`, { status });
            fetchRequests();
            fetchMyBooks(); // Status might change
            fetchHistory(historyRange);
            if (user?.role === 'local_admin') {
                fetchLogistics();
            }

            // Re-fetch fresh user data to sync credits after any status change
            api.get('/users/me')
                .then(res => {
                    const freshUser = { ...user, ...res.data };
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                })
                .catch(err => console.error('Failed to refresh user data', err));
        } catch (error) {
            console.error('Failed to update request', error);
            alert('Failed to process request');
        }
    };

    const handleExtendRental = async (requestId: string) => {
        const days = prompt('How many days do you want to extend for?');
        if (!days) return;

        try {
            await api.post(`/exchange/${requestId}/extend`, { days: parseInt(days) });
            alert('Rental extended successfully!');
            fetchRequests(); // Refresh to see new end date / cost
        } catch (error: any) {
            console.error('Failed to extend rental', error);
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const updateStatus = handleRequestAction;
    const handleLogisticsUpdate = handleRequestAction;

    if (!user) return null;

    // Enable tour on mount
    if (!showTour && typeof window !== 'undefined') {
        // Delay to avoid hydration mismatch
        setTimeout(() => setShowTour(true), 100);
    }

    const tabs = [
        { id: 'available', label: 'Books Available for You', icon: BookOpen },
        { id: 'my_books', label: 'My Books', icon: BookOpen },
        { id: 'history', label: 'Exchange History', icon: Clock },
        { id: 'requests', label: 'Active Requests', icon: Repeat },
        { id: 'wallet', label: 'Wallet', icon: Star },
    ];

    if (user.role === 'local_admin') {
        tabs.push({ id: 'logistics', label: 'Logistics', icon: Truck });
    }
    if (user.role === 'exchange_admin') {
        tabs.push({ id: 'admin', label: 'Admin', icon: Shield });
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] transition-colors duration-300 font-serif">
            {/* Navbar */}
            <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-orange-100/50">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">
                        R
                    </div>
                    <Link href="/" className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors">
                        Reader Exchange
                    </Link>
                    <Link
                        href="/dashboard/guide"
                        className="ml-2 px-3 py-1 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition-all duration-300 text-xs font-medium font-sans flex items-center space-x-1 group"
                        title="User Guide"
                    >
                        <BookOpen className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        <span>Guide</span>
                    </Link>
                    <button
                        onClick={handleRelaunchTour}
                        className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-all duration-300 group"
                        title="App Guide Tour"
                        data-tour="help-button"
                    >
                        <HelpCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Role Badge */}
                    {user.role === 'local_admin' && (
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                            Local Admin{user.locality ? ` · ${user.locality.name} (${user.locality.pinCode})` : ''}
                        </span>
                    )}
                    {user.role === 'exchange_admin' && (
                        <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                            Super Admin
                        </span>
                    )}

                    {/* Become Local Admin Button */}
                    {user.role === 'student' && !user.isLocalAdminRequested && (
                        <button
                            onClick={handleRequestLocalAdmin}
                            className="text-xs font-medium text-orange-600 hover:text-orange-700 underline underline-offset-2 decoration-orange-200"
                            data-tour="become-admin"
                        >
                            Become Local Admin
                        </button>
                    )}
                    {user.role === 'student' && user.isLocalAdminRequested && (
                        <span className="text-xs text-gray-500 italic">Admin Request Pending</span>
                    )}

                    <div className="text-sm text-gray-600 font-sans">
                        Hello, <span className="font-semibold text-gray-900">{user.name}</span>
                    </div>

                    {/* Credits Display */}
                    <div
                        className="flex items-center space-x-1 px-4 py-1.5 bg-yellow-50 border border-yellow-100 rounded-full text-yellow-700 font-medium text-sm shadow-sm hover:bg-yellow-100 cursor-pointer transition-colors"
                        onClick={() => setBuyCreditsOpen(true)}
                        data-tour="credits-display"
                    >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{user.credits || 0} Credits</span>
                    </div>

                    <button
                        onClick={() => setBuyCreditsOpen(true)}
                        className="px-4 py-1.5 bg-orange-600 text-white font-medium text-sm rounded-full shadow-sm shadow-orange-500/30 hover:bg-orange-700 transition-colors hidden sm:block"
                        data-tour="add-credits"
                    >
                        Add Credits
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-300"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Summary Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-white border border-orange-100 shadow-xl shadow-orange-100/20" data-tour="summary-banner">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />
                    <div className="relative px-8 py-10 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 z-10">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 font-serif">Welcome back, {user.name}!</h2>
                            <p className="text-gray-500 mt-2 font-sans">Here's what's happening in your book exchange network.</p>
                        </div>

                        <div className="flex space-x-8 md:space-x-12 bg-gray-50/50 rounded-xl p-6 border border-gray-100 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">{books.length}</div>
                                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mt-1">Books Nearby</div>
                            </div>
                            <div className="w-px bg-gray-200"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">{myBooks.length}</div>
                                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mt-1">My Library</div>
                            </div>
                            <div className="w-px bg-gray-200"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">{requests.received.length + requests.sent.length}</div>
                                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mt-1">Active Requests</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Book CTA */}
                <div className="flex justify-end">
                    <Link href="/books/add" className="flex items-center space-x-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20 font-medium" data-tour="add-book">
                        <Plus className="h-5 w-5" />
                        <span>Add New Book</span>
                    </Link>
                </div>

                {/* Tabs Header */}
                <div className="flex space-x-1 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm overflow-x-auto" data-tour="tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                                data-tour={`tab-${tab.id}`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="whitespace-nowrap">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {/* 1. Books Available */}
                    {activeTab === 'available' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <h2 className="text-2xl font-bold text-gray-900 font-serif">Books in your Area</h2>
                                <div className="relative w-full md:w-80 group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search title, author..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm group-hover:shadow-md"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {books.length === 0 ? (
                                    <div className="bg-white/50 p-12 text-center text-gray-500 col-span-full rounded-2xl border border-gray-100 shadow-sm backdrop-blur-sm">
                                        {searchQuery ? 'No books found matching your search.' : 'No books available in your pincode yet.'}
                                    </div>
                                ) : (
                                    books.map((book) => (
                                        <div key={book.id} className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 flex flex-col space-y-3 hover:shadow-md hover:border-orange-200 transition-all duration-300 relative group">
                                            {/* Status Badge - Top Right */}
                                            {book.status !== 'available' && (
                                                <div className="absolute top-2 right-2 z-10">
                                                    {book.status === 'pending' && (
                                                        <span className="px-3 py-1 text-xs font-bold bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200 shadow-sm">
                                                            🔒 Pending
                                                        </span>
                                                    )}
                                                    {book.status === 'exchanged' && (
                                                        <span className="px-3 py-1 text-xs font-bold bg-orange-50 text-orange-700 rounded-full border border-orange-200 shadow-sm">
                                                            📦 Rented
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex space-x-4">
                                                {book.coverImageUrl ? (
                                                    <img src={book.coverImageUrl} alt={book.title} className="w-24 h-36 object-cover rounded-lg shadow-md" />
                                                ) : (
                                                    <div className="w-24 h-36 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                        <BookOpen className="h-8 w-8" />
                                                    </div>
                                                )}
                                                <div className="flex-1 space-y-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg leading-tight line-clamp-2 text-gray-900 font-serif">{book.title}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">{book.author}</p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {book.isForRent && (
                                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-100 uppercase tracking-wide flex items-center">
                                                                Rent <Star className="h-2.5 w-2.5 ml-1 mr-0.5 fill-blue-400 text-blue-500" /> {book.creditsRequired || 0}
                                                            </span>
                                                        )}
                                                        {book.isForSale && (
                                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-green-50 text-green-700 rounded-md border border-green-100 uppercase tracking-wide flex items-center">
                                                                Buy <Star className="h-2.5 w-2.5 ml-1 mr-0.5 fill-green-400 text-green-500" /> {book.creditsRequired || 0}
                                                            </span>
                                                        )}
                                                        {book.isForExchange && (
                                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 rounded-md border border-purple-100 uppercase tracking-wide">
                                                                Free
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md border border-gray-100">
                                                            {book.genre || 'General'}
                                                        </span>
                                                        <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md border border-gray-100">
                                                            {book.condition}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 mt-auto border-t border-dashed border-gray-100 flex items-center justify-between">
                                                <p className="text-xs text-gray-500">
                                                    By <button onClick={() => fetchUserProfile(book.owner?.id)} className="hover:text-orange-600 hover:underline font-medium">{book.owner?.name}</button>
                                                </p>
                                                <Link
                                                    href={`/books/${book.id}`}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${book.status === 'available'
                                                        ? 'bg-gray-900 text-white hover:bg-orange-600 hover:shadow-md'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {book.status === 'available' ? 'View Details' : 'Unavailable'}
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* 2. My Books */}
                    {activeTab === 'my_books' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 font-serif">My Library</h2>
                            {myBooks.length === 0 ? (
                                <div className="bg-white p-12 text-center text-gray-500 rounded-2xl border border-gray-100 shadow-sm">
                                    You haven't added any books yet. <Link href="/books/add" className="text-orange-600 underline hover:text-orange-700">Add one now</Link>.
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Book</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Added</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-50">
                                                {myBooks.map((book) => (
                                                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                {book.coverImageUrl ? (
                                                                    <img className="h-12 w-9 object-cover rounded shadow-sm mr-4" src={book.coverImageUrl} alt="" />
                                                                ) : (
                                                                    <div className="h-12 w-9 bg-gray-100 rounded mr-4 flex items-center justify-center">
                                                                        <BookOpen className="h-4 w-4 text-gray-400" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="text-sm font-semibold text-gray-900">{book.title}</div>
                                                                    <div className="text-xs text-gray-500">{book.author}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(book.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border
                                                        ${book.status === 'available' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                    book.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                                        book.status === 'sold' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                            book.status === 'exchanged' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                                'bg-gray-50 text-gray-700 border-gray-100'}`}>
                                                                {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {book.status === 'sold' && (
                                                                <button
                                                                    onClick={() => handleRelistBookClick(book)}
                                                                    className="px-3 py-1 bg-gray-900 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                                                                >
                                                                    Relist Book
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. Exchange History */}
                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900 font-serif">Exchange History</h2>
                                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                                    {['1w', '1m', '1q', 'all'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => fetchHistory(range)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${historyRange === range
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {range === '1w' ? 'Week' : range === '1m' ? 'Month' : range === '1q' ? 'Quarter' : 'All'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Book</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Exchanged With</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-50">
                                            {historyEvents.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                                        No exchange history found for this period.
                                                    </td>
                                                </tr>
                                            ) : (
                                                historyEvents.map((event) => {
                                                    const isRequester = event.requester?.id === user.id;
                                                    const otherUser = isRequester ? (event.originalOwner || event.book?.owner) : event.requester;
                                                    return (
                                                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-semibold text-gray-900">{event.book?.title}</div>
                                                                <div className="text-xs text-gray-500">{event.book?.author}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <button
                                                                    onClick={() => fetchUserProfile(otherUser?.id)}
                                                                    className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium"
                                                                >
                                                                    {otherUser?.name || 'Unknown'}
                                                                </button>
                                                                <div className="text-xs text-gray-500">{isRequester ? 'Owner' : 'Requester'}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-600">
                                                                    {new Date(event.createdAt).toLocaleDateString()}
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    {new Date(event.createdAt).toLocaleTimeString()}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border
                                                                    ${event.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                        event.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                            'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. Active Requests */}
                    {activeTab === 'requests' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Incoming Requests */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 font-serif border-b border-gray-100 pb-2">Incoming Requests</h2>
                                <div className="space-y-4">
                                    {requests.received.length === 0 ? (
                                        <div className="bg-white p-8 text-center text-gray-500 text-sm rounded-xl border border-gray-100 shadow-sm">
                                            No pending requests.
                                        </div>
                                    ) : (
                                        requests.received.map((req) => (
                                            <div key={req.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3 relative group">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 line-clamp-1">{req.book.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">From: <span className="font-medium text-gray-700">{req.requester.name}</span></p>
                                                        {req.type === 'rent' && <p className="text-[10px] text-blue-600 font-semibold uppercase mt-1">Rental</p>}
                                                    </div>
                                                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full border
                                                        ${req.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                            req.status === 'approved' || req.status === 'returned' ? 'bg-green-50 text-green-700 border-green-100' :
                                                            req.status === 'rejected' || req.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            req.status.startsWith('return') ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                            'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                        {req.status.replace(/_/g, ' ')}
                                                    </span>
                                                </div>

                                                {req.status === 'pending' && (
                                                    <div className="flex space-x-3 pt-2">
                                                        <button
                                                            onClick={() => handleRequestAction(req.id, 'approved')}
                                                            className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg flex justify-center items-center space-x-1.5 transition-colors shadow-sm"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5" /> <span>Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestAction(req.id, 'rejected')}
                                                            className="flex-1 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg flex justify-center items-center space-x-1.5 transition-colors"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" /> <span>Reject</span>
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Owner confirms receipt of returned book */}
                                                {req.status === 'return_dispatched' && (
                                                    <div className="flex space-x-3 pt-2">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Have you received the returned book?')) {
                                                                    handleRequestAction(req.id, 'returned');
                                                                }
                                                            }}
                                                            className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg flex justify-center items-center space-x-1.5 transition-colors shadow-sm"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5" /> <span>Confirm Return Received</span>
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Return progress indicator for owner */}
                                                {(req.status === 'return_pending' || req.status === 'return_collected') && (
                                                    <div className="pt-2">
                                                        <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                                            <Truck className="h-3.5 w-3.5" />
                                                            {req.status === 'return_pending' ? 'Return initiated — awaiting collection from renter' : 'Book collected — being dispatched to you'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Sent Requests */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 font-serif border-b border-gray-100 pb-2">My Requests</h2>
                                <div className="space-y-4">
                                    {requests.sent.length === 0 ? (
                                        <div className="bg-white p-8 text-center text-gray-500 text-sm rounded-xl border border-gray-100 shadow-sm">
                                            You haven't requested any books.
                                        </div>
                                    ) : (
                                        requests.sent.map((req) => (
                                            <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-orange-200 transition-colors">
                                                <div>
                                                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">{req.book.title}</h4>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    {req.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                                                    {req.status === 'approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                                    {req.status === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}

                                                    {req.type === 'rent' && req.status === 'delivered' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleExtendRental(req.id)}
                                                                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-md border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                                            >
                                                                Extend
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Are you ready to return this book?')) {
                                                                        api.put(`/exchange/${req.id}`, { status: 'return_pending' }).then(fetchRequests);
                                                                    }
                                                                }}
                                                                className="px-2.5 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold uppercase rounded-md border border-orange-100 hover:bg-orange-100 transition-colors"
                                                            >
                                                                Return
                                                            </button>
                                                        </>
                                                    )}
                                                    {/* Return flow status badges for renter */}
                                                    {req.status === 'return_pending' && <span className="text-xs text-orange-600 font-bold px-2 py-0.5 bg-orange-50 rounded-full border border-orange-100">Return Requested</span>}
                                                    {req.status === 'return_collected' && <span className="text-xs text-blue-600 font-bold px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">Collected</span>}
                                                    {req.status === 'return_dispatched' && <span className="text-xs text-purple-600 font-bold px-2 py-0.5 bg-purple-50 rounded-full border border-purple-100">Dispatched to Owner</span>}
                                                    {req.status === 'returned' && <span className="text-xs text-green-600 font-bold px-2 py-0.5 bg-green-50 rounded-full border border-green-100">Returned ✓</span>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="col-span-full mt-4">
                                <h2 className="text-xl font-bold text-gray-900 font-serif mb-4 flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-orange-500" />
                                    Returns Processing
                                </h2>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-1">
                                        {logisticsRequests.filter(r => ['return_pending', 'return_collected', 'return_dispatched'].includes(r.status)).length === 0 ? (
                                            <div className="text-center py-12 text-gray-500">
                                                No active returns in your area.
                                            </div>
                                        ) : (
                                            logisticsRequests.filter(r => ['return_pending', 'return_collected', 'return_dispatched'].includes(r.status)).map((req) => (
                                                <div key={req.id} className="flex flex-col md:flex-row justify-between items-center p-4 border-b last:border-0 border-gray-50 hover:bg-gray-50/50 transition-colors gap-4">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{req.book.title}</h3>
                                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                            <span className="font-medium text-gray-700">{req.requester.name}</span>
                                                            <span className="text-gray-300">→</span>
                                                            <span className="font-medium text-gray-700">{(req.originalOwner || req.book.owner).name}</span>
                                                        </p>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mt-2 border
                                                        ${req.status === 'return_pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                                req.status === 'return_collected' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                    'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                            {req.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex space-x-3 w-full md:w-auto">
                                                        {req.status === 'return_pending' && (
                                                            <button onClick={() => updateStatus(req.id, 'return_collected')} className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors">
                                                                Collect from Renter
                                                            </button>
                                                        )}
                                                        {req.status === 'return_collected' && (
                                                            <button onClick={() => updateStatus(req.id, 'return_dispatched')} className="flex-1 md:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors">
                                                                Dispatch to Owner
                                                            </button>
                                                        )}
                                                        {req.status === 'return_dispatched' && (
                                                            <span className="text-orange-600 text-sm font-bold flex items-center"><Clock className="w-4 h-4 mr-1.5" /> Awaiting Owner Confirmation</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wallet' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CreditsLedgerTab
                                user={user}
                                onUserUpdate={(updatedUser) => {
                                    setUser(updatedUser);
                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                }}
                            />
                        </div>
                    )}

                    {/* 5. Logistics (Local Admin) */}
                    {activeTab === 'logistics' && user.role === 'local_admin' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 font-serif">Active Exchanges in {user.locality?.name || user.zipCode}</h2>
                            {logisticsRequests.length === 0 ? (
                                <div className="bg-white p-12 text-center text-gray-500 rounded-2xl border border-gray-100 shadow-sm">
                                    No active exchanges in your area.
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Book</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">From (Owner)</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">To (Requester)</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-50">
                                                {logisticsRequests.map((req) => (
                                                    <tr key={req.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-semibold text-gray-900">{req.book.title}</div>
                                                            <div className="text-xs text-gray-500">{req.book.author}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 font-medium">{(req.originalOwner || req.book.owner).name}</div>
                                                            <div className="text-xs text-gray-400">{(req.originalOwner || req.book.owner).addressLine1}, {(req.originalOwner || req.book.owner).city}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 font-medium">{req.requester.name}</div>
                                                            <div className="text-xs text-gray-400">{req.requester.addressLine1}, {req.requester.city}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                                                                {req.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                            {req.status === 'approved' && (
                                                                <button
                                                                    onClick={() => handleLogisticsUpdate(req.id, 'collection_pending')}
                                                                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                                                                >
                                                                    Start Collection
                                                                </button>
                                                            )}
                                                            {req.status === 'collection_pending' && (
                                                                <button
                                                                    onClick={() => handleLogisticsUpdate(req.id, 'collected')}
                                                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                                                                >
                                                                    Mark Collected
                                                                </button>
                                                            )}
                                                            {req.status === 'collected' && (
                                                                <button
                                                                    onClick={() => handleLogisticsUpdate(req.id, 'dispatched')}
                                                                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                                                                >
                                                                    Dispatch
                                                                </button>
                                                            )}
                                                            {req.status === 'dispatched' && (
                                                                <button
                                                                    onClick={() => handleLogisticsUpdate(req.id, 'delivered')}
                                                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                                                                >
                                                                    Mark Delivered
                                                                </button>
                                                            )}
                                                            {req.status === 'delivered' && req.type !== 'rent' && (
                                                                <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Completed</span>
                                                            )}
                                                            {req.status === 'delivered' && req.type === 'rent' && (
                                                                <span className="text-blue-600 text-xs font-bold flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Rented Out</span>
                                                            )}
                                                            {/* Return Flow Actions */}
                                                            {req.status === 'return_pending' && (
                                                                <button
                                                                    onClick={() => handleLogisticsUpdate(req.id, 'return_collected')}
                                                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                                                                >
                                                                    Collect from Renter
                                                                </button>
                                                            )}
                                                            {req.status === 'return_collected' && (
                                                                <button
                                                                    onClick={() => handleLogisticsUpdate(req.id, 'return_dispatched')}
                                                                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                                                                >
                                                                    Dispatch to Owner
                                                                </button>
                                                            )}
                                                            {req.status === 'return_dispatched' && (
                                                                <span className="text-orange-600 text-xs font-bold flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Awaiting Owner</span>
                                                            )}
                                                            {req.status === 'returned' && (
                                                                <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Returned</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 6. Admin Panel (Exchange Admin) */}
                    {activeTab === 'admin' && user.role === 'exchange_admin' && (
                        <div className="space-y-8">
                            {/* Section 1: Admin Requests */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900 font-serif">Local Admin Requests</h2>
                                {adminRequests.length === 0 ? (
                                    <div className="bg-white p-8 text-center text-gray-500 text-sm rounded-xl border border-gray-100 shadow-sm">
                                        No pending requests for Local Admin role.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {adminRequests.map(req => (
                                            <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{req.name}</h4>
                                                    <p className="text-xs text-gray-500">{req.email}</p>
                                                    <p className="text-xs text-orange-600 mt-1 font-medium">{req.city} ({req.zipCode})</p>
                                                </div>
                                                <button
                                                    onClick={() => handleApproveLocalAdmin(req.id)}
                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Section: Withdrawals Management */}
                            <AdminWithdrawals />

                            {/* Section: Locality Settings */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900 font-serif">Locality Management</h2>

                                {/* Add New Locality Form */}
                                <form onSubmit={handleCreateLocality} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row gap-4 items-end mb-6">
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Locality Name</label>
                                        <input
                                            type="text"
                                            value={newLocality.name}
                                            onChange={(e) => setNewLocality({ ...newLocality, name: e.target.value })}
                                            placeholder="e.g. Indiranagar"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="w-full md:w-48">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Pincode</label>
                                        <input
                                            type="text"
                                            value={newLocality.pinCode}
                                            onChange={(e) => setNewLocality({ ...newLocality, pinCode: e.target.value })}
                                            placeholder="e.g. 560038"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full md:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center transition-all"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Locality
                                    </button>
                                </form>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {localities.map(loc => (
                                        <div key={loc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{loc.name}</h4>
                                                    <p className="text-xs text-gray-500 font-mono">PIN: {loc.pinCode}</p>
                                                </div>
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${loc.isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {loc.isLive ? 'Live' : 'Pending'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleToggleLocalityLive(loc.id)}
                                                className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${loc.isLive
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
                                            >
                                                {loc.isLive ? 'Disable (Make Admin Only)' : 'Go Live'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 2: All Exchanges Monitoring */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900 font-serif">Exchange Monitor</h2>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Filter by Zip Code"
                                                className="pl-4 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                                                value={adminExchangeFilter}
                                                onChange={(e) => setAdminExchangeFilter(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => fetchAllExchanges(adminExchangeFilter)}
                                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                                        >
                                            Filter
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Book</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location (Owner Zip)</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-50">
                                                {allExchanges.map((req) => (
                                                    <tr key={req.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{req.book.title}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500 font-mono">{(req.originalOwner || req.book.owner).zipCode}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 uppercase`}>
                                                                {req.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(req.updatedAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile Modal */}
                {selectedUser && userProfileData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all"
                        onClick={() => { setSelectedUser(null); setUserProfileData(null); }}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 transform transition-all scale-100"
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 font-serif">{userProfileData.user.name}</h3>
                                        <p className="text-sm text-gray-500">Member since {new Date(userProfileData.user.createdAt).getFullYear()}</p>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedUser(null); setUserProfileData(null); }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>

                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-orange-500" />
                                    Available Books ({userProfileData.books.length})
                                </h4>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {userProfileData.books.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">No books available for exchange.</p>
                                    ) : (
                                        userProfileData.books.map((book: any) => (
                                            <div key={book.id} className="flex p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-100 transition-colors">
                                                {book.coverImageUrl ? (
                                                    <img src={book.coverImageUrl} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm mr-3" />
                                                ) : (
                                                    <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center mr-3 text-gray-400">
                                                        <BookOpen className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h5 className="font-bold text-sm text-gray-900 line-clamp-1">{book.title}</h5>
                                                    <p className="text-xs text-gray-500">{book.author}</p>
                                                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] bg-white border border-gray-200 text-gray-600 rounded-md font-medium uppercase tracking-wide">
                                                        {book.genre}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
                                <button
                                    onClick={() => { setSelectedUser(null); setUserProfileData(null); }}
                                    className="px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Relist Book Modal */}
                {relistModalOpen && relistingBook && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all"
                        onClick={() => setRelistModalOpen(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 transform transition-all scale-100"
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 font-serif">Relist Book</h3>
                                        <p className="text-sm text-gray-500">How do you want to list '{relistingBook.title}'?</p>
                                    </div>
                                    <button
                                        onClick={() => setRelistModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={relistData.isForExchange}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setRelistData({
                                                    ...relistData,
                                                    isForExchange: checked,
                                                    ...(checked ? { isForSale: false, isForRent: false } : {})
                                                });
                                            }}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <div className="text-sm font-medium text-gray-700">Give Away for Free (Exchange)</div>
                                    </label>

                                    <div className="p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={relistData.isForSale}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setRelistData({
                                                        ...relistData,
                                                        isForSale: checked,
                                                        ...(checked ? { isForExchange: false } : {})
                                                    });
                                                }}
                                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                            />
                                            <div className="text-sm font-medium text-gray-700">Sell Book</div>
                                        </label>
                                        {relistData.isForSale && (
                                            <div className="mt-3 pl-7">
                                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Credits Required</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={relistData.creditsRequired}
                                                        onChange={e => setRelistData({ ...relistData, creditsRequired: e.target.value })}
                                                        className="w-full px-3 pr-16 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                                        placeholder="0"
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-orange-600 font-bold text-xs uppercase pt-0.5">Credits</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={relistData.isForRent}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setRelistData({
                                                        ...relistData,
                                                        isForRent: checked,
                                                        ...(checked ? { isForExchange: false } : {})
                                                    });
                                                }}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <div className="text-sm font-medium text-gray-700">Rent Book</div>
                                        </label>
                                        {relistData.isForRent && (
                                            <div className="mt-3 pl-7 space-y-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Credits Required</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={relistData.creditsRequired}
                                                            onChange={e => setRelistData({ ...relistData, creditsRequired: e.target.value })}
                                                            className="w-full px-3 pr-16 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                            placeholder="0"
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-orange-600 font-bold text-xs uppercase pt-0.5">Credits</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Duration (Days)</label>
                                                    <input
                                                        type="number"
                                                        value={relistData.rentDuration}
                                                        onChange={e => setRelistData({ ...relistData, rentDuration: parseInt(e.target.value) || 14 })}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                        placeholder="14"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-100">
                                <button
                                    onClick={() => setRelistModalOpen(false)}
                                    className="px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitRelistBook}
                                    className="px-5 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                                >
                                    Relist Book
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <BuyCreditsModal
                isOpen={buyCreditsOpen}
                onClose={() => setBuyCreditsOpen(false)}
                onSuccess={(credits) => {
                    const updatedUser = { ...user, credits: credits };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }}
            />

            {/* Application Tour */}
            {showTour && user && (
                <AppTour
                    userRole={user.role}
                    onTabChange={handleTourTabChange}
                />
            )}
        </div>
    );
}
