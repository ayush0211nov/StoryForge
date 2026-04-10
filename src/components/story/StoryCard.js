'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { truncateText, formatRelativeDate, getGenreColor } from '@/lib/utils';

export default function StoryCard({ story }) {
    const genreGradient = getGenreColor(story.genre);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="story-card group"
        >
            <Link href={`/story/${story._id}`} className="block">
                <div className="card overflow-hidden h-full flex flex-col">
                    {/* Cover Image */}
                    <div className="relative h-48 overflow-hidden">
                        {story.coverImage ? (
                            <img
                                src={story.coverImage}
                                alt={story.title}
                                className="story-card-image w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${genreGradient} flex items-center justify-center`}>
                                <svg className="w-16 h-16 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        )}
                        {/* Genre Badge */}
                        <div className="absolute top-3 left-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${genreGradient} shadow-lg`}>
                                {story.genre}
                            </span>
                        </div>
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-display font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                            {story.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                            {truncateText(story.description || 'A story waiting to be discovered...', 120)}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-600">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                                    {story.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {story.author?.name || 'Anonymous'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {story.likesCount || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {story.readingTime || 1}m
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
