'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await api.auth.getCurrentUser();
            setUser(userData.user);
        } catch (err) {
            // Not authenticated, redirect to login
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.auth.logout();
            router.push('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        EmpowHer
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                            {user?.email || 'Anonymous User'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Welcome to Your Dashboard! 🎉
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Your multi-agent AI system is ready to support your wellness journey.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <a
                            href="/dashboard/checkin"
                            className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all"
                        >
                            <div className="text-4xl mb-3">📝</div>
                            <h3 className="text-xl font-bold text-purple-900 mb-2">Daily Check-In</h3>
                            <p className="text-gray-700">
                                Complete PHQ-2, GAD-2, and WHO-5 assessments for personalized AI insights
                            </p>
                        </a>

                        <a
                            href="/dashboard/insights"
                            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all"
                        >
                            <div className="text-4xl mb-3">📊</div>
                            <h3 className="text-xl font-bold text-blue-900 mb-2">View Insights</h3>
                            <p className="text-gray-700">
                                See your emotional trends and agent recommendations
                            </p>
                        </a>
                    </div>
                </div>

                {/* Agent Status */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        🤖 Your AI Agents
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-red-700">Priority 1</span>
                                <span className="text-2xl">🚨</span>
                            </div>
                            <h4 className="font-bold text-red-900">CrisisAgent</h4>
                            <p className="text-xs text-gray-600 mt-1">Monitoring for crisis</p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-blue-700">Priority 2</span>
                                <span className="text-2xl">🧠</span>
                            </div>
                            <h4 className="font-bold text-blue-900">ResearchGrounded</h4>
                            <p className="text-xs text-gray-600 mt-1">PHQ-2/GAD-2/WHO-5</p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-purple-700">Priority 3</span>
                                <span className="text-2xl">💡</span>
                            </div>
                            <h4 className="font-bold text-purple-900">EvidenceBased</h4>
                            <p className="text-xs text-gray-600 mt-1">Research-backed</p>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-orange-700">Priority 4</span>
                                <span className="text-2xl">🛡️</span>
                            </div>
                            <h4 className="font-bold text-orange-900">EthicsGuard</h4>
                            <p className="text-xs text-gray-600 mt-1">Cultural safety</p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-green-700">Priority 5</span>
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h4 className="font-bold text-green-900">SkillGrowth</h4>
                            <p className="text-xs text-gray-600 mt-1">Ready when stable</p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                            💡 <strong>How it works:</strong> When you submit a check-in, all five agents analyze your state in priority order using research-validated instruments (PHQ-2, GAD-2, WHO-5). They provide evidence-based insights and culturally-appropriate recommendations.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
