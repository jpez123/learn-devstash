import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import ChangePasswordForm from './ChangePasswordForm';
import DeleteAccountSection from './DeleteAccountSection';
import EditorPreferencesForm from './EditorPreferencesForm';
import BillingSection from './BillingSection';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) redirect('/sign-in');

  const hasPassword = !!user.password;
  const isPro = (session.user as { isPro?: boolean }).isPro ?? false;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <EditorPreferencesForm />

      {hasPassword && <ChangePasswordForm />}

      <BillingSection
        isPro={isPro}
        monthlyPriceId={process.env.STRIPE_PRICE_ID_MONTHLY ?? ''}
        yearlyPriceId={process.env.STRIPE_PRICE_ID_YEARLY ?? ''}
      />

      <DeleteAccountSection />
    </div>
  );
}
