'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors duration-500 ${
                isDark ? 'bg-indigo-900' : 'bg-sky-300'
            } ${className}`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Stars (dark mode) */}
            <div className={`absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute w-1 h-1 bg-white rounded-full top-1.5 left-2 animate-pulse" />
                <div className="absolute w-0.5 h-0.5 bg-white/70 rounded-full top-3 left-4" />
                <div className="absolute w-1 h-1 bg-white/50 rounded-full bottom-1.5 left-3 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Toggle ball */}
            <motion.div
                layout
                className={`absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                    isDark ? 'bg-slate-200' : 'bg-yellow-300'
                }`}
                animate={{ left: isDark ? '30px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                {isDark ? (
                    <svg className="w-3.5 h-3.5 text-indigo-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                ) : (
                    <svg className="w-3.5 h-3.5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}
            </motion.div>
        </button>
    );
}
