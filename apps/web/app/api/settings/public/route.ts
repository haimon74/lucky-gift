import { getMaxRecipients, isPaymentsEnabled } from '@/lib/settings-cache';

export async function GET() {
  return Response.json({
    max_recipients: getMaxRecipients(),
    payments_enabled: isPaymentsEnabled(),
  });
}
