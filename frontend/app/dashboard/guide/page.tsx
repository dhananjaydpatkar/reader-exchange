'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Star, ShoppingCart, Clock, Gift, Truck, Shield, CreditCard, Plus, Search, CheckCircle, ChevronDown, ChevronUp, MapPin, Repeat, LogOut } from 'lucide-react';

interface Section {
    id: string;
    icon: React.ElementType;
    title: string;
    color: string;
    content: React.ReactNode;
    adminOnly?: boolean;
}

export default function UserGuidePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['listing']));

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token || !userData) { router.push('/auth/login'); return; }
        setUser(JSON.parse(userData));
    }, [router]);

    const toggle = (id: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    if (!user) return null;
    const isLocalAdmin = user.role === 'local_admin';

    const sections: Section[] = [
        {
            id: 'listing', icon: Plus, title: 'Listing Your Books', color: 'orange',
            content: (
                <div className="space-y-4 text-gray-600 font-sans text-sm leading-relaxed">
                    <p>Share your books with the community by listing them on the platform.</p>
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 space-y-3">
                        <p className="font-semibold text-orange-800 text-base">How to Add a Book</p>
                        <ol className="list-decimal ml-5 space-y-2 text-orange-900/80">
                            <li>Click <strong>&quot;Add New Book&quot;</strong> from your dashboard.</li>
                            <li>Enter the book&apos;s <strong>ISBN</strong> — title, author, cover, and publisher are fetched automatically from Google Books.</li>
                            <li>Select the book&apos;s <strong>condition</strong> (New, Good, Fair, etc.).</li>
                            <li>Choose <strong>how</strong> you want to list it:</li>
                        </ol>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { icon: ShoppingCart, label: 'Sell', desc: 'Set a credit price. Ownership transfers permanently to the buyer.', border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-700' },
                            { icon: Clock, label: 'Rent', desc: 'Set a price and duration (default 14 days). The book is returned after the rental period.', border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700' },
                            { icon: Gift, label: 'Give Away', desc: 'Free transfer. No credits involved — just share the joy of reading.', border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700' },
                        ].map(t => (
                            <div key={t.label} className={`p-4 rounded-xl border ${t.border} ${t.bg}`}>
                                <div className="flex items-center space-x-2 mb-2">
                                    <t.icon className={`h-4 w-4 ${t.text}`} />
                                    <span className={`font-bold ${t.text}`}>{t.label}</span>
                                </div>
                                <p className={`text-xs ${t.text} opacity-80`}>{t.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
                        <p><strong>Note:</strong> &quot;Give Away&quot; cannot be combined with Sell or Rent. However, Sell and Rent can be combined — the requester picks their preferred option.</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
                        <p><strong>Re-listing:</strong> After a book is sold or returned from a rental, its status becomes &quot;Sold&quot;. You can re-list it from the <strong>&quot;My Books&quot;</strong> tab by clicking <strong>&quot;Relist Book&quot;</strong> and choosing new listing preferences.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'discover', icon: Search, title: 'Discovering & Requesting Books', color: 'blue',
            content: (
                <div className="space-y-4 text-gray-600 font-sans text-sm leading-relaxed">
                    <p>Browse books listed by other users in your locality and request the ones you want.</p>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-3">
                        <p className="font-semibold text-blue-800 text-base">How to Find & Request a Book</p>
                        <ol className="list-decimal ml-5 space-y-2 text-blue-900/80">
                            <li>Go to the <strong>&quot;Books Available for You&quot;</strong> tab — this shows all books in your locality.</li>
                            <li>Use the <strong>search bar</strong> to filter by title, author, genre, or owner name.</li>
                            <li>Click <strong>&quot;View Details&quot;</strong> on any available book.</li>
                            <li>Choose to <strong>Buy</strong>, <strong>Rent</strong>, or request as <strong>Give Away</strong> (depending on what the owner allows).</li>
                            <li>If it&apos;s a purchase or rental, ensure you have enough <strong>credits</strong> — they&apos;ll be reserved from your balance.</li>
                        </ol>
                    </div>
                    <div className="flex items-start space-x-3 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                        <Star className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                        <p className="text-yellow-800 text-xs"><strong>Credits are held, not spent:</strong> When you request a book, your credits are reserved (held). If the owner rejects your request or you cancel, the full amount is refunded back to your balance automatically.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'requests', icon: Repeat, title: 'Managing Requests', color: 'green',
            content: (
                <div className="space-y-4 text-gray-600 font-sans text-sm leading-relaxed">
                    <p>Track and manage all your book exchange requests from the <strong>&quot;Active Requests&quot;</strong> tab.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-5 space-y-3">
                            <p className="font-semibold text-green-800">As a Book Owner (Incoming Requests)</p>
                            <ul className="space-y-2 text-green-900/80 text-xs">
                                <li className="flex items-start space-x-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" /><span><strong>Approve</strong> — Accept the request. A Local Admin will then collect the book from you.</span></li>
                                <li className="flex items-start space-x-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" /><span><strong>Reject</strong> — Decline the request. The book becomes available again and any held credits are refunded.</span></li>
                            </ul>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-3">
                            <p className="font-semibold text-blue-800">As a Requester (Outgoing Requests)</p>
                            <ul className="space-y-2 text-blue-900/80 text-xs">
                                <li className="flex items-start space-x-2"><CheckCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" /><span><strong>Track status</strong> — See real-time updates as your request moves through approval, collection, and delivery.</span></li>
                                <li className="flex items-start space-x-2"><CheckCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" /><span><strong>Cancel</strong> — Cancel a pending request to get your held credits back.</span></li>
                                <li className="flex items-start space-x-2"><CheckCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" /><span><strong>Initiate Return</strong> — For rented books, start the return process when you&apos;re done.</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'delivery', icon: Truck, title: 'How Delivery Works', color: 'purple',
            content: (
                <div className="space-y-4 text-gray-600 font-sans text-sm leading-relaxed">
                    <p>All physical book deliveries are handled by <strong>Local Admins</strong> — trusted community volunteers in your area.</p>
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                        <p className="font-semibold text-purple-800 text-base mb-4">Delivery Steps</p>
                        <div className="space-y-4">
                            {[
                                { step: '1', label: 'Owner approves your request' },
                                { step: '2', label: 'Local Admin collects the book from the owner' },
                                { step: '3', label: 'Local Admin dispatches and delivers the book to you' },
                                { step: '4', label: 'Transaction is complete — credits are settled' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <div className="h-7 w-7 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">{s.step}</div>
                                    <p className="text-purple-900/80 text-sm">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
                        <p><strong>Rental Returns:</strong> When your rental period ends, initiate a return. The Local Admin will collect the book from you and deliver it back to the original owner. The owner confirms receipt to complete the return.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'credits', icon: CreditCard, title: 'Credits & Wallet', color: 'yellow',
            content: (
                <div className="space-y-4 text-gray-600 font-sans text-sm leading-relaxed">
                    <p>Credits are the platform&apos;s internal currency. They make transactions simple and secure.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-5 space-y-3">
                            <p className="font-semibold text-green-800">Earning Credits</p>
                            <ul className="space-y-2 text-green-900/80 text-xs">
                                <li>• <strong>Buy Credits</strong> — Click &quot;Add Credits&quot; and pay via UPI, card, or net banking.</li>
                                <li>• <strong>Sell Books</strong> — Earn credits when someone buys or rents your books.</li>
                            </ul>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 space-y-3">
                            <p className="font-semibold text-orange-800">Spending Credits</p>
                            <ul className="space-y-2 text-orange-900/80 text-xs">
                                <li>• <strong>Buy a Book</strong> — Credits equal to the book&apos;s price are reserved on request.</li>
                                <li>• <strong>Rent a Book</strong> — Credits are reserved for the rental cost.</li>
                                <li>• <strong>Platform Fee</strong> — A small fee (5 credits each from buyer and seller) is deducted on completed transactions.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
                        <p><strong>Withdrawals:</strong> You can withdraw earned credits as real money to your UPI account from the <strong>Wallet</strong> tab. Withdrawals are reviewed and processed by platform administrators.</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
                        <p><strong>Transaction History:</strong> Every credit movement is recorded in your <strong>Wallet → Ledger</strong>. You can view all your purchases, earnings, fees, and refunds with full transparency.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'logistics', icon: Shield, title: 'Local Admin: Logistics Management', color: 'purple',
            adminOnly: true,
            content: (
                <div className="space-y-4 text-gray-600 font-sans text-sm leading-relaxed">
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-800">
                        <p><strong>You are a Local Admin!</strong> In addition to all standard user features, you have access to the <strong>Logistics</strong> tab where you manage book pickups and deliveries in your area.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                        <p className="font-semibold text-gray-800 text-base">Your Responsibilities</p>
                        <div className="space-y-3">
                            {[
                                { title: 'Collect from Owner', desc: 'When an exchange is approved, pick up the book from the owner. Mark it as "Collected" in the Logistics tab.' },
                                { title: 'Dispatch & Deliver', desc: 'Deliver the book to the requester. Mark it as "Dispatched" and then "Delivered" once handed over.' },
                                { title: 'Handle Returns', desc: 'For rentals, collect the book from the renter when the rental ends and deliver it back to the original owner.' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start space-x-3">
                                    <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs shrink-0 mt-0.5">{i + 1}</div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                                        <p className="text-gray-500 text-xs">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                            <p className="font-semibold text-green-800 text-sm mb-2">Platform Fee Earnings</p>
                            <p className="text-green-900/80 text-xs">For every completed Buy or Rent transaction, 5 credits from the buyer and 5 credits from the seller are collected as a platform fee — and <strong>all 10 credits go to you</strong> as compensation for handling logistics.</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="font-semibold text-blue-800 text-sm mb-2">Your Coverage Area</p>
                            <p className="text-blue-900/80 text-xs">You manage exchanges where the book owner is in <strong>your pin code area</strong>. All approved requests in your zone appear automatically in the Logistics tab.</p>
                        </div>
                    </div>
                </div>
            )
        },
    ];

    const visibleSections = sections.filter(s => !s.adminOnly || isLocalAdmin);

    return (
        <div className="min-h-screen bg-[#fdfbf7] font-serif">
            {/* Navbar */}
            <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-orange-100/50">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">R</div>
                    <Link href="/dashboard" className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors">Reader Exchange</Link>
                </div>
                <div className="flex items-center space-x-4">
                    {isLocalAdmin && (
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold rounded-full uppercase tracking-wider">Local Admin</span>
                    )}
                    <span className="text-sm text-gray-600 font-sans">Hello, <span className="font-semibold text-gray-900">{user.name}</span></span>
                    <Link href="/dashboard" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center space-x-2">
                        <ArrowLeft className="h-4 w-4" /><span>Back to Dashboard</span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 pb-4">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-orange-50 border border-orange-100 rounded-full text-orange-700 text-sm font-medium">
                        <BookOpen className="h-4 w-4" />
                        <span>{isLocalAdmin ? 'Local Admin Guide' : 'User Guide'}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {isLocalAdmin ? 'Your Complete Local Admin Handbook' : 'Everything You Need to Know'}
                    </h1>
                    <p className="text-gray-500 font-sans max-w-xl mx-auto">
                        {isLocalAdmin
                            ? 'A complete reference for managing your books and handling logistics in your area.'
                            : 'A friendly guide to listing books, earning credits, and exchanging with your community.'}
                    </p>
                </div>

                {/* Quick Nav */}
                <div className="flex flex-wrap gap-2 justify-center pb-4">
                    {visibleSections.map(s => (
                        <button key={s.id} onClick={() => { setExpandedSections(prev => new Set(prev).add(s.id)); document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${s.adminOnly ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200'}`}>
                            {s.title}
                        </button>
                    ))}
                </div>

                {/* Accordion Sections */}
                <div className="space-y-4">
                    {visibleSections.map(section => {
                        const isOpen = expandedSections.has(section.id);
                        const Icon = section.icon;
                        return (
                            <div key={section.id} id={`section-${section.id}`} className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${section.adminOnly ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-200'}`}>
                                <button onClick={() => toggle(section.id)} className="w-full flex items-center justify-between p-6 text-left group">
                                    <div className="flex items-center space-x-4">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                                            section.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                                            section.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                            section.color === 'green' ? 'bg-green-100 text-green-600' :
                                            section.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                            'bg-yellow-100 text-yellow-600'
                                        }`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                                            {section.adminOnly && <span className="text-[10px] uppercase tracking-wider font-bold text-purple-500">Admin Only</span>}
                                        </div>
                                    </div>
                                    {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                </button>
                                {isOpen && <div className="px-6 pb-6 border-t border-gray-100 pt-5">{section.content}</div>}
                            </div>
                        );
                    })}
                </div>

                {/* Footer help */}
                <div className="text-center pt-8 pb-4">
                    <p className="text-sm text-gray-400 font-sans">Need more help? Contact your Local Admin or reach out to platform support.</p>
                </div>
            </main>
        </div>
    );
}
