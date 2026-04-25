import React, { useState } from 'react';
import api from '@/lib/api';
import { X, ShieldCheck } from 'lucide-react';

interface BuyCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCredits: number) => void;
}

export default function BuyCreditsModal({ isOpen, onClose, onSuccess }: BuyCreditsModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleBuy = async (credits: number, priceINR: number) => {
        try {
            setLoading(true);
            const res = await api.post('/payments/create-order', {
                amount: priceINR,
                credits: credits
            });
            const data = res.data;

            if (!data.orderId) {
                alert('Order creation failed');
                setLoading(false);
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockKey123',
                amount: data.amount,
                currency: data.currency,
                name: 'Reader Exchange',
                description: `Purchase of ${credits} Credits`,
                order_id: data.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await api.post('/payments/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        if (verifyRes.data.success) {
                            alert('Payment successful!');
                            onSuccess(verifyRes.data.credits);
                            onClose();
                        } else {
                            alert('Verification failed.');
                        }
                    } catch (err) {
                        console.error('Verify error', err);
                        alert('Payment verification failed. If amount was deducted, please contact support.');
                    }
                },
                prefill: {
                    name: 'Test User',
                    email: 'test@reader-exchange.com',
                    contact: '9999999999'
                },
                theme: {
                    color: '#f97316'
                }
            };

            if (!(window as any).Razorpay) {
                alert("Razorpay SDK not loaded. Try again.");
                return;
            }
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error('Error creating order', error);
            alert('Failed to initialize payment. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold font-serif text-gray-900">Get More Credits</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-600">
                        Use credits to rent or buy books from other members in the community. 1 Credit = ₹1.
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            disabled={loading}
                            onClick={() => handleBuy(100, 100)}
                            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-orange-100 bg-orange-50 hover:border-orange-500 hover:bg-orange-100 transition-all font-semibold text-orange-900 group disabled:opacity-50"
                        >
                            <span className="flex items-center space-x-2"><span>100 Credits</span></span>
                            <span className="text-orange-700">₹100</span>
                        </button>

                        <button
                            disabled={loading}
                            onClick={() => handleBuy(500, 500)}
                            className="relative w-full flex items-center justify-between p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all font-bold text-white shadow-lg shadow-orange-500/20 group overflow-hidden disabled:opacity-70"
                        >
                            <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-400 text-[10px] text-yellow-900 font-extrabold uppercase rounded-bl-lg tracking-wider">
                                Popular
                            </div>
                            <span className="flex items-center space-x-2"><span>500 Credits</span></span>
                            <span>₹500</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-400 justify-center mt-4">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Secured by Razorpay</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
