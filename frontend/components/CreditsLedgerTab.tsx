import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import WithdrawModal from './WithdrawModal';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from 'lucide-react';

interface CreditsLedgerTabProps {
    user: any;
    onUserUpdate: (updatedUser: any) => void;
}

export default function CreditsLedgerTab({ user, onUserUpdate }: CreditsLedgerTabProps) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

    useEffect(() => {
        console.log("[CreditsLedgerTab] useEffect triggered! user.credits is:", user?.credits);
        fetchLedger();
    }, [user?.credits]);

    const fetchLedger = async () => {
        console.log("[fetchLedger] Start calling API...");
        try {
            setLoading(true);
            const res = await api.get(`/payments/ledger?_t=${Date.now()}`);
            console.log("[fetchLedger] Response:", res.data);
            if (Array.isArray(res.data)) {
                setTransactions(res.data);
            } else {
                console.error("[fetchLedger] Received non-array data:", res.data);
                setTransactions([]);
            }
        } catch (error) {
            console.error('Failed to fetch ledger', error);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionIcon = (type: string, amount: number) => {
        if (amount > 0) return <ArrowDownRight className="h-5 w-5 text-green-500" />;
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
    };

    const getStatusIcon = (status: string) => {
        if (status === 'COMPLETED') return <CheckCircle className="h-4 w-4 text-green-500" />;
        if (status === 'PENDING') return <Clock className="h-4 w-4 text-yellow-500" />;
        return <XCircle className="h-4 w-4 text-red-500" />;
    };

    const formatType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">Credits Wallet</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your funds and view your transaction history.</p>
                </div>

                <div className="mt-6 md:mt-0 flex items-center space-x-6">
                    <div className="text-right">
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Available Balance</div>
                        <div className="text-3xl font-bold text-yellow-600">{user.credits} Credits</div>
                    </div>
                    <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
                    <button
                        onClick={() => setWithdrawModalOpen(true)}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold shadow-md shadow-gray-900/20 hover:bg-gray-800 transition-all"
                    >
                        Withdraw
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Transaction History</h3>
                    <button onClick={fetchLedger} className="text-xs text-orange-600 hover:underline font-medium">Refresh</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-white/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Closing Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {loading && transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading ledger...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No transactions found.</td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${t.amount > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                                    {getTransactionIcon(t.type, t.amount)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{formatType(t.type)}</div>
                                                    <div className="text-[10px] text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.amount > 0 ? '+' : ''}{t.amount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-1.5">
                                                {getStatusIcon(t.status)}
                                                <span className="text-xs font-semibold text-gray-700">{t.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-gray-700">{t.balanceSnapshot} Credits</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <WithdrawModal
                isOpen={withdrawModalOpen}
                onClose={() => setWithdrawModalOpen(false)}
                maxCredits={user.credits}
                onSuccess={(amount) => {
                    onUserUpdate({ ...user, credits: user.credits - amount });
                    fetchLedger();
                }}
            />
        </div>
    );
}
