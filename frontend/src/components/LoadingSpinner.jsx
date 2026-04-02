import React from 'react';

function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-10 w-10 border-4',
        lg: 'h-16 w-16 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div
                className={`animate-spin rounded-full border-gray-200 border-t-red-600 ${sizeClasses[size]}`}
            ></div>
            <p className="text-gray-500 font-medium animate-pulse">{message}</p>
        </div>
    );
}

export default LoadingSpinner;
