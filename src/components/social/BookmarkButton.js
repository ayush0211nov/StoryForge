'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function BookmarkButton({ storyId, initialBookmarked = false }) {
    const { isAuthenticated, authFetch } = useAuth();
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [animating, setAnimating] = useState(false);

    const handleBookmark = async () => {
        if (!isAuthenticated) return;

        setAnimating(true);
        const newBookmarked = !bookmarked;
        setBookmarked(newBookmarked);

        try {
            await authFetch(`/api/stories/${storyId}/bookmark`, {
                method: 'POST',
            });
        } catch (error) {
            setBookmarked(!newBookmarked);
        }

        setTimeout(() => setAnimating(false), 500);
    };

    return (
        <button
            onClick={handleBookmark}
            disabled={!isAuthenticated}
            className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                bookmarked
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-200 dark:border-amber-800'
                    : 'bg-gray-50 dark:bg-dark-600 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-500 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-500'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={!isAuthenticated ? 'Sign in to bookmark' : bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
            <motion.svg
                animate={animating ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`w-5 h-5 transition-all duration-300 ${bookmarked ? 'fill-amber-500 text-amber-500' : 'fill-none text-current'}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
            </motion.svg>
            <span>{bookmarked ? 'Saved' : 'Save'}</span>
        </button>
    );
}
