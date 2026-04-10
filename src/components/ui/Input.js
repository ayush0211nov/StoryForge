'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(function Input({
    label,
    error,
    icon,
    className = '',
    containerClassName = '',
    type = 'text',
    ...props
}, ref) {
    return (
        <div className={cn('space-y-1.5', containerClassName)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                {type === 'textarea' ? (
                    <textarea
                        ref={ref}
                        className={cn(
                            'textarea-field',
                            icon && 'pl-11',
                            error && 'border-red-400 dark:border-red-600 focus:ring-red-500/50',
                            className
                        )}
                        {...props}
                    />
                ) : (
                    <input
                        ref={ref}
                        type={type}
                        className={cn(
                            'input-field',
                            icon && 'pl-11',
                            error && 'border-red-400 dark:border-red-600 focus:ring-red-500/50',
                            className
                        )}
                        {...props}
                    />
                )}
            </div>
            {error && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
            )}
        </div>
    );
});

export default Input;
