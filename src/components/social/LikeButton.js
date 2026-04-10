'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LikeButton({ storyId, initialLiked = false, initialCount = 0 }) {
    const { isAuthenticated, authFetch } = useAuth();
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [animating, setAnimating] = useState(false);

    const handleLike = async () => {
        if (!isAuthenticated) return;

        setAnimating(true);
        const newLiked = !liked;
        setLiked(newLiked);
        setCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            await authFetch(`/api/stories/${storyId}/like`, {
                method: 'POST',
            });
        } catch (error) {
            // Revert on error
            setLiked(!newLiked);
            setCount(prev => newLiked ? prev - 1 : prev + 1);
        }

        setTimeout(() => setAnimating(false), 600);
    };

    return (
        <button
            onClick={handleLike}
            disabled={!isAuthenticated}
            className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                liked
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-dark-600 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-500 hover:border-red-300 dark:hover:border-red-700 hover:text-red-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={!isAuthenticated ? 'Sign in to like' : liked ? 'Unlike' : 'Like'}
        >
            <div className="relative">
                <motion.svg
                    animate={animating ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`w-5 h-5 transition-all duration-300 ${liked ? 'fill-red-500 text-red-500' : 'fill-none text-current'}`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </motion.svg>
                <AnimatePresence>
                    {animating && liked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <span className="text-red-500 text-lg">❤️</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <span>{count}</span>
        </button>
    );
}
