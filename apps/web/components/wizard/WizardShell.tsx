'use client';

import React from 'react';
import { Button } from '@lucky-gift/ui';

interface WizardShellProps {
  currentStep: 1 | 2 | 3 | 4;
  totalSteps?: number;
  onBack?: () => void;
  onContinue: () => void;
  canContinue: boolean;
  continueLabel?: string;
  showBack?: boolean;
  children: React.ReactNode;
}

const STEP_LABELS = ['Choose Game & Occasion', 'Your Message', 'Recipients & Sender', 'Payment'];

export function WizardShell({
  currentStep,
  totalSteps = 3,
  onBack,
  onContinue,
  canContinue,
  continueLabel = 'Continue →',
  showBack = false,
  children,
}: WizardShellProps) {
  const steps = STEP_LABELS.slice(0, totalSteps);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {steps.map((label, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3 | 4;
            const isActive = stepNum === currentStep;
            const isDone = stepNum < currentStep;
            return (
              <React.Fragment key={stepNum}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      backgroundColor: isActive ? '#c9a227' : isDone ? '#065f46' : '#1e1e2e',
                      color: isActive || isDone ? '#fff' : '#6b6b80',
                    }}
                  >
                    {isDone ? '✓' : stepNum}
                  </div>
                  <span
                    className="text-xs font-medium hidden sm:block"
                    style={{ color: isActive ? '#f0c040' : '#6b6b80' }}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="flex-1 h-px mx-1"
                    style={{ backgroundColor: isDone ? '#065f46' : '#1e1e2e' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">{children}</div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        {showBack && onBack ? (
          <Button variant="ghost" onClick={onBack} size="md">
            ← Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          variant="gold"
          onClick={onContinue}
          disabled={!canContinue}
          size="lg"
        >
          {continueLabel}
        </Button>
      </div>
    </div>
  );
}
