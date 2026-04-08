import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getItemTypesWithCounts } from '@/lib/db/items';
import { getSidebarCollections } from '@/lib/db/collections';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/components/layout/SidebarProvider';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;

  const [itemTypes, sidebarCollections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
  ]);

  const user = {
    name: session.user.name ?? 'User',
    email: session.user.email ?? '',
    image: session.user.image ?? null,
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar itemTypes={itemTypes} sidebarCollections={sidebarCollections} user={user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
