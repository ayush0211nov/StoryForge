'use client';

import { motion } from 'framer-motion';
import StoryCard from './StoryCard';

export default function StoryGrid({ stories, loading = false, emptyMessage = 'No stories found', columns = 3 }) {
    const gridCols = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };

    if (loading) {
        return (
            <div className={`grid grid-cols-1 ${gridCols[columns] || gridCols[3]} gap-6`}>
                {Array.from({ length: columns * 2 }).map((_, i) => (
                    <div key={i} className="card p-0 overflow-hidden animate-pulse">
                        <div className="h-48 bg-gray-200 dark:bg-dark-600" />
                        <div className="p-5 space-y-3">
                            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-full" />
                            <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-2/3" />
                            <div className="flex gap-2 pt-2">
                                <div className="h-6 w-16 bg-gray-200 dark:bg-dark-600 rounded-full" />
                                <div className="h-6 w-12 bg-gray-200 dark:bg-dark-600 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!stories || stories.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-display font-bold mb-2">{emptyMessage}</h3>
                <p className="text-gray-500">Try a different search or filter</p>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 ${gridCols[columns] || gridCols[3]} gap-6`}>
            {stories.map((story, index) => (
                <motion.div
                    key={story._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <StoryCard story={story} />
                </motion.div>
            ))}
        </div>
    );
}
