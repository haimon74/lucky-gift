import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardStep3 } from '@/components/wizard/WizardStep3';
import type { Recipient } from '@lucky-gift/shared';

function makeRecipient(overrides: Partial<Recipient> = {}): Recipient {
  return { id: crypto.randomUUID(), name: '', email: '', phone: '', ...overrides };
}

const BASE_PROPS = {
  senderName: '',
  senderEmail: '',
  maxRecipients: 5,
  paymentsEnabled: false,
  isEmailLoading: false,
  sharingEmail: null,
  submitError: null,
  onUpdateRecipient: vi.fn(),
  onAddRecipient: vi.fn(),
  onRemoveRecipient: vi.fn(),
  onChangeSenderName: vi.fn(),
  onChangeSenderEmail: vi.fn(),
  onSendByEmail: vi.fn(),
  onShareRecipient: vi.fn(),
};

describe('WizardStep3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders From section first, then recipients', () => {
    render(<WizardStep3 {...BASE_PROPS} recipients={[makeRecipient()]} />);
    const fromHeading = screen.getByText('✉️ From');
    const toHeading = screen.getByText('🎁 Who Gets Lucky?');
    // From should appear before To in the DOM
    expect(fromHeading.compareDocumentPosition(toHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders 1 recipient card by default', () => {
    render(<WizardStep3 {...BASE_PROPS} recipients={[makeRecipient()]} />);
    expect(screen.getByText('Recipient 1')).toBeDefined();
  });

  it('renders a Share button per recipient', () => {
    render(<WizardStep3 {...BASE_PROPS} recipients={[makeRecipient()]} />);
    expect(screen.getByText('🔗 Share Lucky Gift')).toBeDefined();
  });

  it('calls onAddRecipient when + Add button is clicked', async () => {
    const onAddRecipient = vi.fn();
    render(<WizardStep3 {...BASE_PROPS} recipients={[makeRecipient()]} onAddRecipient={onAddRecipient} />);
    await userEvent.click(screen.getByText('+ Add Another Recipient'));
    expect(onAddRecipient).toHaveBeenCalledOnce();
  });

  it('disables + Add button at max_recipients', () => {
    const recipients = Array.from({ length: 5 }, () => makeRecipient());
    render(<WizardStep3 {...BASE_PROPS} recipients={recipients} maxRecipients={5} />);
    const btn = screen.getByText('+ Add Another Recipient') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('calls onRemoveRecipient when × button is clicked', async () => {
    const onRemoveRecipient = vi.fn();
    const r1 = makeRecipient({ id: 'id-1' });
    const r2 = makeRecipient({ id: 'id-2' });
    render(<WizardStep3 {...BASE_PROPS} recipients={[r1, r2]} onRemoveRecipient={onRemoveRecipient} />);
    await userEvent.click(screen.getByLabelText('Remove recipient 1'));
    expect(onRemoveRecipient).toHaveBeenCalledWith('id-1');
  });

  it('hides remove button when only 1 recipient', () => {
    render(<WizardStep3 {...BASE_PROPS} recipients={[makeRecipient({ id: 'id-1' })]} />);
    expect(screen.queryByLabelText('Remove recipient 1')).toBeNull();
  });

  it('shows validation errors on send-by-email click with empty required fields', async () => {
    render(<WizardStep3 {...BASE_PROPS} recipients={[makeRecipient()]} />);
    await userEvent.click(screen.getByText('📧 Send Lucky by Email'));
    expect(screen.getAllByText('Name is required').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Email is required').length).toBeGreaterThan(0);
    expect(screen.getByText('Your name is required')).toBeDefined();
    expect(screen.getByText('Your email is required')).toBeDefined();
  });

  it('shows validation errors on share click with empty required fields', async () => {
    render(<WizardStep3 {...BASE_PROPS} recipients={[makeRecipient()]} />);
    await userEvent.click(screen.getByText('🔗 Share Lucky Gift'));
    expect(screen.getAllByText('Name is required').length).toBeGreaterThan(0);
  });

  it('calls onSendByEmail when form is valid', async () => {
    const onSendByEmail = vi.fn();
    const r = makeRecipient({ name: 'Bob', email: 'bob@example.com' });
    render(
      <WizardStep3
        {...BASE_PROPS}
        recipients={[r]}
        senderName="Alice"
        senderEmail="alice@example.com"
        onSendByEmail={onSendByEmail}
      />,
    );
    await userEvent.click(screen.getByText('📧 Send Lucky by Email'));
    expect(onSendByEmail).toHaveBeenCalledOnce();
  });

  it('calls onShareRecipient when form is valid', async () => {
    const onShareRecipient = vi.fn();
    const r = makeRecipient({ name: 'Bob', email: 'bob@example.com' });
    render(
      <WizardStep3
        {...BASE_PROPS}
        recipients={[r]}
        senderName="Alice"
        senderEmail="alice@example.com"
        onShareRecipient={onShareRecipient}
      />,
    );
    await userEvent.click(screen.getByText('🔗 Share Lucky Gift'));
    expect(onShareRecipient).toHaveBeenCalledWith(r);
  });

  it('shows duplicate email error', async () => {
    const email = 'same@test.com';
    const r1 = makeRecipient({ name: 'A', email });
    const r2 = makeRecipient({ name: 'B', email });
    render(<WizardStep3 {...BASE_PROPS} recipients={[r1, r2]} />);
    await userEvent.click(screen.getByText('📧 Send Lucky by Email'));
    expect(screen.getByText('Duplicate email address')).toBeDefined();
  });

  it('disables send button while email is loading', () => {
    render(<WizardStep3 {...BASE_PROPS} recipients={[makeRecipient()]} isEmailLoading={true} />);
    const btn = screen.getByText('📧 Send Lucky by Email').closest('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('shows submitError when provided', () => {
    render(
      <WizardStep3
        {...BASE_PROPS}
        recipients={[makeRecipient()]}
        submitError="Something went wrong"
      />,
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
  });

  it('shows Pay button when paymentsEnabled', () => {
    render(<WizardStep3 {...BASE_PROPS} recipients={[makeRecipient()]} paymentsEnabled={true} />);
    expect(screen.getByText('💳 Pay $10 & Send')).toBeDefined();
  });

  it('shows title text above the send button', () => {
    render(<WizardStep3 {...BASE_PROPS} recipients={[makeRecipient()]} />);
    expect(screen.getByText(/share or send lucky numbers/i)).toBeDefined();
  });
});
