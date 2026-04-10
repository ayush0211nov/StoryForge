'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import StoryCard from '@/components/story/StoryCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { GENRES } from '@/lib/utils';

function ExploreContent() {
    const searchParams = useSearchParams();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
    const [sort, setSort] = useState('latest');
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchStories();
    }, [genre, sort, pagination.page]);

    const fetchStories = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sort,
                page: pagination.page.toString(),
                limit: '12',
            });
            if (genre !== 'All') params.set('genre', genre);
            if (search) params.set('search', search);

            const res = await fetch(`/api/stories?${params}`);
            const data = await res.json();
            setStories(data.stories || []);
            setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error('Failed to fetch stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, page: 1 });
        fetchStories();
    };

    return (
        <div className="page-container">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="section-title mb-2">
                    Explore <span className="gradient-text">Stories</span>
                </h1>
                <p className="section-subtitle">Discover amazing tales from our creative community</p>
            </motion.div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative max-w-xl">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-12 pr-4"
                        placeholder="Search stories..."
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </form>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Genre Filter */}
                <div className="flex flex-wrap gap-2 flex-1">
                    <button
                        onClick={() => { setGenre('All'); setPagination({ ...pagination, page: 1 }); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${genre === 'All' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500'
                            }`}
                    >
                        All
                    </button>
                    {GENRES.map((g) => (
                        <button
                            key={g}
                            onClick={() => { setGenre(g); setPagination({ ...pagination, page: 1 }); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${genre === g ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500'
                                }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPagination({ ...pagination, page: 1 }); }}
                    className="input-field !w-auto"
                >
                    <option value="latest">Latest</option>
                    <option value="popular">Most Liked</option>
                    <option value="views">Most Viewed</option>
                    <option value="oldest">Oldest</option>
                </select>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" text="Loading stories..." />
                </div>
            ) : stories.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-display font-bold mb-2">No stories found</h3>
                    <p className="text-gray-500">Try a different genre or search term</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stories.map((story) => (
                            <StoryCard key={story._id} story={story} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-12">
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setPagination({ ...pagination, page })}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${pagination.page === page
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={
            <div className="page-container flex justify-center py-20">
                <LoadingSpinner size="lg" text="Loading explore page..." />
            </div>
        }>
            <ExploreContent />
        </Suspense>
    );
}
