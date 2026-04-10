'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelativeDate } from '@/lib/utils';

export default function CommentSection({ storyId }) {
    const { user, isAuthenticated, authFetch } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [storyId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/stories/${storyId}/comment`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;

        setPosting(true);
        try {
            const res = await authFetch(`/api/stories/${storyId}/comment`, {
                method: 'POST',
                body: JSON.stringify({ content: newComment.trim() }),
            });
            const data = await res.json();
            if (data.comment) {
                setComments(prev => [data.comment, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setPosting(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await authFetch(`/api/stories/${storyId}/comment?commentId=${commentId}`, {
                method: 'DELETE',
            });
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const displayedComments = showAll ? comments : comments.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="font-display font-bold text-lg">
                    Comments <span className="text-gray-400 font-normal text-sm">({comments.length})</span>
                </h3>
            </div>

            {/* Comment Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts about this story..."
                            className="input-field !rounded-2xl min-h-[80px] resize-none text-sm"
                            rows={2}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={!newComment.trim() || posting}
                                className="btn-primary !px-5 !py-2 text-sm disabled:opacity-50"
                            >
                                {posting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Posting...
                                    </span>
                                ) : 'Post Comment'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="glass-card text-center py-6">
                    <p className="text-sm text-gray-500 mb-3">Sign in to leave a comment</p>
                    <a href="/auth/login" className="btn-secondary !px-4 !py-2 text-sm">Sign In</a>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {displayedComments.map((comment, index) => (
                            <motion.div
                                key={comment._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex gap-3 group"
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">{comment.user?.name || 'Unknown'}</span>
                                        <span className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {comment.content}
                                    </p>
                                    {user && (user._id === comment.user?._id || user.role === 'admin') && (
                                        <button
                                            onClick={() => handleDelete(comment._id)}
                                            className="text-xs text-red-400 hover:text-red-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {comments.length > 5 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                        >
                            {showAll ? 'Show less' : `View all ${comments.length} comments`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
