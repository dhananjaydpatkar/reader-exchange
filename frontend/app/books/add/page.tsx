'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, Book, ArrowLeft, CheckCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function AddBookPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        isbn: '',
        condition: 'Good',
        isForExchange: true,
        isForSale: false,
        isForRent: false,
        askingPrice: '',
        rentPrice: '',
        rentDuration: '14',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;

        if (e.target.type === 'checkbox') {
            if (name === 'isForExchange' && value === true) {
                // If Give Away is checked, uncheck Sale and Rent
                setFormData({
                    ...formData,
                    isForExchange: true,
                    isForSale: false,
                    isForRent: false
                });
                return;
            } else if ((name === 'isForSale' || name === 'isForRent') && value === true) {
                // If Sale or Rent is checked, uncheck Give Away
                setFormData({
                    ...formData,
                    [name]: true,
                    isForExchange: false
                });
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            const payload = {
                ...formData,
                askingPrice: formData.isForSale ? parseFloat(formData.askingPrice) : null,
                rentPrice: formData.isForRent ? parseFloat(formData.rentPrice) : null,
                rentDuration: formData.isForRent ? parseInt(formData.rentDuration) : 14,
            };

            await api.post('/books', payload);
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add book. Please check the ISBN.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7] p-6 text-gray-900 flex items-center justify-center font-sans">
            <div className="w-full max-w-lg">
                <Link href="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-orange-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-xl shadow-orange-100/50 border border-orange-100 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3.5 bg-orange-50 rounded-2xl text-orange-600 shadow-sm border border-orange-100">
                            <Book className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-serif text-gray-900">List a Book</h1>
                            <p className="text-sm text-gray-500 mt-1">Enter ISBN to auto-fill details</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start">
                            <div className="mr-2 mt-0.5">⚠️</div>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center font-medium shadow-sm">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                            Book added successfully! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wide">ISBN</label>
                            <input
                                name="isbn"
                                type="text"
                                placeholder="9780140328721"
                                className="input-field font-mono text-sm tracking-wide bg-white text-gray-900"
                                value={formData.isbn}
                                onChange={handleChange}
                                required
                            />
                            <p className="text-xs text-gray-400 ml-1">10 or 13 digit ISBN found on the back cover.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wide">Condition</label>
                            <div className="relative">
                                <select
                                    name="condition"
                                    className="input-field appearance-none bg-white text-gray-900 cursor-pointer pr-10"
                                    value={formData.condition}
                                    onChange={handleChange}
                                >
                                    <option value="New">New</option>
                                    <option value="Like New">Like New</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Poor">Poor</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wide block mb-2">Availability</label>

                            {/* Give Away Option */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer ${formData.isForExchange ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/30'}`}>
                                <label className="flex items-center space-x-3 cursor-pointer w-full">
                                    <input
                                        type="checkbox"
                                        name="isForExchange"
                                        checked={formData.isForExchange}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                                    />
                                    <span className={`font-serif font-medium ${formData.isForExchange ? 'text-orange-900' : 'text-gray-700'}`}>Give Away (Free)</span>
                                </label>
                            </div>

                            {/* Sale Option */}
                            <div className={`p-4 rounded-xl border transition-all duration-300 ${formData.isForSale ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/30'}`}>
                                <label className="flex items-center space-x-3 cursor-pointer mb-0">
                                    <input
                                        type="checkbox"
                                        name="isForSale"
                                        checked={formData.isForSale}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                                    />
                                    <span className={`font-serif font-medium ${formData.isForSale ? 'text-orange-900' : 'text-gray-700'}`}>Sell</span>
                                </label>

                                {formData.isForSale && (
                                    <div className="mt-4 pl-8 animate-in fade-in slide-in-from-top-2">
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-500">₹</span>
                                            <input
                                                name="askingPrice"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="input-field pl-8 bg-white text-gray-900"
                                                value={formData.askingPrice}
                                                onChange={handleChange}
                                                required={formData.isForSale}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rent Option */}
                            <div className={`p-4 rounded-xl border transition-all duration-300 ${formData.isForRent ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/30'}`}>
                                <label className="flex items-center space-x-3 cursor-pointer mb-0">
                                    <input
                                        type="checkbox"
                                        name="isForRent"
                                        checked={formData.isForRent}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                                    />
                                    <span className={`font-serif font-medium ${formData.isForRent ? 'text-orange-900' : 'text-gray-700'}`}>Rent Out</span>
                                </label>

                                {formData.isForRent && (
                                    <div className="mt-4 pl-0 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Price (INR)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                                                <input
                                                    name="rentPrice"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="input-field pl-8 bg-white text-gray-900"
                                                    value={formData.rentPrice}
                                                    onChange={handleChange}
                                                    required={formData.isForRent}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Days</label>
                                            <input
                                                name="rentDuration"
                                                type="number"
                                                placeholder="14"
                                                className="input-field bg-white text-gray-900"
                                                value={formData.rentDuration}
                                                onChange={handleChange}
                                                required={formData.isForRent}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || success}
                            className="btn-primary flex justify-center items-center mt-8 py-4 text-lg shadow-orange-500/30 hover:shadow-orange-500/50"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'List Book'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
