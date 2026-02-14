'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

interface CheckInResult {
    entryId: string;
    emotionalLevel: string;
    insights: string[];
    encouragement: string;
    trend: string;
    immediateActions: Array<{
        type: string;
        title: string;
        description: string;
        priority: number;
        expectedDuration: number;
    }>;
    ethicalAdjustments?: Array<{
        interventionType: string;
        reason: string;
        action: string;
    }>;
    agentDecisions: {
        emotional: {
            confidence: number;
            reasoning: string;
        };
    };
}

const TIER_COLORS = {
    green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        badge: 'bg-green-100 text-green-800'
    },
    yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-900',
        badge: 'bg-yellow-100 text-yellow-800'
    },
    orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-900',
        badge: 'bg-orange-100 text-orange-800'
    },
    red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800'
    }
};

export default function CheckInResultsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const entryId = searchParams.get('id');

    const [result, setResult] = useState<CheckInResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!entryId) {
            router.push('/dashboard');
            return;
        }

        // In a real implementation, fetch the result from the API
        // For now, we'll use mock data
        const fetchResult = async () => {
            try {
                // TODO: Replace with actual API call
                // const data = await api.emotional.getEntry(entryId);

                // Mock data for demonstration
                const mockResult: CheckInResult = {
                    entryId,
                    emotionalLevel: 'yellow',
                    insights: [
                        'You are feeling okay, but there\'s room to feel even better',
                        'You might be feeling very worried lately',
                        'Your wellbeing is stable'
                    ],
                    encouragement: 'You\'re doing okay, but there\'s room to feel even better. Let\'s focus on small positive steps to boost your mood and energy.',
                    trend: 'stable',
                    immediateActions: [
                        {
                            type: 'guided_breathing',
                            title: '4-7-8 Breathing Exercise',
                            description: 'Breathe in for 4 counts, hold for 7, breathe out for 8. Repeat 4 times.',
                            priority: 1,
                            expectedDuration: 5
                        },
                        {
                            type: 'gratitude_practice',
                            title: 'Three Good Things',
                            description: 'Think of 3 small things that went okay today, no matter how small',
                            priority: 2,
                            expectedDuration: 5
                        },
                        {
                            type: 'gentle_movement',
                            title: 'Gentle Stretching',
                            description: 'Do 5 minutes of gentle stretches or a short walk',
                            priority: 3,
                            expectedDuration: 10
                        }
                    ],
                    agentDecisions: {
                        emotional: {
                            confidence: 0.85,
                            reasoning: 'Research-based assessment: PHQ-2=2 (OK), GAD-2=4 (RISK), WHO-5=65/100. Emotional tier: yellow.'
                        }
                    }
                };

                setResult(mockResult);
                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Failed to load results');
                setLoading(false);
            }
        };

        fetchResult();
    }, [entryId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing your check-in...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Results not found'}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const tierColors = TIER_COLORS[result.emotionalLevel as keyof typeof TIER_COLORS] || TIER_COLORS.yellow;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Check-In Complete!
                    </h1>
                    <p className="text-gray-600">Here's what our AI agents discovered</p>
                </div>

                {/* Emotional Level */}
                <div className={`${tierColors.bg} border-2 ${tierColors.border} rounded-2xl p-6 mb-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-2xl font-bold ${tierColors.text}`}>
                            Your Wellbeing Status
                        </h2>
                        <span className={`px-4 py-2 rounded-full font-semibold ${tierColors.badge} uppercase text-sm`}>
                            {result.emotionalLevel}
                        </span>
                    </div>
                    <p className={`text-lg ${tierColors.text}`}>
                        {result.encouragement}
                    </p>
                </div>

                {/* Insights */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Insights</h3>
                    <ul className="space-y-2">
                        {result.insights.map((insight, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-purple-600 mr-2">•</span>
                                <span className="text-gray-700">{insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recommended Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Recommended Activities</h3>
                    <p className="text-gray-600 mb-4">
                        These activities are personalized for you based on your current state:
                    </p>

                    <div className="space-y-4">
                        {result.immediateActions.map((action, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">{action.title}</h4>
                                    <span className="text-sm text-gray-500">{action.expectedDuration} min</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                                    Start Activity →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ethical Adjustments (if any) */}
                {result.ethicalAdjustments && result.ethicalAdjustments.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Personalized Adjustments</h4>
                        <p className="text-sm text-blue-800">
                            We've adjusted some recommendations to better match your needs and context.
                        </p>
                    </div>
                )}

                {/* AI Confidence */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">AI Confidence</span>
                        <span className="text-sm font-semibold text-gray-900">
                            {Math.round(result.agentDecisions.emotional.confidence * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${result.agentDecisions.emotional.confidence * 100}%` }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/checkin')}
                        className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all"
                    >
                        New Check-In
                    </button>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        This platform provides wellness guidance and educational support only.
                        It is not a substitute for professional medical or mental health care.
                    </p>
                </div>
            </div>
        </div>
    );
}
