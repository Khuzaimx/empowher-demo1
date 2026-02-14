'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function InsightsPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.emotional.getHistory(30); // Get last 30 days
                setHistory(data.entries.reverse()); // Reverse to show oldest to newest
            } catch (err: any) {
                console.error('Failed to fetch history:', err);
                setError('Failed to load emotional history');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-500 bg-white p-6 rounded-lg shadow-sm border border-red-200">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Process data for charts
    const labels = history.map(entry => {
        const date = new Date(entry.created_at);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const who5Data = history.map(entry => entry.who5_total_score || 0); // Normalized 0-100
    const phq2Data = history.map(entry => entry.phq2_total_score || 0); // 0-6
    const gad2Data = history.map(entry => entry.gad2_total_score || 0); // 0-6
    const moodData = history.map(entry => entry.mood_score || 0); // 1-10

    const who5ChartData = {
        labels,
        datasets: [
            {
                label: 'Wellbeing Index (WHO-5)',
                data: who5Data,
                borderColor: 'rgb(147, 51, 234)', // Purple-600
                backgroundColor: 'rgba(147, 51, 234, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const riskChartData = {
        labels,
        datasets: [
            {
                label: 'Depression Score (PHQ-2)',
                data: phq2Data,
                backgroundColor: 'rgba(239, 68, 68, 0.5)', // Red-500
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1,
            },
            {
                label: 'Anxiety Score (GAD-2)',
                data: gad2Data,
                backgroundColor: 'rgba(245, 158, 11, 0.5)', // Amber-500
                borderColor: 'rgb(245, 158, 11)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Your Emotional Insights</h1>
                    <p className="mt-2 text-gray-600">Track your wellbeing over time and discover patterns.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Wellbeing Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Wellbeing Trends (WHO-5)</h2>
                        <div className="h-64">
                            <Line
                                data={who5ChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            min: 0,
                                            max: 100,
                                            title: { display: true, text: 'Score (0-100)' }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            Higher scores (closer to 100) indicate better wellbeing. Scores below 50 suggest low mood.
                        </p>
                    </div>

                    {/* Risk Indicators Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Anxiety & Depression Screening</h2>
                        <div className="h-64">
                            <Bar
                                data={riskChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            min: 0,
                                            max: 6,
                                            title: { display: true, text: 'Score (0-6)' }
                                        }
                                    },
                                    plugins: {
                                        annotation: {
                                            annotations: {
                                                line1: {
                                                    type: 'line',
                                                    yMin: 3,
                                                    yMax: 3,
                                                    borderColor: 'rgba(0,0,0,0.2)',
                                                    borderWidth: 1,
                                                    borderDash: [5, 5],
                                                    label: { content: 'Risk Threshold' }
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            Scores of 3 or higher may indicate a need for further assessment.
                        </p>
                    </div>
                </div>

                {/* Recent History Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wellbeing</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Flags</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {history.slice().reverse().map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(entry.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {entry.who5_total_score !== null ? `${entry.who5_total_score}/100` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${entry.emotional_level === 'green' ? 'bg-green-100 text-green-800' :
                                                    entry.emotional_level === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                                        entry.emotional_level === 'orange' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                {entry.emotional_level?.toUpperCase() || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {entry.depression_risk_flag && (
                                                <span className="text-red-600 mr-2">Depression Risk</span>
                                            )}
                                            {entry.anxiety_risk_flag && (
                                                <span className="text-amber-600">Anxiety Risk</span>
                                            )}
                                            {!entry.depression_risk_flag && !entry.anxiety_risk_flag && (
                                                <span className="text-green-600">None</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
