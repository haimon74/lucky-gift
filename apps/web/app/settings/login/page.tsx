'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@lucky-gift/ui';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }
      sessionStorage.setItem('admin_session_token', data.sessionToken);
      document.cookie = `lucky_gift_admin_session=${data.sessionToken}; Path=/; SameSite=Lax; Max-Age=86400`;
      router.push('/settings');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0f' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 space-y-6"
        style={{ background: '#13132a', border: '1px solid rgba(201,162,39,0.25)' }}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold" style={{ color: '#f0c040' }}>Admin Login</h1>
        </div>

        <div className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="admin"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: '#ef4444' }} role="alert">
            {error}
          </p>
        )}

        <Button size="lg" className="w-full" loading={isLoading} onClick={handleLogin}>
          Login
        </Button>
      </div>
    </div>
  );
}
