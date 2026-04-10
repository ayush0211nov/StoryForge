'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function ImageGenerator({ onImageGenerated, initialPrompt = '', compact = false }) {
    const { authFetch } = useAuth();
    const [prompt, setPrompt] = useState(initialPrompt);
    const [generating, setGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const generateImage = async () => {
        if (!prompt.trim()) {
            setError('Please enter an image description');
            return;
        }

        setGenerating(true);
        setError('');

        try {
            const res = await authFetch('/api/ai/generate-image', {
                method: 'POST',
                body: JSON.stringify({ prompt: prompt.trim() }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                setError(data.error || 'Failed to generate image. Please try again.');
            } else if (data.image?.url) {
                const newImage = { url: data.image.url, prompt: data.image.revisedPrompt || prompt };
                setGeneratedImages(prev => [newImage, ...prev]);
                setSelectedImage(newImage);
                if (onImageGenerated) onImageGenerated(newImage);
                setError('');
            } else if (data.images && data.images.length > 0) {
                const newImages = data.images;
                setGeneratedImages(prev => [...newImages, ...prev]);
                setSelectedImage(newImages[0]);
                if (onImageGenerated) onImageGenerated(newImages[0]);
                setError('');
            } else {
                setError(data.error || 'Failed to generate image. Please try again.');
            }
        } catch (err) {
            console.error('Image generation error:', err);
            setError(err.message || 'Image generation failed. Check your API key and try again.');
        } finally {
            setGenerating(false);
        }
    };

    if (compact) {
        return (
            <div className="space-y-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the image..."
                        className="input-field text-sm flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && generateImage()}
                    />
                    <button
                        onClick={generateImage}
                        disabled={generating}
                        className="btn-primary !px-4 !py-2 text-sm whitespace-nowrap"
                    >
                        {generating ? '⏳' : '🎨 Generate'}
                    </button>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                {selectedImage && (
                    <div className="rounded-xl overflow-hidden">
                        <img src={selectedImage.url} alt="Generated" className="w-full h-48 object-cover" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xl">🎨</span>
                </div>
                <div>
                    <h3 className="font-display font-bold">AI Image Generator</h3>
                    <p className="text-xs text-gray-500">Create illustrations using DALL-E 3</p>
                </div>
            </div>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the scene you want to illustrate... e.g., 'A dragon flying over a medieval castle at sunset, fantasy art style'"
                className="textarea-field text-sm"
                rows={3}
            />

            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm"
                >
                    {error}
                </motion.p>
            )}

            <button
                onClick={generateImage}
                disabled={generating || !prompt.trim()}
                className="btn-primary w-full"
            >
                {generating ? (
                    <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating artwork...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <span>✨</span>
                        Generate Illustration
                    </span>
                )}
            </button>

            {/* Generated Images Gallery */}
            {generatedImages.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-500">Generated Images</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {generatedImages.map((img, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`relative rounded-xl overflow-hidden cursor-pointer ring-2 transition-all ${
                                    selectedImage?.url === img.url ? 'ring-primary-500' : 'ring-transparent hover:ring-primary-300'
                                }`}
                                onClick={() => {
                                    setSelectedImage(img);
                                    if (onImageGenerated) onImageGenerated(img);
                                }}
                            >
                                <img src={img.url} alt={img.prompt} className="w-full h-32 object-cover" />
                                {selectedImage?.url === img.url && (
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
