import React, { useState } from 'react';
import api from '@/lib/api';
import { X, Landmark } from 'lucide-react';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    maxCredits: number;
    onSuccess: (deductedAmount: number) => void;
}

export default function WithdrawModal({ isOpen, onClose, maxCredits, onSuccess }: WithdrawModalProps) {
    const [amount, setAmount] = useState<number | ''>('');
    const [vpa, setVpa] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const withdrawAmount = Number(amount);
        if (!withdrawAmount || withdrawAmount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        if (withdrawAmount > maxCredits) {
            alert('You cannot withdraw more credits than you have.');
            return;
        }

        if (!vpa || !vpa.includes('@')) {
            alert('Please enter a valid UPI ID (e.g., name@bank).');
            return;
        }

        try {
            setLoading(true);
            await api.post('/payments/withdraw', {
                amount: withdrawAmount,
                upiVpa: vpa
            });
            alert('Withdrawal request submitted successfully. It will be processed by an admin.');
            onSuccess(withdrawAmount);
            onClose();
        } catch (error: any) {
            console.error('Withdrawal request failed', error);
            alert(error.response?.data?.message || 'Failed to submit request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold font-serif text-gray-900 flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-gray-400" /> Withdraw Credits
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-900">Available Balance:</span>
                        <span className="text-lg font-bold text-orange-700">{maxCredits} Credits</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount to Withdraw (1 Credit = ₹1)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={maxCredits}
                                step="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-gray-900"
                                placeholder="Enter amount"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your UPI ID (VPA)
                            </label>
                            <input
                                type="text"
                                value={vpa}
                                onChange={(e) => setVpa(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-gray-900"
                                placeholder="e.g. john@okaxis"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Make sure your UPI ID is correct to avoid transfer failures.</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-gray-900/20 transition-all font-bold disabled:opacity-70 flex justify-center items-center"
                        >
                            {loading ? 'Processing...' : 'Request Withdrawal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
