import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getItemTypesWithCounts } from '@/lib/db/items';
import { getSidebarCollections } from '@/lib/db/collections';
import { getSearchData } from '@/lib/db/search';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/components/layout/SidebarProvider';
import { ItemDrawerProvider } from '@/components/items/ItemDrawerProvider';
import { SearchProvider } from '@/context/SearchContext';
import { EditorPreferencesProvider } from '@/context/EditorPreferencesContext';
import CommandPalette from '@/components/search/CommandPalette';
import { DEFAULT_EDITOR_PREFERENCES } from '@/types/editor';
import type { EditorPreferences } from '@/types/editor';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;

  const [itemTypes, sidebarCollections, searchData, dbUser] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    getSearchData(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { editorPreferences: true } }),
  ]);

  const editorPreferences: EditorPreferences = {
    ...DEFAULT_EDITOR_PREFERENCES,
    ...(dbUser?.editorPreferences as Partial<EditorPreferences> | null ?? {}),
  };

  const user = {
    name: session.user.name ?? 'User',
    email: session.user.email ?? '',
    image: session.user.image ?? null,
  };

  return (
    <EditorPreferencesProvider initialPreferences={editorPreferences}>
      <SidebarProvider>
        <ItemDrawerProvider>
          <SearchProvider data={searchData}>
            <div className="flex h-screen flex-col overflow-hidden">
              <TopBar isPro={session.user.isPro} />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar itemTypes={itemTypes} sidebarCollections={sidebarCollections} user={user} />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
              </div>
            </div>
            <CommandPalette />
          </SearchProvider>
        </ItemDrawerProvider>
      </SidebarProvider>
    </EditorPreferencesProvider>
  );
}
