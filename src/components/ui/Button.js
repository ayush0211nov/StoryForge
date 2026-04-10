'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const VARIANTS = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    ghost: 'btn-ghost',
    danger: 'inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 transform hover:-translate-y-0.5',
};

const SIZES = {
    sm: '!px-3 !py-1.5 !text-xs',
    md: '',
    lg: '!px-8 !py-4 !text-lg',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    loading = false,
    icon,
    ...props
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            className={cn(
                VARIANTS[variant] || VARIANTS.primary,
                SIZES[size] || '',
                loading && 'opacity-70 cursor-not-allowed',
                className
            )}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Loading...
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    {icon && <span>{icon}</span>}
                    {children}
                </span>
            )}
        </motion.button>
    );
}
