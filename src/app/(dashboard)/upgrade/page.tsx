import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import UpgradePage from '@/components/billing/UpgradePage';

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  if (session.user.isPro) redirect('/dashboard');

  return <UpgradePage />;
}
