'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WizardShell } from '@/components/wizard/WizardShell';
import { WizardStep1 } from '@/components/wizard/WizardStep1';
import { WizardStep2 } from '@/components/wizard/WizardStep2';
import { WizardStep3 } from '@/components/wizard/WizardStep3';
import { WizardStep4 } from '@/components/wizard/WizardStep4';
import { SuccessScreen } from '@/components/wizard/SuccessScreen';
import { useWizardState } from '@/hooks/useWizardState';
import { useGiftSubmit } from '@/hooks/useGiftSubmit';

interface AppSettings {
  max_recipients: number;
  payments_enabled: boolean;
}

async function fetchSettings(): Promise<AppSettings> {
  try {
    const res = await fetch('/api/settings/public');
    if (res.ok) return res.json();
  } catch {
    // fall through to defaults
  }
  return { max_recipients: 5, payments_enabled: false };
}

function HomeContent() {
  const {
    state,
    setStep,
    setGame,
    setOccasion,
    setMessage,
    setSenderName,
    setSenderEmail,
    addRecipient,
    updateRecipient,
    removeRecipient,
    resetWizard,
  } = useWizardState();

  const [settings, setSettings] = useState<AppSettings>({ max_recipients: 5, payments_enabled: false });
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null);
  // pendingGiftData is serialized form state to pass to Stripe checkout for post-payment processing
  const [pendingGiftData, setPendingGiftData] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  // Handle ?payment= result from Stripe redirect
  useEffect(() => {
    const payment = searchParams?.get('payment');
    if (payment === 'success') {
      setPaymentStatus('success');
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
    }
    // Clean the URL without causing a full reload
    if (payment && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.toString());
    }
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle ?prefill= from "Send lucky back" link on reveal page
  useEffect(() => {
    const prefill = searchParams?.get('prefill');
    if (!prefill) return;
    try {
      const data = JSON.parse(decodeURIComponent(prefill)) as {
        senderName?: string;
        senderEmail?: string;
        gameId?: string;
      };
      if (data.gameId) setGame(data.gameId);
      if (data.senderName) {
        updateRecipient(state.recipients[0]!.id, { name: data.senderName });
      }
      // Jump to step 3 recipients
      setStep(3);
    } catch {
      // Malformed prefill — ignore
    }
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { submit, isLoading, error: submitError, isSuccess } = useGiftSubmit({
    onSuccess: () => {
      // state is preserved for SuccessScreen display; resetWizard called via button
    },
  });

  const canContinueStep1 = !!(state.gameId && state.occasionKey);
  const totalSteps = settings.payments_enabled ? 4 : 3;

  const handleContinue = () => {
    if (state.step === 1 && canContinueStep1) setStep(2);
    else if (state.step === 2) setStep(3);
    // step 3 continues only when payments enabled — WizardStep3 now calls onProceedToPayment
  };

  const handleBack = () => {
    if (state.step > 1) setStep((state.step - 1) as 1 | 2 | 3 | 4);
  };

  // Called by WizardStep3 when payments are enabled — serializes gift data and advances to step 4
  const handleProceedToPayment = useCallback((serialized: string) => {
    setPendingGiftData(serialized);
    setStep(4);
  }, [setStep]);

  // Stripe payment success — show success screen
  if (paymentStatus === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-2xl font-bold" style={{ color: '#f0c040' }}>
          Payment Successful!
        </h1>
        <p className="text-sm" style={{ color: '#a0a0b0' }}>
          Your lucky gift is on its way to your recipients.
        </p>
        <button
          onClick={resetWizard}
          className="mt-4 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #c9a227 0%, #f0c040 100%)', color: '#0a0a0f' }}
        >
          Send Another Gift 🍀
        </button>
      </div>
    );
  }

  if (paymentStatus === 'cancelled') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="text-6xl">😔</div>
        <h1 className="text-2xl font-bold" style={{ color: '#f5f5f0' }}>
          Payment Cancelled
        </h1>
        <p className="text-sm" style={{ color: '#a0a0b0' }}>
          No worries! Your gift was not sent. You can try again whenever you&apos;re ready.
        </p>
        <button
          onClick={() => {
            setPaymentStatus(null);
            setStep(3);
          }}
          className="mt-4 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #c9a227 0%, #f0c040 100%)', color: '#0a0a0f' }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4">
        <SuccessScreen recipients={state.recipients} onReset={resetWizard} />
      </div>
    );
  }

  return (
    <WizardShell
      currentStep={state.step}
      totalSteps={totalSteps}
      onBack={handleBack}
      onContinue={handleContinue}
      canContinue={state.step === 1 ? canContinueStep1 : true}
      showBack={state.step > 1}
      hideContinue={state.step === 3 || state.step === 4}
    >
      {state.step === 1 && (
        <WizardStep1
          gameId={state.gameId}
          occasionKey={state.occasionKey}
          onSelectGame={setGame}
          onSelectOccasion={setOccasion}
        />
      )}
      {state.step === 2 && (
        <WizardStep2
          occasionKey={state.occasionKey}
          message={state.message}
          senderName={state.senderName}
          onChangeMessage={setMessage}
        />
      )}
      {state.step === 3 && (
        <WizardStep3
          recipients={state.recipients}
          senderName={state.senderName}
          senderEmail={state.senderEmail}
          maxRecipients={settings.max_recipients}
          paymentsEnabled={settings.payments_enabled}
          isSubmitting={isLoading}
          submitError={submitError}
          onUpdateRecipient={updateRecipient}
          onAddRecipient={addRecipient}
          onRemoveRecipient={removeRecipient}
          onChangeSenderName={setSenderName}
          onChangeSenderEmail={setSenderEmail}
          onSubmit={
            settings.payments_enabled
              ? () => handleProceedToPayment(JSON.stringify(state))
              : () => submit(state)
          }
        />
      )}
      {state.step === 4 && settings.payments_enabled && (
        <WizardStep4
          gameId={state.gameId}
          occasionKey={state.occasionKey}
          recipientCount={state.recipients.length}
          senderName={state.senderName}
          senderEmail={state.senderEmail}
          pendingGiftData={pendingGiftData}
        />
      )}
    </WizardShell>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl animate-pulse" style={{ color: '#c9a227' }}>🍀</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
