import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Landmark, CheckCircle, XCircle } from 'lucide-react';

export default function AdminWithdrawals() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/withdrawals');
            setRequests(res.data);
        } catch (error) {
            console.error('Failed to fetch withdrawal requests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;

        try {
            await api.post(`/admin/withdrawals/${id}/${action}`);
            alert(`Withdrawal ${action}d successfully`);
            fetchRequests();
        } catch (error: any) {
            console.error(`Failed to ${action} request`, error);
            alert(error.response?.data?.message || `Failed to ${action} the request`);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
                <Landmark className="h-5 w-5 text-gray-500" /> Pending Withdrawals
            </h2>

            {loading && requests.length === 0 ? (
                <div className="bg-white p-8 text-center text-gray-500 text-sm rounded-xl border border-gray-100 shadow-sm">
                    Loading withdrawal requests...
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-white p-8 text-center text-gray-500 text-sm rounded-xl border border-gray-100 shadow-sm">
                    No pending withdrawal requests.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-gray-200 transition-all">
                            <div className="mb-4">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-900 text-lg">₹{req.amount}</h4>
                                    <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                        {req.status}
                                    </span>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">User:</span> {req.user?.name} ({req.user?.email})</p>
                                    <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">UPI ID:</span> <span className="font-mono bg-gray-50 px-1 rounded">{req.upiVpa}</span></p>
                                    <p className="text-[10px] text-gray-400 mt-1">Requested on: {new Date(req.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2 pt-3 border-t border-gray-50">
                                <button
                                    onClick={() => handleAction(req.id, 'approve')}
                                    className="flex-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                                >
                                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'reject')}
                                    className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                                >
                                    <XCircle className="h-3.5 w-3.5" /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
