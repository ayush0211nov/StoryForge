export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatRelativeDate(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
}

export function estimateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
}

export function truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

export function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export const GENRES = [
    'Fantasy',
    'Science Fiction',
    'Romance',
    'Mystery',
    'Horror',
    'Adventure',
    'Historical',
    'Comedy',
    'Drama',
    'Thriller',
    'Children',
    'Poetry',
    'Non-Fiction',
    'Fairy Tale',
];

export const GENRE_COLORS = {
    'Fantasy': 'from-purple-500 to-indigo-600',
    'Science Fiction': 'from-cyan-500 to-blue-600',
    'Romance': 'from-pink-500 to-rose-600',
    'Mystery': 'from-gray-600 to-gray-800',
    'Horror': 'from-red-700 to-gray-900',
    'Adventure': 'from-amber-500 to-orange-600',
    'Historical': 'from-yellow-600 to-amber-700',
    'Comedy': 'from-yellow-400 to-orange-500',
    'Drama': 'from-blue-600 to-indigo-700',
    'Thriller': 'from-red-600 to-red-800',
    'Children': 'from-green-400 to-emerald-500',
    'Poetry': 'from-violet-500 to-purple-600',
    'Non-Fiction': 'from-teal-500 to-cyan-600',
    'Fairy Tale': 'from-pink-400 to-purple-500',
};

export function getGenreColor(genre) {
    return GENRE_COLORS[genre] || 'from-primary-500 to-primary-700';
}

export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
