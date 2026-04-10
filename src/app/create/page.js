'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GENRES, getGenreColor } from '@/lib/utils';

export default function CreateStoryPage() {
    const { isAuthenticated, authFetch } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generatingCover, setGeneratingCover] = useState(false);
    const [error, setError] = useState('');

    const [story, setStory] = useState({
        title: '',
        description: '',
        genre: '',
        visibility: 'draft',
        coverImage: '',
        tags: '',
    });

    const [chapters, setChapters] = useState([
        { title: 'Chapter 1', content: '', image: '', imagePrompt: '' },
    ]);

    const [activeChapter, setActiveChapter] = useState(0);
    const [generatingImage, setGeneratingImage] = useState(false);
    const [aiAssisting, setAiAssisting] = useState(false);

    if (!isAuthenticated) {
        return (
            <div className="page-container flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <h2 className="text-2xl font-display font-bold mb-4">Sign in to Create</h2>
                    <p className="text-gray-500 mb-6">You need an account to start writing stories.</p>
                    <a href="/auth/login" className="btn-primary">Sign In</a>
                </div>
            </div>
        );
    }

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

    const generateCoverImage = async () => {
        if (!story.title || !story.description) {
            setError('Add a title and description first');
            return;
        }
        setGeneratingCover(true);
        try {
            const res = await authFetch('/api/ai/generate-image', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: `Book cover for "${story.title}": ${story.description}. Genre: ${story.genre || 'fiction'}. Style: professional book cover, dramatic lighting, artistic.`,
                }),
            });
            const data = await res.json();
            if (data.image?.url) {
                setStory({ ...story, coverImage: data.image.url });
            }
        } catch (err) {
            setError('Failed to generate cover image');
        } finally {
            setGeneratingCover(false);
        }
    };

    const generateChapterImage = async () => {
        const chapter = chapters[activeChapter];
        if (!chapter.content) {
            setError('Write some content first');
            return;
        }
        setGeneratingImage(true);
        try {
            const res = await authFetch('/api/ai/generate-image', {
                method: 'POST',
                body: JSON.stringify({ text: chapter.content }),
            });
            const data = await res.json();
            if (data.image?.url) {
                updateChapter(activeChapter, 'image', data.image.url);
                updateChapter(activeChapter, 'imagePrompt', data.prompt);
            }
        } catch (err) {
            setError('Failed to generate image');
        } finally {
            setGeneratingImage(false);
        }
    };

    const aiAssist = async (mode) => {
        const chapter = chapters[activeChapter];
        if (!chapter.content) {
            setError('Write some content first');
            return;
        }
        setAiAssisting(true);
        try {
            const res = await authFetch('/api/ai/story-assist', {
                method: 'POST',
                body: JSON.stringify({ text: chapter.content, mode }),
            });
            const data = await res.json();
            if (mode === 'suggest') {
                updateChapter(activeChapter, 'content', chapter.content + '\n\n' + data.result);
            } else {
                updateChapter(activeChapter, 'content', data.result);
            }
        } catch (err) {
            setError('AI assist failed');
        } finally {
            setAiAssisting(false);
        }
    };

    const handlePublish = async () => {
        if (!story.title || !story.genre) {
            setError('Title and genre are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const storyRes = await authFetch('/api/stories', {
                method: 'POST',
                body: JSON.stringify({
                    ...story,
                    tags: story.tags.split(',').map((t) => t.trim()).filter(Boolean),
                }),
            });
            const storyData = await storyRes.json();

            if (!storyRes.ok) throw new Error(storyData.error);

            for (const chapter of chapters) {
                if (chapter.title || chapter.content) {
                    await authFetch(`/api/stories/${storyData.story._id}/chapters`, {
                        method: 'POST',
                        body: JSON.stringify(chapter),
                    });
                }
            }

            router.push(`/story/${storyData.story._id}`);
        } catch (err) {
            setError(err.message || 'Failed to create story');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-display font-bold mb-2">Create Your Story</h1>
                    <p className="text-gray-500 dark:text-gray-400">Write chapters, generate AI illustrations, and publish your tale</p>
                </motion.div>

                {/* Steps */}
                <div className="flex items-center gap-3 mb-8">
                    {[
                        { n: 1, label: 'Story Details' },
                        { n: 2, label: 'Write Chapters' },
                        { n: 3, label: 'Review & Publish' },
                    ].map((s) => (
                        <button
                            key={s.n}
                            onClick={() => setStep(s.n)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step === s.n
                                    ? 'bg-primary-500 text-white shadow-glow'
                                    : step > s.n
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'bg-gray-100 dark:bg-dark-600 text-gray-500'
                                }`}
                        >
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-current">
                                {step > s.n ? '✓' : s.n}
                            </span>
                            <span className="hidden sm:block">{s.label}</span>
                        </button>
                    ))}
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </motion.div>
                )}

                {/* Step 1: Story Details */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Story Title *</label>
                            <input
                                type="text"
                                value={story.title}
                                onChange={(e) => setStory({ ...story, title: e.target.value })}
                                className="input-field text-lg"
                                placeholder="Enter your story title..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={story.description}
                                onChange={(e) => setStory({ ...story, description: e.target.value })}
                                className="textarea-field"
                                placeholder="What is your story about?"
                                rows={4}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Genre *</label>
                            <div className="flex flex-wrap gap-2">
                                {GENRES.map((genre) => (
                                    <button
                                        key={genre}
                                        onClick={() => setStory({ ...story, genre })}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${story.genre === genre
                                                ? `bg-gradient-to-r ${getGenreColor(genre)} text-white shadow-lg`
                                                : 'bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500'
                                            }`}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Visibility</label>
                            <div className="flex gap-3">
                                {['draft', 'private', 'public'].map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setStory({ ...story, visibility: v })}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${story.visibility === v
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500'
                                            }`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={story.tags}
                                onChange={(e) => setStory({ ...story, tags: e.target.value })}
                                className="input-field"
                                placeholder="adventure, magic, heroes"
                            />
                        </div>

                        {/* Cover Image */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Cover Image</label>
                            {story.coverImage ? (
                                <div className="relative rounded-2xl overflow-hidden h-64">
                                    <img src={story.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setStory({ ...story, coverImage: '' })}
                                        className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={generateCoverImage}
                                    disabled={generatingCover}
                                    className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-300 dark:border-dark-500 flex flex-col items-center justify-center gap-3 hover:border-primary-500 transition-colors"
                                >
                                    {generatingCover ? (
                                        <>
                                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-sm text-gray-500">Generating AI cover...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-3xl">🎨</span>
                                            <span className="text-sm text-gray-500">Click to generate AI cover image</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button onClick={() => setStep(2)} className="btn-primary">
                                Next: Write Chapters →
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Chapters */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Chapter List Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="card p-4 space-y-2">
                                    <h3 className="font-semibold text-sm mb-3">Chapters</h3>
                                    {chapters.map((ch, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveChapter(i)}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between ${activeChapter === i
                                                    ? 'bg-primary-500 text-white'
                                                    : 'hover:bg-gray-100 dark:hover:bg-dark-600'
                                                }`}
                                        >
                                            <span className="truncate">{ch.title || `Chapter ${i + 1}`}</span>
                                            {ch.image && <span className="text-xs">🖼️</span>}
                                        </button>
                                    ))}
                                    <button onClick={addChapter} className="w-full px-3 py-2 rounded-xl text-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border border-dashed border-primary-300 dark:border-primary-700">
                                        + Add Chapter
                                    </button>
                                </div>

                                {/* AI Tools */}
                                <div className="card p-4 mt-4 space-y-2">
                                    <h3 className="font-semibold text-sm mb-3">🤖 AI Tools</h3>
                                    <button
                                        onClick={() => aiAssist('suggest')}
                                        disabled={aiAssisting}
                                        className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
                                    >
                                        ✨ Suggest Next
                                    </button>
                                    <button
                                        onClick={() => aiAssist('improve')}
                                        disabled={aiAssisting}
                                        className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
                                    >
                                        📝 Improve Writing
                                    </button>
                                    <button
                                        onClick={() => aiAssist('grammar')}
                                        disabled={aiAssisting}
                                        className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
                                    >
                                        🔤 Fix Grammar
                                    </button>
                                    <button
                                        onClick={generateChapterImage}
                                        disabled={generatingImage}
                                        className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
                                    >
                                        {generatingImage ? '⏳ Generating...' : '🎨 Generate Image'}
                                    </button>
                                </div>
                            </div>

                            {/* Editor */}
                            <div className="lg:col-span-3 space-y-4">
                                <div className="card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <input
                                            type="text"
                                            value={chapters[activeChapter].title}
                                            onChange={(e) => updateChapter(activeChapter, 'title', e.target.value)}
                                            className="text-xl font-display font-bold bg-transparent border-none outline-none w-full placeholder-gray-400"
                                            placeholder="Chapter Title"
                                        />
                                        {chapters.length > 1 && (
                                            <button
                                                onClick={() => removeChapter(activeChapter)}
                                                className="text-red-400 hover:text-red-500 text-sm p-2"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>

                                    <textarea
                                        value={chapters[activeChapter].content}
                                        onChange={(e) => updateChapter(activeChapter, 'content', e.target.value)}
                                        className="w-full min-h-[400px] bg-transparent border-none outline-none resize-none font-serif text-lg leading-relaxed placeholder-gray-400"
                                        placeholder="Start writing your story..."
                                    />

                                    {aiAssisting && (
                                        <div className="flex items-center gap-2 text-primary-500 text-sm mt-2">
                                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                            AI is working on your text...
                                        </div>
                                    )}
                                </div>

                                {/* Chapter Image */}
                                {chapters[activeChapter].image && (
                                    <div className="card p-4">
                                        <h4 className="text-sm font-medium mb-3">Chapter Illustration</h4>
                                        <div className="relative rounded-xl overflow-hidden">
                                            <img
                                                src={chapters[activeChapter].image}
                                                alt="Chapter illustration"
                                                className="w-full h-64 object-cover"
                                            />
                                            <button
                                                onClick={() => updateChapter(activeChapter, 'image', '')}
                                                className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 text-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button onClick={() => setStep(1)} className="btn-secondary">← Story Details</button>
                            <button onClick={() => setStep(3)} className="btn-primary">Review & Publish →</button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="card p-8">
                            <h2 className="text-2xl font-display font-bold mb-6">Review Your Story</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm text-gray-500">Title</span>
                                        <p className="font-semibold text-lg">{story.title || 'Untitled'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Genre</span>
                                        <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getGenreColor(story.genre)}`}>
                                            {story.genre || 'Not set'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Visibility</span>
                                        <p className="capitalize font-medium">{story.visibility}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Chapters</span>
                                        <p className="font-medium">{chapters.length} chapters</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Description</span>
                                        <p className="text-gray-600 dark:text-gray-400">{story.description || 'No description'}</p>
                                    </div>
                                </div>

                                {story.coverImage && (
                                    <div className="rounded-2xl overflow-hidden h-64">
                                        <img src={story.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 space-y-3">
                                <h3 className="font-semibold">Chapters Overview</h3>
                                {chapters.map((ch, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-600">
                                        <span className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
                                            {i + 1}
                                        </span>
                                        <span className="font-medium flex-1">{ch.title}</span>
                                        <span className="text-xs text-gray-500">
                                            {ch.content ? `${ch.content.split(/\s+/).length} words` : 'Empty'}
                                        </span>
                                        {ch.image && <span>🖼️</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button onClick={() => setStep(2)} className="btn-secondary">← Edit Chapters</button>
                            <button onClick={handlePublish} disabled={loading} className="btn-primary text-lg px-8">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Publishing...
                                    </span>
                                ) : (
                                    '🚀 Publish Story'
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
