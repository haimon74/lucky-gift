import React from 'react';
import { useWizardState } from '../../hooks/useWizardState';
import { useGiftSubmit } from '../../hooks/useGiftSubmit';
import { Step1Screen } from './Step1Screen';
import { Step2Screen } from './Step2Screen';
import { Step3Screen } from './Step3Screen';
import { SuccessScreen } from './SuccessScreen';

export function WizardScreen() {
  const {
    state, setStep, setGame, setOccasion, setMessage,
    setSenderName, setSenderEmail, addRecipient, updateRecipient, removeRecipient, resetWizard,
  } = useWizardState();

  const { submit, isLoading, error, isSuccess } = useGiftSubmit({ onSuccess: () => {} });

  const handleBack = () => { if (state.step > 1) setStep((state.step - 1) as 1 | 2 | 3); };

  if (isSuccess) {
    return <SuccessScreen recipients={state.recipients} onReset={resetWizard} />;
  }

  if (state.step === 1) {
    return (
      <Step1Screen
        gameId={state.gameId}
        occasionKey={state.occasionKey}
        onSelectGame={setGame}
        onSelectOccasion={setOccasion}
        onContinue={() => { if (state.gameId && state.occasionKey) setStep(2); }}
      />
    );
  }

  if (state.step === 2) {
    return (
      <Step2Screen
        occasionKey={state.occasionKey}
        message={state.message}
        onChangeMessage={setMessage}
        onContinue={() => setStep(3)}
        onBack={handleBack}
      />
    );
  }

  return (
    <Step3Screen
      recipients={state.recipients}
      senderName={state.senderName}
      senderEmail={state.senderEmail}
      isSubmitting={isLoading}
      submitError={error}
      onUpdateRecipient={updateRecipient}
      onAddRecipient={addRecipient}
      onRemoveRecipient={removeRecipient}
      onChangeSenderName={setSenderName}
      onChangeSenderEmail={setSenderEmail}
      onSubmit={() => submit(state)}
      onBack={handleBack}
    />
  );
}
