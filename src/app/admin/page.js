'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatRelativeDate } from '@/lib/utils';

export default function AdminPage() {
    const { user, isAuthenticated, loading: authLoading, authFetch, isAdmin } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('stats');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || !isAdmin) {
                router.push('/');
                return;
            }
            fetchStats();
        }
    }, [authLoading, isAuthenticated, isAdmin]);

    const fetchStats = async () => {
        try {
            const res = await authFetch('/api/admin?action=stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Admin fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async (action) => {
        setLoading(true);
        try {
            const res = await authFetch(`/api/admin?action=${action}`);
            const result = await res.json();
            setData(result[action] || result.stories || result.users || result.comments || []);
        } catch (error) {
            console.error('Admin fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab !== 'stats') fetchData(tab);
    };

    const handleDelete = async (type, id) => {
        if (!confirm(`Delete this ${type}?`)) return;
        try {
            await authFetch(`/api/admin?type=${type}&id=${id}`, { method: 'DELETE' });
            setData(data.filter((item) => item._id !== id));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (authLoading || loading) {
        return <div className="page-container flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" text="Loading admin panel..." /></div>;
    }

    return (
        <div className="page-container">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="section-title mb-2">Admin <span className="gradient-text">Panel</span></h1>
                    <p className="section-subtitle mb-8">Manage your platform</p>
                </motion.div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {[
                            { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-cyan-500' },
                            { label: 'Total Stories', value: stats.totalStories, icon: '📖', color: 'from-purple-500 to-pink-500' },
                            { label: 'Total Comments', value: stats.totalComments, icon: '💬', color: 'from-amber-500 to-orange-500' },
                        ].map((stat) => (
                            <div key={stat.label} className="glass-card text-center">
                                <div className="text-3xl mb-2">{stat.icon}</div>
                                <div className="text-3xl font-display font-bold">{stat.value}</div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {['stats', 'stories', 'users', 'comments'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Data Table */}
                {activeTab !== 'stats' && (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-dark-600">
                                    <tr>
                                        {activeTab === 'stories' && (
                                            <>
                                                <th className="text-left px-4 py-3 text-sm font-semibold">Title</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold">Author</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold">Visibility</th>
                                                <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
                                            </>
                                        )}
                                        {activeTab === 'users' && (
                                            <>
                                                <th className="text-left px-4 py-3 text-sm font-semibold">Name</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold">Email</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold">Role</th>
                                                <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
                                            </>
                                        )}
                                        {activeTab === 'comments' && (
                                            <>
                                                <th className="text-left px-4 py-3 text-sm font-semibold">User</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold">Comment</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold">Story</th>
                                                <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                                    {data.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-dark-600/50">
                                            {activeTab === 'stories' && (
                                                <>
                                                    <td className="px-4 py-3 text-sm">{item.title}</td>
                                                    <td className="px-4 py-3 text-sm">{item.author?.name || item.author?.email || 'Unknown'}</td>
                                                    <td className="px-4 py-3 text-sm capitalize">{item.visibility}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleDelete('story', item._id)} className="text-red-500 hover:text-red-400 text-sm">Delete</button>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'users' && (
                                                <>
                                                    <td className="px-4 py-3 text-sm">{item.name}</td>
                                                    <td className="px-4 py-3 text-sm">{item.email}</td>
                                                    <td className="px-4 py-3 text-sm capitalize">{item.role}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleDelete('user', item._id)} className="text-red-500 hover:text-red-400 text-sm">Ban</button>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'comments' && (
                                                <>
                                                    <td className="px-4 py-3 text-sm">{item.user?.name || 'Unknown'}</td>
                                                    <td className="px-4 py-3 text-sm max-w-xs truncate">{item.text}</td>
                                                    <td className="px-4 py-3 text-sm">{item.story?.title || 'Unknown'}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleDelete('comment', item._id)} className="text-red-500 hover:text-red-400 text-sm">Delete</button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {data.length === 0 && (
                                <div className="text-center py-8 text-gray-500">No data found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Stories (stats tab) */}
                {activeTab === 'stats' && stats?.recentStories && (
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4">Recent Stories</h3>
                        <div className="space-y-3">
                            {stats.recentStories.map((story) => (
                                <div key={story._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-600">
                                    <div>
                                        <p className="font-medium text-sm">{story.title}</p>
                                        <p className="text-xs text-gray-500">{story.author?.name} · {formatRelativeDate(story.createdAt)}</p>
                                    </div>
                                    <span className={`badge ${story.visibility === 'public' ? '' : 'badge-accent'}`}>
                                        {story.visibility}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
