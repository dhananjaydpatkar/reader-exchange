'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Mail, Lock, User, Loader2, MapPin } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        dateOfBirth: '',
        schoolName: '',
        grade: '',
        university: '',
        majors: '',
        addressLine1: '',
        city: '',
        zipCode: '',
        localityId: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [localities, setLocalities] = useState<any[]>([]);

    useEffect(() => {
        api.get('/localities')
            .then(res => setLocalities(res.data))
            .catch(err => console.error('Failed to fetch localities', err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'localityId') {
            const selectedLocality = localities.find(loc => loc.id === value);
            setFormData({
                ...formData,
                [name]: value,
                zipCode: selectedLocality?.pinCode || ''
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/register', formData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            router.push('/dashboard');
        } catch (err: any) {
            // Handle array of errors from express-validator
            const msg = err.response?.data?.errors
                ? err.response.data.errors.map((e: any) => e.msg).join(', ')
                : (err.response?.data?.message || 'Registration failed.');
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfbf7] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-purple-200 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-orange-100 rounded-full blur-[100px]" />
            </div>

            <main className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-orange-100/50 border border-orange-100 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 font-serif">
                        Join the Exchange
                    </h1>
                    <p className="text-gray-500">Create your account to start trading books</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Personal Info */}
                    <div className="md:col-span-2 space-y-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Account Details</h3>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                name="name"
                                type="text"
                                placeholder="Full Name"
                                className="input-field pl-12"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                className="input-field pl-12"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                className="input-field pl-12"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <select
                            name="role"
                            className="input-field text-gray-700 appearance-none bg-white"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="student">Student</option>
                            <option value="academician">Academician</option>
                            <option value="professional">Professional</option>
                        </select>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                        <input
                            name="dateOfBirth"
                            type="date"
                            placeholder="Date of Birth"
                            className="input-field text-gray-700"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    {/* Student-specific fields */}
                    {formData.role === 'student' && (
                        <>
                            <div className="space-y-2">
                                <input
                                    name="schoolName"
                                    type="text"
                                    placeholder="School Name"
                                    className="input-field"
                                    value={formData.schoolName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <input
                                    name="grade"
                                    type="text"
                                    placeholder="Grade (e.g., 9th, 10th, Year 1)"
                                    className="input-field"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Academician-specific fields */}
                    {formData.role === 'academician' && (
                        <>
                            <div className="space-y-2">
                                <input
                                    name="university"
                                    type="text"
                                    placeholder="University Name"
                                    className="input-field"
                                    value={formData.university}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <input
                                    name="majors"
                                    type="text"
                                    placeholder="Major (e.g., Computer Science, Mathematics)"
                                    className="input-field"
                                    value={formData.majors}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Address Info */}
                    <div className="md:col-span-2 space-y-2 mt-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h3>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <div className="relative">
                            <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                name="addressLine1"
                                type="text"
                                placeholder="Street Address"
                                className="input-field pl-12"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <input
                            name="city"
                            type="text"
                            placeholder="City"
                            className="input-field"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <select
                                    name="localityId"
                                    className="input-field text-gray-700 appearance-none pr-10 bg-white"
                                    onChange={handleChange}
                                    value={formData.localityId}
                                    required
                                >
                                    <option value="" disabled>Locality</option>
                                    {localities.map((loc) => (
                                        <option key={loc.id} value={loc.id} className="text-gray-900">
                                            {loc.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-4 pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <input
                                name="zipCode"
                                type="text"
                                placeholder="Zip Code"
                                className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                                value={formData.zipCode}
                                required
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 mt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex justify-center items-center"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                        Sign In
                    </Link>
                </div>
            </main>
        </div>
    );
}
