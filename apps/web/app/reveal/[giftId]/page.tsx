import { RevealClient } from '@/components/reveal/RevealClient';

export default async function RevealPage(props: PageProps<'/reveal/[giftId]'>) {
  const { giftId } = await props.params;
  const sp = await props.searchParams;
  const token = (sp?.t as string | undefined) ?? '';
  return <RevealClient giftId={giftId} token={token} />;
}
