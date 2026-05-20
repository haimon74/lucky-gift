import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  charCount?: number;
  maxChars?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, charCount, maxChars, className = '', id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const nearLimit = maxChars && charCount !== undefined && charCount > maxChars * 0.9;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: '#a0a0b0' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`input-dark px-3 py-2.5 w-full resize-none ${className}`}
          style={{
            backgroundColor: '#0a0a0f',
            border: `1px solid ${error ? '#ef4444' : '#2a2a3e'}`,
            color: '#f5f5f0',
            borderRadius: '0.5rem',
          }}
          {...rest}
        />
        <div className="flex justify-between items-center">
          {error ? (
            <p className="text-sm" style={{ color: '#ef4444' }} role="alert">{error}</p>
          ) : (
            <span />
          )}
          {maxChars !== undefined && charCount !== undefined && (
            <span
              className="text-xs"
              style={{ color: nearLimit ? '#f59e0b' : '#6b6b80' }}
            >
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
