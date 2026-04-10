'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import StoryCard from '@/components/story/StoryCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

export default function ProfilePage({ params }) {
    const { id } = params;
    const { user: authUser, isAuthenticated, authFetch } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stories, setStories] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    const isOwnProfile = authUser?._id === id;

    useEffect(() => { fetchProfile(); }, [id]);

    const fetchProfile = async () => {
        try {
            const headers = {};
            const token = localStorage.getItem('storyforge_token');
            if (token) headers.Authorization = `Bearer ${token}`;

            const res = await fetch(`/api/users/${id}`, { headers });
            const data = await res.json();
            setProfile(data.user);
            setStories(data.stories || []);
            setIsFollowing(data.isFollowing);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFollow = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await authFetch(`/api/users/${id}/follow`, { method: 'POST' });
            const data = await res.json();
            setIsFollowing(data.following);
            setProfile({
                ...profile,
                followersCount: data.following ? profile.followersCount + 1 : profile.followersCount - 1,
            });
        } catch (error) {
            console.error('Follow failed:', error);
        }
    };

    if (loading) {
        return <div className="page-container flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
    }

    if (!profile) {
        return <div className="page-container text-center py-20"><h2 className="text-2xl font-bold">User not found</h2></div>;
    }

    return (
        <div className="page-container">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-glow">
                            {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-display font-bold mb-1">{profile.name}</h1>
                            {profile.bio && <p className="text-gray-500 dark:text-gray-400 mb-3">{profile.bio}</p>}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm text-gray-500">
                                <span><strong className="text-gray-900 dark:text-gray-100">{profile.storiesCount || stories.length}</strong> stories</span>
                                <span><strong className="text-gray-900 dark:text-gray-100">{profile.followersCount || 0}</strong> followers</span>
                                <span><strong className="text-gray-900 dark:text-gray-100">{profile.followingCount || 0}</strong> following</span>
                                <span>Joined {formatDate(profile.createdAt)}</span>
                            </div>
                        </div>
                        {!isOwnProfile && isAuthenticated && (
                            <button onClick={toggleFollow} className={isFollowing ? 'btn-secondary' : 'btn-primary'}>
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Stories */}
                <h2 className="text-xl font-display font-bold mb-4">Published Stories</h2>
                {stories.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-3">📚</div>
                        <p>No published stories yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stories.map((story) => (
                            <StoryCard key={story._id} story={story} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
