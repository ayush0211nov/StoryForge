'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AI_MODES = [
    { id: 'suggest', label: 'Continue Story', icon: '✨', description: 'Suggest what happens next', color: 'from-blue-500 to-cyan-500' },
    { id: 'improve', label: 'Improve Writing', icon: '📝', description: 'Enhance your prose', color: 'from-purple-500 to-pink-500' },
    { id: 'grammar', label: 'Fix Grammar', icon: '🔤', description: 'Correct errors', color: 'from-green-500 to-emerald-500' },
    { id: 'summarize', label: 'Summarize', icon: '📋', description: 'Generate a summary', color: 'from-amber-500 to-orange-500' },
];

export default function StoryAssistant({ text, onApply, className = '' }) {
    const { authFetch } = useAuth();
    const [activeMode, setActiveMode] = useState(null);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleAssist = async (mode) => {
        if (!text?.trim()) {
            setError('Write some content first before using AI assistance.');
            return;
        }

        setActiveMode(mode);
        setLoading(true);
        setError('');
        setResult('');

        try {
            const res = await authFetch('/api/ai/story-assist', {
                method: 'POST',
                body: JSON.stringify({ text, mode }),
            });
            const data = await res.json();
            if (data.result) {
                setResult(data.result);
            } else {
                setError('No result received. Please try again.');
            }
        } catch (err) {
            setError('AI assistance failed. Check your API key.');
        } finally {
            setLoading(false);
        }
    };

    const applyResult = () => {
        if (onApply && result) {
            onApply(result, activeMode);
            setResult('');
            setActiveMode(null);
        }
    };

    return (
        <div className={`card overflow-hidden ${className}`}>
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <span className="text-lg">🤖</span>
                    </div>
                    <div className="text-left">
                        <h3 className="font-display font-bold text-sm">AI Story Assistant</h3>
                        <p className="text-xs text-gray-500">Get AI-powered writing help</p>
                    </div>
                </div>
                <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="w-4 h-4 text-gray-400"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </button>

            {/* Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            {/* Mode Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                {AI_MODES.map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => handleAssist(mode.id)}
                                        disabled={loading}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                                            activeMode === mode.id
                                                ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                                                : 'bg-gray-50 dark:bg-dark-600 hover:bg-gray-100 dark:hover:bg-dark-500'
                                        } disabled:opacity-50`}
                                    >
                                        <span>{mode.icon}</span>
                                        <span>{mode.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800">
                                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm text-primary-600 dark:text-primary-400">
                                        AI is analyzing your text...
                                    </span>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-500 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Result */}
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 max-h-60 overflow-y-auto">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={applyResult}
                                            className="btn-primary !px-4 !py-2 text-xs flex-1"
                                        >
                                            {activeMode === 'suggest' ? '✨ Append to Story' : '✅ Apply Changes'}
                                        </button>
                                        <button
                                            onClick={() => { setResult(''); setActiveMode(null); }}
                                            className="btn-ghost !px-4 !py-2 text-xs"
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
