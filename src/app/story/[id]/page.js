'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, getGenreColor, formatRelativeDate } from '@/lib/utils';

export default function StoryDetailPage({ params }) {
    const { id } = params;
    const { user, isAuthenticated, authFetch } = useAuth();
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        fetchStory();
        fetchComments();
    }, [id]);

    const fetchStory = async () => {
        try {
            const headers = {};
            const token = localStorage.getItem('storyforge_token');
            if (token) headers.Authorization = `Bearer ${token}`;

            const res = await fetch(`/api/stories/${id}`, { headers });
            const data = await res.json();
            setStory(data.story);
            setChapters(data.chapters || []);
            setIsLiked(data.isLiked);
            setIsBookmarked(data.isBookmarked);
        } catch (error) {
            console.error('Failed to fetch story:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/stories/${id}/comment`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const toggleLike = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await authFetch(`/api/stories/${id}/like`, { method: 'POST' });
            const data = await res.json();
            setIsLiked(data.liked);
            setStory({
                ...story,
                likesCount: data.liked ? story.likesCount + 1 : story.likesCount - 1,
            });
        } catch (error) {
            console.error('Like failed:', error);
        }
    };

    const toggleBookmark = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await authFetch(`/api/stories/${id}/bookmark`, { method: 'POST' });
            const data = await res.json();
            setIsBookmarked(data.bookmarked);
        } catch (error) {
            console.error('Bookmark failed:', error);
        }
    };

    const postComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;
        try {
            const res = await authFetch(`/api/stories/${id}/comment`, {
                method: 'POST',
                body: JSON.stringify({ text: newComment }),
            });
            const data = await res.json();
            setComments([data.comment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Comment failed:', error);
        }
    };

    const downloadPDF = async () => {
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();

            // Title page
            doc.setFontSize(28);
            doc.text(story.title, 105, 60, { align: 'center' });
            doc.setFontSize(14);
            doc.text(`by ${story.author?.name || 'Unknown'}`, 105, 80, { align: 'center' });
            doc.setFontSize(11);
            doc.text(story.genre, 105, 95, { align: 'center' });
            if (story.description) {
                doc.setFontSize(10);
                const lines = doc.splitTextToSize(story.description, 150);
                doc.text(lines, 105, 120, { align: 'center' });
            }

            // Chapters
            for (const chapter of chapters) {
                doc.addPage();
                doc.setFontSize(18);
                doc.text(chapter.title, 20, 30);
                doc.setFontSize(11);
                const lines = doc.splitTextToSize(chapter.content, 170);
                doc.text(lines, 20, 45);
            }

            doc.save(`${story.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="page-container flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading story..." />
            </div>
        );
    }

    if (!story) {
        return (
            <div className="page-container text-center py-20">
                <div className="text-6xl mb-4">📖</div>
                <h2 className="text-2xl font-display font-bold mb-4">Story Not Found</h2>
                <Link href="/explore" className="btn-primary">Explore Stories</Link>
            </div>
        );
    }

    const isAuthor = user?._id === story.author?._id;

    return (
        <div className="page-container">
            <div className="max-w-4xl mx-auto">
                {/* Cover Image */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {story.coverImage ? (
                        <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden mb-8">
                            <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getGenreColor(story.genre)} mb-3`}>
                                    {story.genre}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">{story.title}</h1>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getGenreColor(story.genre)} mb-3`}>
                                {story.genre}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-display font-bold">{story.title}</h1>
                        </div>
                    )}
                </motion.div>

                {/* Author + Actions */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <Link href={`/profile/${story.author?._id}`} className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                            {story.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="font-semibold group-hover:text-primary-500 transition-colors">{story.author?.name}</p>
                            <p className="text-sm text-gray-500">{formatDate(story.createdAt)} · {story.readingTime || 1} min read</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button onClick={toggleLike} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isLiked ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500'}`}>
                            {isLiked ? '❤️' : '🤍'} {story.likesCount || 0}
                        </button>
                        <button onClick={toggleBookmark} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isBookmarked ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' : 'bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500'}`}>
                            {isBookmarked ? '🔖' : '📑'}
                        </button>
                        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 transition-all">
                            💬 {story.commentsCount || 0}
                        </button>
                        <button onClick={downloadPDF} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500">
                            📥 PDF
                        </button>
                        <Link href={`/story/${id}/read`} className="btn-primary !py-2">
                            📖 Read
                        </Link>
                        {isAuthor && (
                            <Link href={`/story/${id}/edit`} className="btn-secondary !py-2">
                                ✏️ Edit
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Description */}
                {story.description && (
                    <div className="card p-6 mb-8">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{story.description}</p>
                    </div>
                )}

                {/* Chapters List */}
                <div className="mb-8">
                    <h2 className="text-xl font-display font-bold mb-4">Chapters ({chapters.length})</h2>
                    <div className="space-y-3">
                        {chapters.map((chapter, index) => (
                            <motion.div
                                key={chapter._id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="card p-4 flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => window.location.href = `/story/${id}/read`}
                            >
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {chapter.chapterNumber || index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{chapter.title}</h3>
                                    <p className="text-sm text-gray-500 truncate">{chapter.content?.substring(0, 100) || 'No content'}</p>
                                </div>
                                {chapter.image && <span className="text-lg">🖼️</span>}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Comments */}
                {showComments && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                        <h3 className="text-lg font-display font-bold mb-4">Comments</h3>

                        {isAuthenticated && (
                            <form onSubmit={postComment} className="mb-6 flex gap-3">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="input-field flex-1"
                                    placeholder="Write a comment..."
                                />
                                <button type="submit" className="btn-primary !py-2">Post</button>
                            </form>
                        )}

                        <div className="space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No comments yet. Be the first!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-600">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold">{comment.user?.name}</span>
                                                <span className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
