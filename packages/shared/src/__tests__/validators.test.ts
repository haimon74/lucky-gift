import { describe, it, expect } from 'vitest';
import { giftPayloadSchema, recipientSchema } from '../validators.js';

describe('recipientSchema', () => {
  it('passes with valid data', () => {
    const result = recipientSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('fails with missing name', () => {
    const result = recipientSchema.safeParse({ email: 'a@b.com' });
    expect(result.success).toBe(false);
  });

  it('fails with invalid email', () => {
    const result = recipientSchema.safeParse({ name: 'Bob', email: 'notanemail' });
    expect(result.success).toBe(false);
  });

  it('allows optional phone', () => {
    const result = recipientSchema.safeParse({
      name: 'Alice',
      email: 'alice@example.com',
      phone: '+15551234567',
    });
    expect(result.success).toBe(true);
  });
});

describe('giftPayloadSchema', () => {
  const validPayload = {
    gameId: 'PWR',
    occasionKey: 'birthday',
    message: 'Good luck!',
    senderName: 'Jane',
    senderEmail: 'jane@example.com',
    recipients: [{ name: 'John', email: 'john@example.com' }],
  };

  it('passes with valid payload', () => {
    const result = giftPayloadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('fails with invalid gameId', () => {
    const result = giftPayloadSchema.safeParse({ ...validPayload, gameId: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('fails with invalid occasionKey', () => {
    const result = giftPayloadSchema.safeParse({ ...validPayload, occasionKey: 'bad_key' });
    expect(result.success).toBe(false);
  });

  it('fails with missing senderName', () => {
    const { senderName: _, ...rest } = validPayload;
    const result = giftPayloadSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('fails with invalid senderEmail', () => {
    const result = giftPayloadSchema.safeParse({ ...validPayload, senderEmail: 'bad' });
    expect(result.success).toBe(false);
  });

  it('fails with 0 recipients', () => {
    const result = giftPayloadSchema.safeParse({ ...validPayload, recipients: [] });
    expect(result.success).toBe(false);
  });

  it('fails with more than 5 recipients', () => {
    const result = giftPayloadSchema.safeParse({
      ...validPayload,
      recipients: Array.from({ length: 6 }, (_, i) => ({
        name: `Person ${i}`,
        email: `person${i}@example.com`,
      })),
    });
    expect(result.success).toBe(false);
  });

  it('fails with duplicate recipient emails', () => {
    const result = giftPayloadSchema.safeParse({
      ...validPayload,
      recipients: [
        { name: 'Alice', email: 'same@example.com' },
        { name: 'Bob', email: 'same@example.com' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('allows message to be empty string', () => {
    const result = giftPayloadSchema.safeParse({ ...validPayload, message: '' });
    expect(result.success).toBe(true);
  });

  it('fails with message over 500 chars', () => {
    const result = giftPayloadSchema.safeParse({
      ...validPayload,
      message: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
