'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { GENRES, getGenreColor } from '@/lib/utils';
import ChapterEditor from './ChapterEditor';

export default function StoryEditor({ storyId, initialData = null, onSave }) {
    const { authFetch } = useAuth();
    const [story, setStory] = useState({
        title: '',
        description: '',
        genre: '',
        visibility: 'draft',
        coverImage: '',
        tags: '',
        ...(initialData || {}),
    });
    const [chapters, setChapters] = useState([
        { title: 'Chapter 1', content: '', image: '', imagePrompt: '' },
    ]);
    const [activeChapter, setActiveChapter] = useState(0);
    const [saving, setSaving] = useState(false);
    const [generatingCover, setGeneratingCover] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (storyId) {
            fetchStory();
        }
    }, [storyId]);

    const fetchStory = async () => {
        try {
            const res = await authFetch(`/api/stories/${storyId}`);
            const data = await res.json();
            if (data.story) {
                setStory({
                    title: data.story.title || '',
                    description: data.story.description || '',
                    genre: data.story.genre || '',
                    visibility: data.story.visibility || 'draft',
                    coverImage: data.story.coverImage || '',
                    tags: Array.isArray(data.story.tags) ? data.story.tags.join(', ') : '',
                });
            }
            if (data.chapters?.length > 0) {
                setChapters(data.chapters.map(ch => ({
                    _id: ch._id,
                    title: ch.title || '',
                    content: ch.content || '',
                    image: ch.image || '',
                    imagePrompt: ch.imagePrompt || '',
                    chapterNumber: ch.chapterNumber,
                })));
            }
        } catch (err) {
            setError('Failed to load story');
        }
    };

    const addChapter = () => {
        setChapters([...chapters, {
            title: `Chapter ${chapters.length + 1}`,
            content: '',
            image: '',
            imagePrompt: '',
        }]);
        setActiveChapter(chapters.length);
    };

    const updateChapter = (index, field, value) => {
        const updated = [...chapters];
        updated[index] = { ...updated[index], [field]: value };
        setChapters(updated);
    };

    const removeChapter = (index) => {
        if (chapters.length <= 1) return;
        const updated = chapters.filter((_, i) => i !== index);
        setChapters(updated);
        if (activeChapter >= updated.length) setActiveChapter(updated.length - 1);
    };

    const generateCover = async () => {
        if (!story.title) { setError('Add a title first'); return; }
        setGeneratingCover(true);
        try {
            const res = await authFetch('/api/ai/generate-image', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: `Book cover for "${story.title}": ${story.description}. Genre: ${story.genre || 'fiction'}. Style: professional book cover.`,
                }),
            });
            const data = await res.json();
            if (data.image?.url) {
                setStory({ ...story, coverImage: data.image.url });
            }
        } catch (err) {
            setError('Failed to generate cover');
        } finally {
            setGeneratingCover(false);
        }
    };

    const handleSave = async () => {
        if (!story.title || !story.genre) {
            setError('Title and genre are required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const storyPayload = {
                ...story,
                tags: story.tags.split(',').map(t => t.trim()).filter(Boolean),
            };

            let savedStoryId = storyId;

            if (storyId) {
                await authFetch(`/api/stories/${storyId}`, {
                    method: 'PUT',
                    body: JSON.stringify(storyPayload),
                });
            } else {
                const res = await authFetch('/api/stories', {
                    method: 'POST',
                    body: JSON.stringify(storyPayload),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                savedStoryId = data.story._id;
            }

            for (let i = 0; i < chapters.length; i++) {
                const ch = chapters[i];
                if (ch.title || ch.content) {
                    const chapterData = {
                        ...ch,
                        chapterNumber: i + 1,
                    };
                    if (ch._id) {
                        await authFetch(`/api/stories/${savedStoryId}/chapters`, {
                            method: 'PUT',
                            body: JSON.stringify(chapterData),
                        });
                    } else {
                        await authFetch(`/api/stories/${savedStoryId}/chapters`, {
                            method: 'POST',
                            body: JSON.stringify(chapterData),
                        });
                    }
                }
            }

            setSuccess('Story saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
            if (onSave) onSave(savedStoryId);
        } catch (err) {
            setError(err.message || 'Failed to save story');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
                {/* Story Details */}
                <div className="card p-4 space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        📖 Story Details
                    </h3>
                    <input
                        type="text"
                        value={story.title}
                        onChange={(e) => setStory({ ...story, title: e.target.value })}
                        className="input-field text-sm"
                        placeholder="Story Title *"
                    />
                    <textarea
                        value={story.description}
                        onChange={(e) => setStory({ ...story, description: e.target.value })}
                        className="textarea-field text-sm !min-h-[80px]"
                        placeholder="Description"
                        rows={3}
                    />
                    <select
                        value={story.genre}
                        onChange={(e) => setStory({ ...story, genre: e.target.value })}
                        className="input-field text-sm"
                    >
                        <option value="">Genre *</option>
                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select
                        value={story.visibility}
                        onChange={(e) => setStory({ ...story, visibility: e.target.value })}
                        className="input-field text-sm"
                    >
                        <option value="draft">Draft</option>
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                    </select>
                    <input
                        type="text"
                        value={story.tags}
                        onChange={(e) => setStory({ ...story, tags: e.target.value })}
                        className="input-field text-sm"
                        placeholder="Tags (comma separated)"
                    />

                    {/* Cover Image */}
                    {story.coverImage ? (
                        <div className="relative rounded-xl overflow-hidden h-32">
                            <img src={story.coverImage} alt="Cover" className="w-full h-full object-cover" />
                            <button
                                onClick={() => setStory({ ...story, coverImage: '' })}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={generateCover}
                            disabled={generatingCover}
                            className="w-full py-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-500 flex flex-col items-center gap-1 text-xs hover:border-primary-500 transition-colors disabled:opacity-50"
                        >
                            {generatingCover ? '⏳ Generating...' : '🎨 Generate Cover'}
                        </button>
                    )}
                </div>

                {/* Chapters Nav */}
                <div className="card p-4 space-y-2">
                    <h3 className="font-semibold text-sm mb-2">📚 Chapters</h3>
                    {chapters.map((ch, i) => (
                        <ChapterEditor
                            key={i}
                            chapter={ch}
                            index={i}
                            isActive={false}
                            onSelect={setActiveChapter}
                            onUpdate={updateChapter}
                            onRemove={removeChapter}
                            canRemove={chapters.length > 1}
                        />
                    ))}
                    <button
                        onClick={addChapter}
                        className="w-full px-3 py-2 rounded-xl text-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border border-dashed border-primary-300 dark:border-primary-700"
                    >
                        + Add Chapter
                    </button>
                </div>
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-3">
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
                        {success}
                    </motion.div>
                )}

                <ChapterEditor
                    chapter={chapters[activeChapter]}
                    index={activeChapter}
                    isActive={true}
                    onUpdate={updateChapter}
                    onRemove={removeChapter}
                    onSelect={setActiveChapter}
                    canRemove={chapters.length > 1}
                />

                {/* Save Bar */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => { setStory({ ...story, visibility: 'draft' }); handleSave(); }}
                        className="btn-secondary"
                        disabled={saving}
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        disabled={saving}
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : '🚀 Save & Publish'}
                    </button>
                </div>
            </div>
        </div>
    );
}
