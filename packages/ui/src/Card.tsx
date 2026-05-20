import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  goldBorder?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ goldBorder = false, children, className = '', style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl transition-all duration-200 ${className}`}
        style={{
          backgroundColor: '#12121a',
          border: `1px solid ${goldBorder ? '#c9a227' : '#1e1e2e'}`,
          boxShadow: goldBorder ? '0 0 0 1px rgba(201,162,39,0.3), 0 4px 24px rgba(201,162,39,0.1)' : undefined,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';
