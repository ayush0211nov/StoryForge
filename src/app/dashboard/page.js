'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import StoryCard from '@/components/story/StoryCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
    const { user, isAuthenticated, loading: authLoading, authFetch } = useAuth();
    const router = useRouter();
    const [stories, setStories] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        if (isAuthenticated && user) {
            fetchData();
        }
    }, [isAuthenticated, authLoading, user]);

    const fetchData = async () => {
        try {
            const [storiesRes, bookmarksRes] = await Promise.all([
                authFetch(`/api/stories?author=${user._id}`),
                authFetch(`/api/stories/${user._id}/bookmark`),
            ]);
            const storiesData = await storiesRes.json();
            setStories(storiesData.stories || []);

            try {
                const bookmarksData = await bookmarksRes.json();
                setBookmarks(bookmarksData.stories || []);
            } catch {
                setBookmarks([]);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteStory = async (storyId) => {
        if (!confirm('Are you sure you want to delete this story?')) return;
        try {
            await authFetch(`/api/stories/${storyId}`, { method: 'DELETE' });
            setStories(stories.filter((s) => s._id !== storyId));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="page-container flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    const published = stories.filter((s) => s.visibility === 'public');
    const privateStories = stories.filter((s) => s.visibility === 'private');
    const drafts = stories.filter((s) => s.visibility === 'draft');

    const filteredStories = activeTab === 'all' ? stories
        : activeTab === 'published' ? published
            : activeTab === 'private' ? privateStories
                : activeTab === 'drafts' ? drafts
                    : activeTab === 'bookmarks' ? bookmarks : [];

    return (
        <div className="page-container">
            {/* Header with Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="section-title mb-1">
                            Welcome back, <span className="gradient-text">{user?.name}</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage your stories and track your progress</p>
                    </div>
                    <Link href="/create" className="btn-primary">
                        + New Story
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Stories', value: stories.length, icon: '📖', color: 'from-blue-500 to-cyan-500' },
                        { label: 'Published', value: published.length, icon: '🌍', color: 'from-green-500 to-emerald-500' },
                        { label: 'Drafts', value: drafts.length, icon: '📝', color: 'from-amber-500 to-orange-500' },
                        { label: 'Bookmarks', value: bookmarks.length, icon: '🔖', color: 'from-purple-500 to-pink-500' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card text-center">
                            <div className="text-2xl mb-1">{stat.icon}</div>
                            <div className="text-2xl font-display font-bold">{stat.value}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-dark-600 pb-4">
                {[
                    { id: 'all', label: 'All Stories', count: stories.length },
                    { id: 'published', label: 'Published', count: published.length },
                    { id: 'private', label: 'Private', count: privateStories.length },
                    { id: 'drafts', label: 'Drafts', count: drafts.length },
                    { id: 'bookmarks', label: 'Bookmarks', count: bookmarks.length },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Stories Grid */}
            {filteredStories.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-display font-bold mb-2">
                        {activeTab === 'bookmarks' ? 'No bookmarks yet' : 'No stories yet'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {activeTab === 'bookmarks'
                            ? 'Bookmark stories from the explore page to save them here'
                            : 'Start writing your first story and bring your ideas to life'}
                    </p>
                    {activeTab !== 'bookmarks' && (
                        <Link href="/create" className="btn-primary">Create Your First Story</Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStories.map((story) => (
                        <div key={story._id} className="relative group">
                            <StoryCard story={story} />
                            {activeTab !== 'bookmarks' && (
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                                    <Link
                                        href={`/story/${story._id}/edit`}
                                        className="p-2 rounded-lg bg-white/90 dark:bg-dark-700/90 shadow hover:shadow-lg transition-all"
                                        title="Edit"
                                    >
                                        ✏️
                                    </Link>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteStory(story._id); }}
                                        className="p-2 rounded-lg bg-white/90 dark:bg-dark-700/90 shadow hover:shadow-lg transition-all"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
