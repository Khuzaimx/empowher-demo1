'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// Research instrument questions
const PHQ2_QUESTIONS = [
    {
        id: 'phq2_q1',
        text: 'Over the past 2 weeks, how often have you had little interest or pleasure in doing things?',
        simplified: 'In the past 2 weeks, how often did you feel less interested in things you usually enjoy?'
    },
    {
        id: 'phq2_q2',
        text: 'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?',
        simplified: 'In the past 2 weeks, how often did you feel very sad or without hope?'
    }
];

const GAD2_QUESTIONS = [
    {
        id: 'gad2_q1',
        text: 'Over the past 2 weeks, how often have you felt nervous, anxious, or on edge?',
        simplified: 'In the past 2 weeks, how often did you feel very worried or nervous?'
    },
    {
        id: 'gad2_q2',
        text: 'Over the past 2 weeks, how often have you not been able to stop or control worrying?',
        simplified: 'In the past 2 weeks, how often could you not stop worrying?'
    }
];

const WHO5_QUESTIONS = [
    {
        id: 'who5_q1',
        text: 'Over the past 2 weeks, I have felt cheerful and in good spirits',
        simplified: 'In the past 2 weeks, I felt happy and cheerful'
    },
    {
        id: 'who5_q2',
        text: 'Over the past 2 weeks, I have felt active and energetic',
        simplified: 'In the past 2 weeks, I felt active and full of energy'
    },
    {
        id: 'who5_q3',
        text: 'Over the past 2 weeks, I have felt calm and relaxed',
        simplified: 'In the past 2 weeks, I felt calm and peaceful'
    }
];

const PHQ_GAD_SCALE = [
    { value: 0, label: 'Not at all' },
    { value: 1, label: 'Several days' },
    { value: 2, label: 'More than half the days' },
    { value: 3, label: 'Nearly every day' }
];

const WHO5_SCALE = [
    { value: 0, label: 'At no time' },
    { value: 1, label: 'Some of the time' },
    { value: 2, label: 'Less than half the time' },
    { value: 3, label: 'More than half the time' },
    { value: 4, label: 'Most of the time' },
    { value: 5, label: 'All of the time' }
];

export default function CheckInPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [useSimplified, setUseSimplified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        phq2_q1: null as number | null,
        phq2_q2: null as number | null,
        gad2_q1: null as number | null,
        gad2_q2: null as number | null,
        who5_q1: null as number | null,
        who5_q2: null as number | null,
        who5_q3: null as number | null,
        journal: '',
        interests: [] as string[]
    });

    const handleResponse = (questionId: string, value: number) => {
        setFormData(prev => ({ ...prev, [questionId]: value }));
    };

    const isStepComplete = () => {
        switch (step) {
            case 1: // PHQ-2
                return formData.phq2_q1 !== null && formData.phq2_q2 !== null;
            case 2: // GAD-2
                return formData.gad2_q1 !== null && formData.gad2_q2 !== null;
            case 3: // WHO-5
                return formData.who5_q1 !== null && formData.who5_q2 !== null && formData.who5_q3 !== null;
            case 4: // Journal (optional)
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (isStepComplete()) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => Math.max(1, prev - 1));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            // Filter out null values and convert to proper format
            const submitData: any = {
                journal: formData.journal,
                interests: formData.interests
            };

            // Only include non-null research instrument responses
            if (formData.phq2_q1 !== null) submitData.phq2_q1 = formData.phq2_q1;
            if (formData.phq2_q2 !== null) submitData.phq2_q2 = formData.phq2_q2;
            if (formData.gad2_q1 !== null) submitData.gad2_q1 = formData.gad2_q1;
            if (formData.gad2_q2 !== null) submitData.gad2_q2 = formData.gad2_q2;
            if (formData.who5_q1 !== null) submitData.who5_q1 = formData.who5_q1;
            if (formData.who5_q2 !== null) submitData.who5_q2 = formData.who5_q2;
            if (formData.who5_q3 !== null) submitData.who5_q3 = formData.who5_q3;

            console.log('Submitting check-in data:', submitData);

            const result = await api.emotional.submitCheckin(submitData);

            console.log('Check-in result:', result);

            // Redirect to results page with the entry ID
            router.push(`/dashboard/checkin/results?id=${result.entry.id}`);
        } catch (err: any) {
            console.error('Check-in submission error:', err);
            const errorMessage = err.message || 'Failed to submit check-in';

            // Check if it's an authentication error
            if (errorMessage.includes('Authentication') || errorMessage.includes('auth')) {
                setError('Please log in to submit a check-in. Redirecting to login...');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setError(errorMessage);
            }

            setLoading(false);
        }
    };

    const renderQuestionSet = (questions: typeof PHQ2_QUESTIONS, scale: typeof PHQ_GAD_SCALE) => {
        return (
            <div className="space-y-8">
                {questions.map((question) => {
                    const currentValue = formData[question.id as keyof typeof formData] as number | null;

                    return (
                        <div key={question.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {useSimplified ? question.simplified : question.text}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {scale.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleResponse(question.id, option.value)}
                                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${currentValue === option.value
                                            ? 'border-purple-600 bg-purple-50 text-purple-900'
                                            : 'border-gray-200 hover:border-purple-300 text-gray-700'
                                            }`}
                                    >
                                        <div className="font-semibold mb-1">{option.value}</div>
                                        <div className="text-sm">{option.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Daily Check-In
                    </h1>
                    <p className="text-gray-600">
                        Answer a few questions to help us understand how you're feeling
                    </p>
                </div>

                {/* Language Toggle */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setUseSimplified(!useSimplified)}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                        {useSimplified ? 'Use Standard Language' : 'Use Simplified Language'}
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Step {step} of 4</span>
                        <span className="text-sm font-medium text-gray-700">{Math.round((step / 4) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Step Content */}
                <div className="mb-8">
                    {step === 1 && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Depression Screening (PHQ-2)</h2>
                                <p className="text-gray-600">
                                    These questions help us understand if you might be feeling low
                                </p>
                            </div>
                            {renderQuestionSet(PHQ2_QUESTIONS, PHQ_GAD_SCALE)}
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Anxiety Screening (GAD-2)</h2>
                                <p className="text-gray-600">
                                    These questions help us understand if you might be feeling worried
                                </p>
                            </div>
                            {renderQuestionSet(GAD2_QUESTIONS, PHQ_GAD_SCALE)}
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Wellbeing Check (WHO-5)</h2>
                                <p className="text-gray-600">
                                    These questions help us understand your overall wellbeing
                                </p>
                            </div>
                            {renderQuestionSet(WHO5_QUESTIONS, WHO5_SCALE)}
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Journal Entry (Optional)</h2>
                                <p className="text-gray-600">
                                    Share what's on your mind. This is private and encrypted.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <textarea
                                    value={formData.journal}
                                    onChange={(e) => setFormData(prev => ({ ...prev, journal: e.target.value }))}
                                    placeholder="How are you feeling today? What's on your mind?"
                                    className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    {formData.journal.length} characters
                                </p>
                            </div>

                            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <p className="text-sm text-purple-900">
                                    <strong>Privacy Note:</strong> Your journal is encrypted with AES-256 encryption.
                                    Only you can read it. We use AI to analyze the emotional tone (not the content)
                                    to provide better support.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${step === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
                            }`}
                    >
                        ← Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            disabled={!isStepComplete()}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${isStepComplete()
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Complete Check-In →'}
                        </button>
                    )}
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
