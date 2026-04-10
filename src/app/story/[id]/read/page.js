'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function BookViewerPage({ params }) {
    const { id } = params;
    const { authFetch } = useAuth();
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState('next');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        fetchStory();
    }, [id]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                nextPage();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevPage();
            } else if (e.key === 'Escape') {
                setIsFullscreen(false);
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, chapters]);

    // Touch/swipe
    const touchStartX = useRef(null);
    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextPage();
            else prevPage();
        }
        touchStartX.current = null;
    };

    const fetchStory = async () => {
        try {
            setError(null);
            const res = await authFetch(`/api/stories/${id}`);
            const data = await res.json();
            
            if (!res.ok) {
                setError(data.error || 'Failed to fetch story');
                setStory(null);
                setChapters([]);
                return;
            }
            
            setStory(data.story);
            setChapters(data.chapters || []);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch story:', error);
            setError(error.message || 'Failed to load story');
            setStory(null);
            setChapters([]);
        } finally {
            setLoading(false);
        }
    };

    const playPageSound = () => {
        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => { });
            }
        } catch (e) { }
    };

    const totalPages = chapters.length + 1; // cover + chapters

    const nextPage = useCallback(() => {
        if (currentPage >= totalPages - 1 || isFlipping) return;
        setIsFlipping(true);
        setFlipDirection('next');
        playPageSound();
        setTimeout(() => {
            setCurrentPage((prev) => prev + 1);
            setIsFlipping(false);
        }, 600);
    }, [currentPage, totalPages, isFlipping]);

    const prevPage = useCallback(() => {
        if (currentPage <= 0 || isFlipping) return;
        setIsFlipping(true);
        setFlipDirection('prev');
        playPageSound();
        setTimeout(() => {
            setCurrentPage((prev) => prev - 1);
            setIsFlipping(false);
        }, 600);
    }, [currentPage, isFlipping]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <LoadingSpinner size="lg" text="Opening book..." />
            </div>
        );
    }

    if (!story) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl mb-4">{error || 'Story not found'}</p>
                    <p className="text-gray-400 mb-6 text-sm">
                        {error?.includes('Not authorized') && 'You do not have permission to view this story.'}
                        {error?.includes('not authorized') && 'Only the author can view draft stories.'}
                    </p>
                    <Link href="/explore" className="btn-primary">Back to Explore</Link>
                </div>
            </div>
        );
    }

    const currentChapter = currentPage > 0 ? chapters[currentPage - 1] : null;

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex flex-col items-center justify-center p-4 md:p-8"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Audio for page flip */}
            <audio ref={audioRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=" type="audio/wav" />
            </audio>

            {/* Top Bar */}
            <div className="w-full max-w-5xl flex items-center justify-between mb-4">
                <Link href={`/story/${id}`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Story
                </Link>
                <div className="text-gray-400 text-sm">
                    Page {currentPage + 1} of {totalPages}
                </div>
                <button onClick={toggleFullscreen} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
                </button>
            </div>

            {/* Book Container */}
            <div className="book-container w-full max-w-5xl flex-1 flex items-center justify-center">
                <div className="relative w-full" style={{ maxWidth: '900px', aspectRatio: '3/2' }}>
                    {/* Book shadow */}
                    <div className="absolute inset-4 rounded-lg bg-black/30 blur-2xl" />

                    {/* Book pages */}
                    <div className="relative w-full h-full flex rounded-2xl overflow-hidden shadow-2xl">
                        {/* Page animation */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPage}
                                initial={{
                                    rotateY: flipDirection === 'next' ? 90 : -90,
                                    opacity: 0
                                }}
                                animate={{
                                    rotateY: 0,
                                    opacity: 1
                                }}
                                exit={{
                                    rotateY: flipDirection === 'next' ? -90 : 90,
                                    opacity: 0
                                }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                className="w-full h-full flex"
                                style={{ perspective: '2000px' }}
                            >
                                {/* Cover Page */}
                                {currentPage === 0 ? (
                                    <div className="w-full h-full flex">
                                        {/* Left page - Cover Image */}
                                        <div className="w-1/2 bg-gradient-to-br from-dark-700 to-dark-800 relative flex items-center justify-center">
                                            {story.coverImage ? (
                                                <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                                                    <svg className="w-24 h-24 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        {/* Right page - Title */}
                                        <div className="w-1/2 bg-amber-50 dark:bg-stone-900 flex flex-col items-center justify-center p-8 text-center border-l border-amber-200 dark:border-stone-700">
                                            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 dark:text-stone-200 mb-4">
                                                {story.title}
                                            </h1>
                                            <div className="w-16 h-0.5 bg-stone-400 dark:bg-stone-600 mb-4" />
                                            <p className="text-sm font-serif text-stone-600 dark:text-stone-400 mb-2">
                                                by {story.author?.name || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-stone-500 dark:text-stone-500 italic mt-4 max-w-xs">
                                                {story.description?.substring(0, 150)}
                                            </p>
                                            <div className="mt-8 text-xs text-stone-400">
                                                {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Chapter Pages */
                                    <div className="w-full h-full flex">
                                        {/* Left page - Text */}
                                        <div className="w-1/2 bg-amber-50 dark:bg-stone-900 p-6 md:p-8 flex flex-col overflow-y-auto border-r border-amber-200 dark:border-stone-700">
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
                                                    Chapter {currentChapter?.chapterNumber || currentPage}
                                                </p>
                                                <h2 className="text-lg md:text-xl font-serif font-bold text-stone-800 dark:text-stone-200 mb-4">
                                                    {currentChapter?.title}
                                                </h2>
                                                <div className="w-10 h-0.5 bg-stone-300 dark:bg-stone-600 mb-4" />
                                                <div className="font-serif text-sm md:text-base leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                                                    {currentChapter?.content}
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-400 text-center">
                                                — {currentPage} —
                                            </div>
                                        </div>

                                        {/* Right page - Image */}
                                        <div className="w-1/2 bg-amber-50 dark:bg-stone-900 flex items-center justify-center p-4">
                                            {currentChapter?.image ? (
                                                <div className="w-full h-full rounded-lg overflow-hidden shadow-inner">
                                                    <img
                                                        src={currentChapter.image}
                                                        alt={currentChapter.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-center text-stone-400">
                                                    <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-sm italic font-serif">No illustration available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="w-full max-w-5xl flex items-center justify-between mt-6">
                <button
                    onClick={prevPage}
                    disabled={currentPage <= 0 || isFlipping}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30 disabled:hover:bg-white/10"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                </button>

                {/* Page indicators */}
                <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => { if (!isFlipping) setCurrentPage(i); }}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? 'bg-primary-500 w-6' : 'bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextPage}
                    disabled={currentPage >= totalPages - 1 || isFlipping}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30 disabled:hover:bg-white/10"
                >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-xs text-gray-500 mt-4">
                Use ← → arrow keys or swipe to navigate · Press F for fullscreen
            </p>
        </div>
    );
}
