'use client';

export default function LoadingSpinner({ size = 'md', text = '' }) {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizeClasses[size]} relative`}>
                <div className="absolute inset-0 rounded-full border-2 border-primary-200 dark:border-primary-900" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
            </div>
            {text && <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>}
        </div>
    );
}
