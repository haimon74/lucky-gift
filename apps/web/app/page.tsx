'use client';

import { WizardShell } from '@/components/wizard/WizardShell';
import { WizardStep1 } from '@/components/wizard/WizardStep1';
import { WizardStep2 } from '@/components/wizard/WizardStep2';
import { useWizardState } from '@/hooks/useWizardState';

export default function HomePage() {
  const {
    state,
    setStep,
    setGame,
    setOccasion,
    setMessage,
  } = useWizardState();

  const canContinueStep1 = !!(state.gameId && state.occasionKey);

  const handleContinue = () => {
    if (state.step === 1 && canContinueStep1) setStep(2);
    else if (state.step === 2) setStep(3);
  };

  const handleBack = () => {
    if (state.step > 1) setStep((state.step - 1) as 1 | 2 | 3);
  };

  return (
    <WizardShell
      currentStep={state.step}
      onBack={handleBack}
      onContinue={handleContinue}
      canContinue={state.step === 1 ? canContinueStep1 : true}
      showBack={state.step > 1}
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
        <div className="text-center py-12" style={{ color: '#a0a0b0' }}>
          Step 3: Recipients &amp; Sender — coming in Task 07
        </div>
      )}
    </WizardShell>
  );
}
