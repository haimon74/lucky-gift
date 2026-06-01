import { z } from 'zod';
import { LOTTERY_GAMES } from './lottery-games';
import { OCCASIONS } from './occasions';
import { ALL_HOLIDAY_KEYS } from './holidays';

const VALID_GAME_IDS = LOTTERY_GAMES.map((g) => g.gameId);
const VALID_OCCASION_KEYS = [...OCCASIONS.map((o) => o.occasionKey), ...ALL_HOLIDAY_KEYS];

export const recipientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

export const giftPayloadSchema = z
  .object({
    gameId: z.string().refine((v) => VALID_GAME_IDS.includes(v), {
      message: `gameId must be one of: ${VALID_GAME_IDS.join(', ')}`,
    }),
    occasionKey: z.string().refine((v) => VALID_OCCASION_KEYS.includes(v), {
      message: `occasionKey must be one of: ${VALID_OCCASION_KEYS.join(', ')}`,
    }),
    message: z.string().max(500).default(''),
    senderName: z.string().min(1, 'Sender name is required').max(100),
    senderEmail: z.string().email('Invalid sender email'),
    recipients: z
      .array(recipientSchema)
      .min(1, 'At least one recipient is required')
      .max(5, 'Maximum 5 recipients allowed'),
  })
  .refine(
    (data) => {
      const emails = data.recipients.map((r) => r.email.toLowerCase());
      return new Set(emails).size === emails.length;
    },
    { message: 'Recipient emails must be unique', path: ['recipients'] },
  );

export const settingsUpdateSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
    }),
  ),
});

export type GiftPayloadInput = z.infer<typeof giftPayloadSchema>;
export type RecipientInput = z.infer<typeof recipientSchema>;
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
