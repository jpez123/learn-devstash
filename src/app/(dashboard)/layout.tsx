import { prisma } from '@/lib/prisma';
import { getItemTypesWithCounts } from '@/lib/db/items';
import { getSidebarCollections } from '@/lib/db/collections';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/components/layout/SidebarProvider';

const DEMO_EMAIL = 'demo@devstash.io';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demoUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  const [itemTypes, sidebarCollections] = demoUser
    ? await Promise.all([
        getItemTypesWithCounts(demoUser.id),
        getSidebarCollections(demoUser.id),
      ])
    : [[], { favorites: [], recents: [] }];

  const user = demoUser
    ? { name: demoUser.name ?? 'User', email: demoUser.email ?? '' }
    : { name: 'User', email: '' };

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
