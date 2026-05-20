'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@lucky-gift/ui';
import { SettingsRow } from '@/components/settings/SettingsRow';
import type { SettingEntry } from '@lucky-gift/shared';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingEntry[]>([]);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function getToken() {
    return sessionStorage.getItem('admin_session_token') ?? '';
  }

  useEffect(() => {
    const token = getToken();
    fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) { router.push('/settings/login'); return null; }
        return r.json();
      })
      .then((data) => { if (data) setSettings(data.settings ?? []); })
      .catch(() => setError('Failed to load settings'));
  }, [router]);

  function handleUpdate(key: string, value: string) {
    setPending((prev) => ({ ...prev, [key]: value }));
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  }

  async function handleSave() {
    if (Object.keys(pending).length === 0) return;
    setIsSaving(true);
    setError(null);
    try {
      const token = getToken();
      const entries = Object.entries(pending).map(([key, value]) => ({ key, value }));
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings: entries }),
      });
      if (res.status === 401) { router.push('/settings/login'); return; }
      if (!res.ok) { setError('Failed to save settings'); return; }
      setPending({});
      setToast('Settings saved!');
      setTimeout(() => setToast(null), 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_session_token');
    document.cookie = 'lucky_gift_admin_session=; Path=/; Max-Age=0';
    router.push('/settings/login');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#f0c040' }}>⚙️ Lucky Gift Settings</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: '#ef4444' }}>{error}</p>}
      {toast && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm font-medium"
          style={{ background: '#065f46', color: '#6ee7b7' }}
          role="status"
        >
          ✓ {toast}
        </div>
      )}

      {/* Settings table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(201,162,39,0.2)', background: '#13132a' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,162,39,0.2)', background: '#0d0d1f' }}>
              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b6b80' }}>Setting</th>
              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b6b80' }}>Description</th>
              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b6b80' }}>Value</th>
              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b6b80' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <SettingsRow key={s.key} setting={s} onUpdate={handleUpdate} />
            ))}
            {settings.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm" style={{ color: '#6b6b80' }}>
                  Loading settings…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          size="lg"
          loading={isSaving}
          onClick={handleSave}
          disabled={Object.keys(pending).length === 0}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
