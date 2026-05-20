'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  const toggleId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <label htmlFor={toggleId} className="flex items-center gap-2 cursor-pointer select-none">
      <div className="relative">
        <input
          id={toggleId}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          role="switch"
          aria-checked={checked}
        />
        <div
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            background: checked ? 'linear-gradient(135deg, #c9a227, #f0c040)' : '#2a2a3e',
            transition: 'background 0.2s',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: checked ? '22px' : '2px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          />
        </div>
      </div>
      {label && <span style={{ color: '#f5f5f0', fontSize: '0.875rem' }}>{label}</span>}
    </label>
  );
}
