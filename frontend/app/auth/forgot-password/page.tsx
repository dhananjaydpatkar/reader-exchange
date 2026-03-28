'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Mail, Lock, Loader2, ArrowRight, ShieldQuestion } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Form states
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleInit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/forgot-password/init', { email });
            setSecurityQuestion(response.data.securityQuestion);
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to initialize password reset.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/forgot-password/verify', { email, answer: securityAnswer });
            setResetToken(response.data.resetToken);
            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Incorrect answer. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/reset-password', { token: resetToken, newPassword });
            setSuccessMsg('Password reset successful. You can now log in with your new password.');
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Token might be expired.');
            // Go back to step 1 if token is expired
            if (err.response?.status === 400) {
                setStep(1);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfbf7] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-100 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[100px]" />
            </div>

            <main className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-orange-100/50 border border-orange-100 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">
                        Recover Account
                    </h1>
                    <p className="text-gray-500">
                        {step === 1 && 'Enter your email to continue'}
                        {step === 2 && 'Answer your security question'}
                        {step === 3 && 'Choose a new password'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm text-center">
                        {successMsg}
                    </div>
                )}

                {/* Step 1: Request Init */}
                {step === 1 && !successMsg && (
                    <form onSubmit={handleInit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="student@university.edu"
                                    className="input-field pl-12"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex justify-center items-center w-full mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </button>
                    </form>
                )}

                {/* Step 2: Verify Answer */}
                {step === 2 && !successMsg && (
                    <form onSubmit={handleVerify} className="space-y-5">
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 mb-4">
                            <p className="text-sm font-medium text-orange-800 break-words font-serif italic text-center">
                                "{securityQuestion}"
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Your Answer</label>
                            <div className="relative">
                                <ShieldQuestion className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Enter your security answer"
                                    className="input-field pl-12"
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex justify-center items-center w-full mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>Verify Answer <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => { setStep(1); setError(''); }}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Back
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Reset Password */}
                {step === 3 && !successMsg && (
                    <form onSubmit={handleReset} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="input-field pl-12"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="input-field pl-12"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex justify-center items-center w-full mt-4 bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                )}

                {!successMsg && (
                    <div className="mt-8 text-center text-sm text-gray-500">
                        Remembered your password?{' '}
                        <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                            Sign In
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
