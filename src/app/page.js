'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import StoryCard from '@/components/story/StoryCard';
import { GENRES, getGenreColor } from '@/lib/utils';

export default function HomePage() {
    const [featuredStories, setFeaturedStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFeatured() {
            try {
                const res = await fetch('/api/stories?sort=popular&limit=6');
                const data = await res.json();
                setFeaturedStories(data.stories || []);
            } catch (error) {
                console.error('Failed to fetch stories:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchFeatured();
    }, []);

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center">
                {/* Animated Background Blobs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="blob absolute top-20 left-10 w-72 h-72 bg-primary-500/30 dark:bg-primary-500/20" style={{ animationDelay: '0s' }} />
                    <div className="blob absolute top-40 right-20 w-96 h-96 bg-accent-500/20 dark:bg-accent-500/10" style={{ animationDelay: '2s' }} />
                    <div className="blob absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/20 dark:bg-purple-500/10" style={{ animationDelay: '4s' }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
                        >
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-sm font-medium">AI-Powered Story Creation</span>
                        </motion.div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold mb-6 leading-tight">
                            Where Stories
                            <br />
                            <span className="gradient-text-alt">Come Alive</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 text-balance">
                            Craft enchanting stories with AI-generated illustrations. Write, illustrate, and share your tales as beautiful interactive digital books.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/create" className="btn-primary text-lg px-8 py-4 group">
                                <span>Start Writing</span>
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link href="/explore" className="btn-secondary text-lg px-8 py-4">
                                Explore Stories
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16"
                    >
                        {[
                            { label: 'Stories Created', value: '10K+' },
                            { label: 'AI Images', value: '50K+' },
                            { label: 'Authors', value: '5K+' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-2xl sm:text-3xl font-display font-bold gradient-text">{stat.value}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="section-title mb-4">
                            Everything You Need to
                            <span className="gradient-text"> Tell Your Story</span>
                        </h2>
                        <p className="section-subtitle mx-auto">
                            Powerful tools to write, illustrate, and share stories like never before.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '✍️',
                                title: 'Intuitive Writing',
                                description: 'A distraction-free editor with AI-powered suggestions to help you craft the perfect narrative.',
                                gradient: 'from-blue-500 to-cyan-500',
                            },
                            {
                                icon: '🎨',
                                title: 'AI Illustrations',
                                description: 'Automatically generate stunning illustrations for each chapter using DALL-E 3.',
                                gradient: 'from-purple-500 to-pink-500',
                            },
                            {
                                icon: '📖',
                                title: 'Interactive Book',
                                description: 'Read stories as beautiful digital books with realistic page-flip animations.',
                                gradient: 'from-amber-500 to-orange-500',
                            },
                            {
                                icon: '🤖',
                                title: 'AI Story Assistant',
                                description: 'Get creative suggestions, grammar fixes, and writing improvements powered by GPT.',
                                gradient: 'from-green-500 to-emerald-500',
                            },
                            {
                                icon: '📥',
                                title: 'Download as Book',
                                description: 'Export your stories as beautifully formatted PDFs ready for printing or sharing.',
                                gradient: 'from-red-500 to-rose-500',
                            },
                            {
                                icon: '🌍',
                                title: 'Share & Discover',
                                description: 'Publish stories, follow authors, and explore stories from a vibrant community.',
                                gradient: 'from-indigo-500 to-violet-500',
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card-hover group cursor-default"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-display font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Genres Section */}
            <section className="py-24 bg-gray-50/50 dark:bg-dark-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="section-title mb-4">
                            Explore by <span className="gradient-text">Genre</span>
                        </h2>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {GENRES.map((genre, index) => (
                            <motion.div
                                key={genre}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/explore?genre=${encodeURIComponent(genre)}`}
                                    className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getGenreColor(genre)} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
                                >
                                    {genre}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Stories */}
            {featuredStories.length > 0 && (
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center justify-between mb-12"
                        >
                            <div>
                                <h2 className="section-title mb-2">Featured Stories</h2>
                                <p className="section-subtitle">Discover the most popular tales from our community</p>
                            </div>
                            <Link href="/explore" className="btn-secondary hidden sm:inline-flex">
                                View All
                            </Link>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredStories.map((story) => (
                                <StoryCard key={story._id} story={story} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-90" />
                <div className="blob absolute top-10 right-10 w-64 h-64 bg-white/10" />
                <div className="blob absolute bottom-10 left-10 w-48 h-48 bg-white/10" style={{ animationDelay: '3s' }} />

                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                            Ready to Write Your Story?
                        </h2>
                        <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                            Join thousands of authors creating illustrated stories with AI. Your next masterpiece is one click away.
                        </p>
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center px-8 py-4 rounded-xl text-lg font-bold text-primary-600 bg-white hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                            Create Free Account
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
