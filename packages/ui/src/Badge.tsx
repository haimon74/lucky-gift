import React from 'react';

export interface BadgeProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLButtonElement, BadgeProps>(
  ({ selected = false, children, className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${className}`}
        style={
          selected
            ? {
                backgroundColor: '#c9a227',
                color: '#1a0a00',
                borderColor: '#c9a227',
              }
            : {
                backgroundColor: 'transparent',
                color: '#a0a0b0',
                borderColor: '#2a2a3e',
              }
        }
        {...rest}
      >
        {children}
      </button>
    );
  },
);
Badge.displayName = 'Badge';
