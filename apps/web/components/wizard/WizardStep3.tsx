'use client';

import { useState } from 'react';
import { Input, Button } from '@lucky-gift/ui';
import type { Recipient } from '@lucky-gift/shared';

interface WizardStep3Props {
  recipients: Recipient[];
  senderName: string;
  senderEmail: string;
  maxRecipients?: number;
  paymentsEnabled?: boolean;
  isSubmitting?: boolean;
  submitError?: string | null;
  onUpdateRecipient: (id: string, changes: Partial<Omit<Recipient, 'id'>>) => void;
  onAddRecipient: () => void;
  onRemoveRecipient: (id: string) => void;
  onChangeSenderName: (value: string) => void;
  onChangeSenderEmail: (value: string) => void;
  onSubmit: () => void;
}

type RecipientErrors = Record<string, { name?: string; email?: string }>;
interface SenderErrors { senderName?: string; senderEmail?: string }

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function WizardStep3({
  recipients,
  senderName,
  senderEmail,
  maxRecipients = 5,
  paymentsEnabled = false,
  isSubmitting = false,
  submitError = null,
  onUpdateRecipient,
  onAddRecipient,
  onRemoveRecipient,
  onChangeSenderName,
  onChangeSenderEmail,
  onSubmit,
}: WizardStep3Props) {
  const [recipientErrors, setRecipientErrors] = useState<RecipientErrors>({});
  const [senderErrors, setSenderErrors] = useState<SenderErrors>({});

  function validate(): boolean {
    const newRecipErrors: RecipientErrors = {};
    const newSenderErrors: SenderErrors = {};

    const emailSet = new Set<string>();

    recipients.forEach((r) => {
      const recipErrors: { name?: string; email?: string } = {};
      if (!r.name.trim()) recipErrors.name = 'Name is required';
      if (!r.email.trim()) {
        recipErrors.email = 'Email is required';
      } else if (!validateEmail(r.email)) {
        recipErrors.email = 'Enter a valid email address';
      } else if (emailSet.has(r.email.toLowerCase().trim())) {
        recipErrors.email = 'Duplicate email address';
      }
      emailSet.add(r.email.toLowerCase().trim());
      if (Object.keys(recipErrors).length) newRecipErrors[r.id] = recipErrors;
    });

    if (!senderName.trim()) newSenderErrors.senderName = 'Your name is required';
    if (!senderEmail.trim()) {
      newSenderErrors.senderEmail = 'Your email is required';
    } else if (!validateEmail(senderEmail)) {
      newSenderErrors.senderEmail = 'Enter a valid email address';
    }

    setRecipientErrors(newRecipErrors);
    setSenderErrors(newSenderErrors);
    return Object.keys(newRecipErrors).length === 0 && Object.keys(newSenderErrors).length === 0;
  }

  function handleSubmit() {
    if (validate()) onSubmit();
  }

  const atMax = recipients.length >= maxRecipients;

  return (
    <div className="space-y-8">
      {/* Recipients */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold" style={{ color: '#f5f5f0' }}>
          🎁 Who Gets Lucky?
        </h2>

        {recipients.map((r, idx) => (
          <div
            key={r.id}
            className="relative rounded-2xl p-5 space-y-4"
            style={{ background: '#13132a', border: '1px solid rgba(201,162,39,0.25)' }}
          >
            {recipients.length > 1 && (
              <button
                aria-label={`Remove recipient ${idx + 1}`}
                onClick={() => onRemoveRecipient(r.id)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors hover:opacity-80"
                style={{ background: '#2a2a3e', color: '#a0a0b0' }}
              >
                ×
              </button>
            )}

            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b6b80' }}>
              Recipient {idx + 1}
            </div>

            <Input
              label="Name"
              value={r.name}
              onChange={(e) => {
                onUpdateRecipient(r.id, { name: e.target.value });
                if (recipientErrors[r.id]?.name) setRecipientErrors((prev) => ({ ...prev, [r.id]: { ...prev[r.id], name: undefined } }));
              }}
              error={recipientErrors[r.id]?.name}
              placeholder="Recipient's name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={r.email}
              onChange={(e) => {
                onUpdateRecipient(r.id, { email: e.target.value });
                if (recipientErrors[r.id]?.email) setRecipientErrors((prev) => ({ ...prev, [r.id]: { ...prev[r.id], email: undefined } }));
              }}
              error={recipientErrors[r.id]?.email}
              placeholder="recipient@example.com"
              required
            />
            <Input
              label="Phone (optional)"
              type="tel"
              value={r.phone ?? ''}
              onChange={(e) => onUpdateRecipient(r.id, { phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        ))}

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddRecipient}
            disabled={atMax}
            title={atMax ? `Max ${maxRecipients} recipients reached` : undefined}
          >
            + Add Another Recipient
          </Button>
          {atMax && (
            <p className="text-xs mt-1" style={{ color: '#6b6b80' }}>
              Max {maxRecipients} recipients reached
            </p>
          )}
        </div>
      </div>

      {/* Sender */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold" style={{ color: '#f5f5f0' }}>
          ✉️ From
        </h2>

        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: '#13132a', border: '1px solid rgba(201,162,39,0.25)' }}
        >
          <Input
            label="Your Name"
            value={senderName}
            onChange={(e) => {
              onChangeSenderName(e.target.value);
              if (senderErrors.senderName) setSenderErrors((prev) => ({ ...prev, senderName: undefined }));
            }}
            error={senderErrors.senderName}
            placeholder="Your name"
            required
          />
          <Input
            label="Your Email"
            type="email"
            value={senderEmail}
            onChange={(e) => {
              onChangeSenderEmail(e.target.value);
              if (senderErrors.senderEmail) setSenderErrors((prev) => ({ ...prev, senderEmail: undefined }));
            }}
            error={senderErrors.senderEmail}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      {/* Submit */}
      <div className="space-y-3">
        <Button
          size="lg"
          loading={isSubmitting}
          onClick={handleSubmit}
          className="w-full"
        >
          {paymentsEnabled ? '💳 Pay $10 & Send' : '🍀 Send Lucky Numbers — Free!'}
        </Button>

        {submitError && (
          <p className="text-sm text-center" style={{ color: '#ef4444' }} role="alert">
            {submitError}
          </p>
        )}
      </div>
    </div>
  );
}
