import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'gold', size = 'md', loading = false, children, disabled, className = '', ...rest }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const variants: Record<string, React.CSSProperties> = {
      gold: {},
      ghost: {},
      danger: {},
    };

    const inlineStyle: React.CSSProperties =
      variant === 'gold'
        ? {
            background: 'linear-gradient(135deg, #c9a227, #f0c040)',
            color: '#1a0a00',
            boxShadow: '0 4px 16px rgba(240,192,64,0.3)',
          }
        : variant === 'ghost'
        ? {
            background: 'transparent',
            color: '#c9a227',
            border: '1px solid rgba(201,162,39,0.4)',
          }
        : {
            background: '#dc2626',
            color: '#fff',
          };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${sizes[size]} ${className}`}
        style={inlineStyle}
        {...rest}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';

function Spinner({ size = 'sm', className = '' }: { size?: 'sm' | 'md'; className?: string }) {
  const s = size === 'sm' ? 16 : 24;
  return (
    <svg
      className={`animate-spin ${className}`}
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
