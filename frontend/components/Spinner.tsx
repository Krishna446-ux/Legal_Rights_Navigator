'use client'
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    className?: string;
}

export default function Spinner({
    size = 'md',
    color = 'text-blue-600',
    className = ''
}: SpinnerProps) {

    // Map size keys to Tailwind dimensions
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`
          animate-spin 
          rounded-full 
          border-t-transparent 
          border-current 
          ${sizeClasses[size]} 
          ${color}
        `}
                role="status"
                aria-label="loading"
            >
                {/* Screen reader fallback for web accessibility */}
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
}