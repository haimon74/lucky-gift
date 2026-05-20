'use client';

import { useEffect, useState } from 'react';
import { WizardShell } from '@/components/wizard/WizardShell';
import { WizardStep1 } from '@/components/wizard/WizardStep1';
import { WizardStep2 } from '@/components/wizard/WizardStep2';
import { WizardStep3 } from '@/components/wizard/WizardStep3';
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

export default function HomePage() {
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

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  const { submit, isLoading, error: submitError, isSuccess } = useGiftSubmit({
    onSuccess: () => {
      // state is preserved for SuccessScreen display; resetWizard called via button
    },
  });

  const canContinueStep1 = !!(state.gameId && state.occasionKey);

  const handleContinue = () => {
    if (state.step === 1 && canContinueStep1) setStep(2);
    else if (state.step === 2) setStep(3);
  };

  const handleBack = () => {
    if (state.step > 1) setStep((state.step - 1) as 1 | 2 | 3);
  };

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
      onBack={handleBack}
      onContinue={handleContinue}
      canContinue={state.step === 1 ? canContinueStep1 : true}
      showBack={state.step > 1}
      hideContinue={state.step === 3}
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
          onSubmit={() => submit(state)}
        />
      )}
    </WizardShell>
  );
}
