import { getDemoUser } from '@/lib/db/user';
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
  const demoUser = await getDemoUser();

  const [itemTypes, sidebarCollections] = await Promise.all([
    getItemTypesWithCounts(demoUser.id),
    getSidebarCollections(demoUser.id),
  ]);

  const user = { name: demoUser.name ?? 'User', email: demoUser.email ?? '' };

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
