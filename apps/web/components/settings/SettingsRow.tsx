'use client';

import { useState } from 'react';
import { Input } from '@lucky-gift/ui';
import { Button } from '@lucky-gift/ui';
import { Toggle } from './Toggle';
import type { SettingEntry } from '@lucky-gift/shared';

interface SettingsRowProps {
  setting: SettingEntry;
  onUpdate: (key: string, value: string) => void;
}

const BOOLEAN_KEYS = ['payments_enabled'];
const NUMERIC_KEYS = ['max_recipients', 'gift_price_cents'];
const EMAIL_KEYS = ['email_from_address'];

function getInputType(key: string): 'boolean' | 'number' | 'email' | 'text' {
  if (BOOLEAN_KEYS.includes(key)) return 'boolean';
  if (NUMERIC_KEYS.includes(key)) return 'number';
  if (EMAIL_KEYS.includes(key)) return 'email';
  return 'text';
}

export function SettingsRow({ setting, onUpdate }: SettingsRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(setting.value);
  const inputType = getInputType(setting.key);

  function handleSave() {
    onUpdate(setting.key, draft);
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(setting.value);
    setIsEditing(false);
  }

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <td className="py-3 px-4">
        <code className="text-xs" style={{ color: '#c9a227' }}>{setting.key}</code>
      </td>
      <td className="py-3 px-4 text-sm" style={{ color: '#a0a0b0' }}>
        {setting.description ?? '—'}
      </td>
      <td className="py-3 px-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            {inputType === 'boolean' ? (
              <Toggle
                checked={draft === 'true'}
                onChange={(v) => setDraft(v ? 'true' : 'false')}
              />
            ) : (
              <Input
                type={inputType}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-40"
                aria-label={`Edit ${setting.key}`}
              />
            )}
          </div>
        ) : (
          <span className="text-sm" style={{ color: '#f5f5f0' }}>
            {inputType === 'boolean' ? (
              <span
                style={{
                  background: setting.value === 'true' ? '#065f46' : '#3a1a1a',
                  color: setting.value === 'true' ? '#6ee7b7' : '#fca5a5',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {setting.value === 'true' ? 'Enabled' : 'Disabled'}
              </span>
            ) : (
              setting.value
            )}
          </span>
        )}
      </td>
      <td className="py-3 px-4">
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => { setDraft(setting.value); setIsEditing(true); }}>
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}
