'use client';

import { useState, useEffect, useCallback } from 'react';

interface SharePopupProps {
  recipientName: string;
  revealUrl: string;
  onClose: () => void;
}

interface Platform {
  id: string;
  label: string;
  icon: string;
  color: string;
  getHref: (url: string, text: string) => string | null;
  hint?: string; // shown below button for platforms that need copy-paste
}

const PLATFORMS: Platform[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    getHref: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`,
  },
  {
    id: 'sms',
    label: 'SMS',
    icon: '📱',
    color: '#0A84FF',
    getHref: (url, text) => `sms:?body=${encodeURIComponent(text + '\n' + url)}`,
  },
  {
    id: 'email',
    label: 'Email',
    icon: '✉️',
    color: '#c9a227',
    getHref: (url, text) =>
      `mailto:?subject=${encodeURIComponent('🍀 You have a Lucky Gift!')}&body=${encodeURIComponent(text + '\n\n' + url)}`,
  },
  {
    id: 'messenger',
    label: 'Messenger',
    icon: '🟣',
    color: '#0099FF',
    getHref: (url) => `fb-messenger://share?link=${encodeURIComponent(url)}`,
    hint: 'Opens Messenger on mobile — paste the link if prompted',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '📸',
    color: '#E1306C',
    getHref: () => null, // no direct API — use copy instead
    hint: 'Copy the link below, then paste it in an Instagram DM',
  },
];

export function SharePopup({ recipientName, revealUrl, onClose }: SharePopupProps) {
  const [copied, setCopied] = useState(false);
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false);

  const shareText = `Hey ${recipientName}! I sent you a Lucky Gift 🍀 Tap to reveal your lucky numbers:`;

  useEffect(() => {
    setNativeShareAvailable(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: '🍀 Lucky Gift',
        text: shareText,
        url: revealUrl,
      });
    } catch {
      // User cancelled or not supported — fall through silently
    }
  }, [shareText, revealUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(revealUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  }, [revealUrl]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-5"
        style={{
          background: '#13132a',
          border: '1px solid rgba(201,162,39,0.35)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg" style={{ color: '#f0c040' }}>
              🍀 Share with {recipientName}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#6b6b80' }}>
              Send as a private message
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-opacity hover:opacity-70"
            style={{ background: '#2a2a3e', color: '#a0a0b0' }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Native Share (mobile-first) */}
        {nativeShareAvailable && (
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3 font-semibold text-sm transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #c9a227 0%, #f0c040 100%)',
              color: '#0a0a0f',
            }}
          >
            <span className="text-lg">📤</span>
            Share via…
          </button>
        )}

        {/* Platform grid */}
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map((p) => {
            const href = p.getHref(revealUrl, shareText);
            const isInstagram = p.id === 'instagram';

            const buttonContent = (
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: `${p.color}22`, border: `1px solid ${p.color}44` }}
                >
                  {p.icon}
                </div>
                <span className="text-xs font-medium" style={{ color: '#a0a0b0' }}>
                  {p.label}
                </span>
                {p.hint && (
                  <span className="text-xs text-center leading-tight" style={{ color: '#6b6b80', fontSize: '0.6rem' }}>
                    {p.hint}
                  </span>
                )}
              </div>
            );

            if (isInstagram) {
              return (
                <button
                  key={p.id}
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors hover:bg-white/5"
                >
                  {buttonContent}
                </button>
              );
            }

            return (
              <a
                key={p.id}
                href={href ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors hover:bg-white/5"
                onClick={href ? undefined : (e) => e.preventDefault()}
              >
                {buttonContent}
              </a>
            );
          })}
        </div>

        {/* Copy Link */}
        <div
          className="flex items-center gap-3 rounded-xl p-3"
          style={{ background: '#0a0a1a', border: '1px solid #2a2a3e' }}
        >
          <span className="text-sm flex-1 truncate font-mono" style={{ color: '#6b6b80', fontSize: '0.72rem' }}>
            {revealUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: copied ? '#065f46' : '#c9a227',
              color: copied ? '#6ee7b7' : '#0a0a0f',
            }}
          >
            {copied ? '✓ Copied!' : '🔗 Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
