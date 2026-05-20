'use client';

import { WizardShell } from '@/components/wizard/WizardShell';
import { WizardStep1 } from '@/components/wizard/WizardStep1';
import { useWizardState } from '@/hooks/useWizardState';

export default function HomePage() {
  const {
    state,
    setStep,
    setGame,
    setOccasion,
  } = useWizardState();

  const canContinueStep1 = !!(state.gameId && state.occasionKey);

  return (
    <WizardShell
      currentStep={state.step}
      onBack={state.step > 1 ? () => setStep((state.step - 1) as 1 | 2 | 3) : undefined}
      onContinue={() => {
        if (state.step === 1 && canContinueStep1) setStep(2);
      }}
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
        <div className="text-center py-12" style={{ color: '#a0a0b0' }}>
          Step 2: Message — coming in Task 06
        </div>
      )}
      {state.step === 3 && (
        <div className="text-center py-12" style={{ color: '#a0a0b0' }}>
          Step 3: Recipients — coming in Task 07
        </div>
      )}
    </WizardShell>
  );
}
