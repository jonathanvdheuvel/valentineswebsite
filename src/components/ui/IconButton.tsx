'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger' | 'success';
  size?: 'sm' | 'md';
  tooltip?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = '', variant = 'default', size = 'sm', tooltip, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center transition-all duration-200 focus-ring rounded-lg disabled:opacity-30 disabled:cursor-not-allowed';
    
    const variantClasses = {
      default: 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/15 hover:text-white hover:border-white/30',
      danger: 'bg-white/10 text-white/80 border border-white/20 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30',
      success: 'bg-white/10 text-white/80 border border-white/20 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30',
    };
    
    const sizeClasses = {
      sm: 'w-7 h-7 text-sm',
      md: 'w-9 h-9 text-base',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled}
        title={tooltip}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
