import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: '#a0a0b0' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input-dark px-3 py-2.5 w-full ${error ? 'border-red-500' : ''} ${className}`}
          style={{
            backgroundColor: '#0a0a0f',
            border: `1px solid ${error ? '#ef4444' : '#2a2a3e'}`,
            color: '#f5f5f0',
            borderRadius: '0.5rem',
          }}
          {...rest}
        />
        {error && (
          <p className="text-sm" style={{ color: '#ef4444' }} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
