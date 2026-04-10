'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { GENRES, getGenreColor } from '@/lib/utils';

export default function EditStoryPage({ params }) {
    const { id } = params;
    const { user, isAuthenticated, authFetch } = useAuth();
    const router = useRouter();
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeChapter, setActiveChapter] = useState(0);
    const [generatingImage, setGeneratingImage] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchStory();
    }, [id]);

    const fetchStory = async () => {
        try {
            const res = await authFetch(`/api/stories/${id}`);
            const data = await res.json();
            setStory(data.story);
            setChapters(data.chapters || []);
        } catch (error) {
            console.error('Failed to fetch story:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveStory = async () => {
        setSaving(true);
        setError('');
        try {
            await authFetch(`/api/stories/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    title: story.title,
                    description: story.description,
                    genre: story.genre,
                    visibility: story.visibility,
                    coverImage: story.coverImage,
                }),
            });

            for (const chapter of chapters) {
                if (chapter._id) {
                    await authFetch(`/api/stories/${id}/chapters`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            chapterId: chapter._id,
                            title: chapter.title,
                            content: chapter.content,
                            image: chapter.image,
                        }),
                    });
                } else {
                    const res = await authFetch(`/api/stories/${id}/chapters`, {
                        method: 'POST',
                        body: JSON.stringify(chapter),
                    });
                    const data = await res.json();
                    chapter._id = data.chapter._id;
                }
            }

            setSuccess('Story saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to save story');
        } finally {
            setSaving(false);
        }
    };

    const addChapter = () => {
        setChapters([...chapters, {
            title: `Chapter ${chapters.length + 1}`,
            content: '',
            image: '',
            chapterNumber: chapters.length + 1,
        }]);
        setActiveChapter(chapters.length);
    };

    const updateChapter = (index, field, value) => {
        const updated = [...chapters];
        updated[index] = { ...updated[index], [field]: value };
        setChapters(updated);
    };

    const generateChapterImage = async () => {
        const chapter = chapters[activeChapter];
        if (!chapter.content) return;
        setGeneratingImage(true);
        try {
            const res = await authFetch('/api/ai/generate-image', {
                method: 'POST',
                body: JSON.stringify({ text: chapter.content }),
            });
            const data = await res.json();
            if (data.image?.url) {
                updateChapter(activeChapter, 'image', data.image.url);
            }
        } catch (err) {
            setError('Image generation failed');
        } finally {
            setGeneratingImage(false);
        }
    };

    if (loading) {
        return <div className="page-container flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
    }

    if (!story) {
        return <div className="page-container text-center py-20"><h2 className="text-2xl font-bold">Story not found</h2></div>;
    }

    return (
        <div className="page-container">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-display font-bold">Edit Story</h1>
                    <div className="flex gap-3">
                        <button onClick={() => router.push(`/story/${id}`)} className="btn-ghost">Cancel</button>
                        <button onClick={saveStory} disabled={saving} className="btn-primary">
                            {saving ? 'Saving...' : '💾 Save Changes'}
                        </button>
                    </div>
                </div>

                {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-500 text-sm">{success}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Story Details */}
                    <div className="space-y-4">
                        <div className="card p-5 space-y-4">
                            <h3 className="font-semibold text-sm">Story Details</h3>
                            <input type="text" value={story.title || ''} onChange={(e) => setStory({ ...story, title: e.target.value })} className="input-field" placeholder="Title" />
                            <textarea value={story.description || ''} onChange={(e) => setStory({ ...story, description: e.target.value })} className="textarea-field" placeholder="Description" rows={3} />
                            <select value={story.genre || ''} onChange={(e) => setStory({ ...story, genre: e.target.value })} className="input-field">
                                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <select value={story.visibility || 'draft'} onChange={(e) => setStory({ ...story, visibility: e.target.value })} className="input-field">
                                <option value="draft">Draft</option>
                                <option value="private">Private</option>
                                <option value="public">Public</option>
                            </select>
                        </div>

                        {/* Chapters List */}
                        <div className="card p-5 space-y-2">
                            <h3 className="font-semibold text-sm">Chapters</h3>
                            {chapters.map((ch, i) => (
                                <button key={i} onClick={() => setActiveChapter(i)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeChapter === i ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-600'}`}>
                                    {ch.title || `Chapter ${i + 1}`}
                                </button>
                            ))}
                            <button onClick={addChapter} className="w-full px-3 py-2 rounded-lg text-sm text-primary-500 border border-dashed border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                                + Add Chapter
                            </button>
                        </div>
                    </div>

                    {/* Chapter Editor */}
                    <div className="lg:col-span-2">
                        {chapters.length > 0 && (
                            <div className="card p-6 space-y-4">
                                <input
                                    type="text"
                                    value={chapters[activeChapter]?.title || ''}
                                    onChange={(e) => updateChapter(activeChapter, 'title', e.target.value)}
                                    className="text-xl font-display font-bold bg-transparent border-none outline-none w-full"
                                    placeholder="Chapter Title"
                                />
                                <textarea
                                    value={chapters[activeChapter]?.content || ''}
                                    onChange={(e) => updateChapter(activeChapter, 'content', e.target.value)}
                                    className="w-full min-h-[350px] bg-transparent border-none outline-none resize-none font-serif text-base leading-relaxed"
                                    placeholder="Write your chapter..."
                                />

                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-dark-600">
                                    <button onClick={generateChapterImage} disabled={generatingImage} className="btn-secondary text-sm">
                                        {generatingImage ? '⏳ Generating...' : '🎨 Generate Image'}
                                    </button>
                                </div>

                                {chapters[activeChapter]?.image && (
                                    <div className="rounded-xl overflow-hidden">
                                        <img src={chapters[activeChapter].image} alt="Chapter" className="w-full h-48 object-cover" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
