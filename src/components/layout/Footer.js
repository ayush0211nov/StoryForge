import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 dark:border-dark-600 bg-white/50 dark:bg-dark-800/50 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <span className="text-xl font-display font-bold gradient-text">StoryForge</span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
                            Where imagination meets AI. Create beautiful illustrated stories with the power of artificial intelligence. Bring your stories to life.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-900 dark:text-gray-100">Platform</h3>
                        <ul className="space-y-2">
                            <li><Link href="/explore" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Explore Stories</Link></li>
                            <li><Link href="/create" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Create Story</Link></li>
                            <li><Link href="/auth/register" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Get Started</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-900 dark:text-gray-100">Genres</h3>
                        <ul className="space-y-2">
                            <li><Link href="/explore?genre=Fantasy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Fantasy</Link></li>
                            <li><Link href="/explore?genre=Science+Fiction" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Sci-Fi</Link></li>
                            <li><Link href="/explore?genre=Romance" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Romance</Link></li>
                            <li><Link href="/explore?genre=Mystery" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Mystery</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-600 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-400">© 2026 StoryForge. Crafted with AI & Imagination.</p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 dark:text-gray-500">Powered by OpenAI</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
