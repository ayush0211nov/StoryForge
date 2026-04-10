'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function ChapterEditor({
    chapter,
    index,
    isActive,
    onUpdate,
    onRemove,
    onSelect,
    canRemove = true,
}) {
    const { authFetch } = useAuth();
    const [generatingImage, setGeneratingImage] = useState(false);
    const [aiWorking, setAiWorking] = useState(false);
    const [aiError, setAiError] = useState('');
    const textareaRef = useRef(null);

    const generateImage = async () => {
        if (!chapter.content?.trim()) return;
        setGeneratingImage(true);
        try {
            const res = await authFetch('/api/ai/generate-image', {
                method: 'POST',
                body: JSON.stringify({ text: chapter.content }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                console.error('Image generation error:', data.error);
                alert(`Image generation failed: ${data.error || 'Please try again'}`);
                return;
            }
            
            if (data.image?.url) {
                onUpdate(index, 'image', data.image.url);
                if (data.prompt) onUpdate(index, 'imagePrompt', data.prompt);
            } else if (data.images?.length > 0) {
                onUpdate(index, 'image', data.images[0].url);
                if (data.prompt) onUpdate(index, 'imagePrompt', data.prompt);
            } else {
                console.error('Invalid response format:', data);
                alert('Image generation failed: Invalid response. Please try again.');
            }
        } catch (err) {
            console.error('Image generation failed:', err);
            alert(`Image generation error: ${err.message || 'Please check your internet and try again'}`);
        } finally {
            setGeneratingImage(false);
        }
    };

    const aiAssist = async (mode) => {
        if (!chapter.content?.trim()) return;
        setAiWorking(true);
        setAiError('');
        try {
            const res = await authFetch('/api/ai/story-assist', {
                method: 'POST',
                body: JSON.stringify({ text: chapter.content, mode }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                setAiError(data.error || 'Failed to process request');
                console.error('AI assist error:', data.error);
                return;
            }
            
            if (data.result) {
                if (mode === 'suggest') {
                    onUpdate(index, 'content', chapter.content + '\n\n' + data.result);
                } else {
                    onUpdate(index, 'content', data.result);
                }
                setAiError('');
            } else {
                setAiError('No result received from AI');
            }
        } catch (err) {
            console.error('AI assist failed:', err);
            setAiError(err.message || 'Connection error. Please try again.');
        } finally {
            setAiWorking(false);
        }
    };

    if (!isActive) {
        return (
            <button
                onClick={() => onSelect(index)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group hover:bg-gray-100 dark:hover:bg-dark-600`}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-dark-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                    </span>
                    <span className="truncate text-sm font-medium">{chapter.title || `Chapter ${index + 1}`}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {chapter.image && <span className="text-xs">🖼️</span>}
                    {chapter.content && (
                        <span className="text-xs text-gray-400">
                            {chapter.content.split(/\s+/).length}w
                        </span>
                    )}
                </div>
            </button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
        >
            <div className="card p-6">
                {/* Chapter Title */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                        <span className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                        </span>
                        <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) => onUpdate(index, 'title', e.target.value)}
                            className="text-xl font-display font-bold bg-transparent border-none outline-none w-full placeholder-gray-400"
                            placeholder="Chapter Title"
                        />
                    </div>
                    {canRemove && (
                        <button
                            onClick={() => onRemove(index)}
                            className="text-red-400 hover:text-red-500 text-sm px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            Delete
                        </button>
                    )}
                </div>

                {/* Content Editor */}
                <textarea
                    ref={textareaRef}
                    value={chapter.content}
                    onChange={(e) => onUpdate(index, 'content', e.target.value)}
                    className="w-full min-h-[350px] bg-transparent border-none outline-none resize-none font-serif text-base leading-relaxed placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Start writing your chapter... Let your imagination flow freely."
                />

                {/* AI Working Indicator */}
                {aiWorking && (
                    <div className="flex items-center gap-2 text-primary-500 text-sm mt-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/10">
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        AI is working on your text...
                    </div>
                )}

                {/* AI Error Display */}
                {aiError && (
                    <div className="flex items-start gap-2 text-red-500 text-sm mt-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                        <span className="text-lg mt-0.5">⚠️</span>
                        <div>
                            <div className="font-semibold">AI Tool Error</div>
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{aiError}</div>
                        </div>
                    </div>
                )}

                {/* Word Count & Stats */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-dark-600">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{chapter.content ? chapter.content.split(/\s+/).filter(Boolean).length : 0} words</span>
                        <span>{chapter.content ? chapter.content.length : 0} characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => aiAssist('suggest')}
                            disabled={aiWorking || !chapter.content?.trim()}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors disabled:opacity-40"
                            title="AI will suggest what happens next"
                        >
                            ✨ Continue
                        </button>
                        <button
                            onClick={() => aiAssist('improve')}
                            disabled={aiWorking || !chapter.content?.trim()}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors disabled:opacity-40"
                            title="Improve your writing"
                        >
                            📝 Improve
                        </button>
                        <button
                            onClick={() => aiAssist('grammar')}
                            disabled={aiWorking || !chapter.content?.trim()}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors disabled:opacity-40"
                            title="Fix grammar errors"
                        >
                            🔤 Grammar
                        </button>
                    </div>
                </div>
            </div>

            {/* Chapter Image */}
            <div className="card p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    🎨 Chapter Illustration
                </h4>
                {chapter.image ? (
                    <div className="relative rounded-xl overflow-hidden">
                        <img
                            src={chapter.image}
                            alt="Chapter illustration"
                            className="w-full h-56 object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 flex justify-between items-end">
                            <button
                                onClick={generateImage}
                                disabled={generatingImage}
                                className="text-xs px-3 py-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                            >
                                🔄 Regenerate
                            </button>
                            <button
                                onClick={() => onUpdate(index, 'image', '')}
                                className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-white hover:bg-red-500/30 backdrop-blur-sm transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={generateImage}
                        disabled={generatingImage || !chapter.content?.trim()}
                        className="w-full py-10 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-500 flex flex-col items-center justify-center gap-2 hover:border-primary-500 transition-colors disabled:opacity-40"
                    >
                        {generatingImage ? (
                            <>
                                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-gray-500">Generating AI illustration...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-2xl">🎨</span>
                                <span className="text-sm text-gray-500">Generate AI illustration from chapter text</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </motion.div>
    );
}
