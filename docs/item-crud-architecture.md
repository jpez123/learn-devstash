# Item CRUD Architecture

Design for a unified Create / Read / Update / Delete system across all 7 item types.

---

## Guiding Principles

- **One action file** for all item mutations (`src/actions/items.ts`)
- **One `lib/db` module** for all item queries (`src/lib/db/items.ts`) — called directly from server components
- **One dynamic route** (`/items/[type]`) with a page that resolves the type slug and renders the correct view
- **Type-specific logic lives in components**, not in actions — actions are generic, components adapt
- Follows existing patterns: `src/lib/db/collections.ts`, `src/actions/auth.ts`, server-component-first data fetching

---

## File Structure

```
src/
├── actions/
│   └── items.ts                  # All item mutations (create, update, delete, toggle)
│
├── lib/db/
│   └── items.ts                  # All item queries (getItems, getItem, getPinnedItems, etc.)
│
├── app/(dashboard)/
│   └── items/
│       └── [type]/
│           └── page.tsx          # Dynamic route — renders list for one item type
│
└── components/
    └── items/
        ├── ItemCard.tsx          # Card for grid/list views (replaces current ItemRow for type pages)
        ├── ItemRow.tsx           # Existing compact row (dashboard recent/pinned — keep as-is)
        ├── ItemDrawer.tsx        # Slide-in detail + edit drawer (opens on item click)
        ├── ItemForm.tsx          # Shared create/edit form — adapts fields by TypeCategory
        ├── ItemActions.tsx       # Delete / toggle favorite / toggle pin — calls server actions
        └── CreateItemButton.tsx  # Triggers drawer in create mode
```

---

## Routing: `/items/[type]`

The `[type]` segment is the **plural slug** of the item type name (e.g. `snippets`, `prompts`, `commands`, `notes`, `links`, `files`, `images`).

```
/items/snippets  → snippet items
/items/prompts   → prompt items
/items/commands  → command items
/items/notes     → note items
/items/links     → link items
/items/files     → file items   (Pro gate)
/items/images    → image items  (Pro gate)
```

### Slug ↔ Type name mapping

The page resolves the slug to an `ItemType` record using a lookup:

```ts
// Defined once — could live in src/lib/constants.ts
const TYPE_SLUG_MAP: Record<string, string> = {
  snippets: 'snippet',
  prompts:  'prompt',
  commands: 'command',
  notes:    'note',
  links:    'link',
  files:    'file',
  images:   'image',
};
```

If the slug is not in the map (or the type doesn't exist in DB), the page calls `notFound()`.

### Page responsibility

`app/(dashboard)/items/[type]/page.tsx` is a **server component** that:

1. Maps `params.type` → type name via `TYPE_SLUG_MAP`
2. Fetches the `ItemType` record (for color/icon/label display)
3. Fetches the user's items of that type via `getItemsByType(userId, typeName)`
4. Renders a page header (type icon + name + count + "New item" button)
5. Renders the item list/grid using `ItemCard`
6. Passes `ItemType` context down so child components can adapt

---

## Data Layer: `src/lib/db/items.ts`

Extend the existing file with queries needed for the type pages:

```ts
// Existing (keep):
getItemTypesWithCounts(userId)  // sidebar counts
getPinnedItems(userId)          // dashboard pinned section
getRecentItems(userId, limit)   // dashboard recent section

// New:
getItemsByType(userId, typeName, opts?)  // /items/[type] list page
getItemById(userId, itemId)             // item detail in drawer
```

### `getItemsByType` signature

```ts
type ItemListItem = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;      // preview for TEXT types
  url: string | null;          // for link types
  fileName: string | null;     // for file/image types
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
  itemType: { name: string; icon: string; color: string };
  tags: string[];
  _collectionCount: number;    // how many collections it belongs to
};

async function getItemsByType(
  userId: string,
  typeName: string,
  opts?: { orderBy?: 'createdAt' | 'lastUsedAt' | 'title'; pinFirst?: boolean }
): Promise<ItemListItem[]>
```

Pinned items float to the top by default (`pinFirst: true`).

### `getItemById` signature

```ts
type ItemDetail = ItemListItem & {
  collections: { id: string; name: string }[];
};

async function getItemById(userId: string, itemId: string): Promise<ItemDetail | null>
```

Includes the full collection membership list for the "belongs to" display in the drawer.

---

## Mutations: `src/actions/items.ts`

All mutations are **Server Actions** (`'use server'`). They follow the existing `{ success, data?, error? }` return pattern from `coding-standards.md`.

```ts
// ── Create ──────────────────────────────────────────────────────────────────

createItem(formData: CreateItemInput): Promise<ActionResult<{ id: string }>>

type CreateItemInput = {
  itemTypeId: string;
  title: string;
  description?: string;
  // TEXT fields
  content?: string;
  language?: string;
  // URL field
  url?: string;
  // FILE fields handled separately via upload API route
  // Tags and collection membership
  tags?: string[];
  collectionIds?: string[];
};

// ── Update ──────────────────────────────────────────────────────────────────

updateItem(itemId: string, data: UpdateItemInput): Promise<ActionResult<void>>

type UpdateItemInput = Partial<Omit<CreateItemInput, 'itemTypeId'>>;
// itemTypeId is not changeable after creation

// ── Delete ──────────────────────────────────────────────────────────────────

deleteItem(itemId: string): Promise<ActionResult<void>>
// Cascades via Prisma: removes TagsOnItems and ItemCollection rows automatically

// ── Toggles ─────────────────────────────────────────────────────────────────

toggleItemFavorite(itemId: string): Promise<ActionResult<{ isFavorite: boolean }>>
toggleItemPin(itemId: string):      Promise<ActionResult<{ isPinned: boolean }>>

// ── Collection membership ────────────────────────────────────────────────────

addItemToCollection(itemId: string, collectionId: string):      Promise<ActionResult<void>>
removeItemFromCollection(itemId: string, collectionId: string): Promise<ActionResult<void>>

// ── Recently used ────────────────────────────────────────────────────────────

touchItem(itemId: string): Promise<void>
// Updates lastUsedAt — called client-side when item drawer opens
```

### Auth inside actions

Every action verifies the session and checks ownership before mutating:

```ts
const session = await auth();
if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

const item = await prisma.item.findFirst({ where: { id: itemId, userId: session.user.id } });
if (!item) return { success: false, error: 'Not found' };
```

### Tag handling in create/update

Tags are upserted by name (since `Tag.name` is `@unique`) and linked via `TagsOnItems`:

```ts
// Inside createItem / updateItem
for (const tagName of tags) {
  const tag = await prisma.tag.upsert({
    where: { name: tagName },
    create: { name: tagName },
    update: {},
  });
  await prisma.tagsOnItems.upsert({
    where: { itemId_tagId: { itemId: item.id, tagId: tag.id } },
    create: { itemId: item.id, tagId: tag.id },
    update: {},
  });
}
```

On update, existing tag links not in the new list are deleted first, then re-linked.

---

## Component Responsibilities

### `ItemCard.tsx`

Renders one item in the list/grid on `/items/[type]`. Clicking opens `ItemDrawer` in view mode.

- Shows: type-colored border/icon, title, description, tags, date, favorite/pin indicators
- Does not fetch data — receives `ItemListItem` as prop
- Type-specific previews:
  - TEXT: shows truncated `content` as a code preview
  - URL: shows the domain of `url`
  - FILE: shows `fileName` + file size

### `ItemDrawer.tsx`

Slide-in panel from the right. Two modes controlled by a `mode` prop:

| Mode     | Trigger                        | Behavior                                  |
|----------|--------------------------------|-------------------------------------------|
| `view`   | Clicking an `ItemCard`         | Shows full content, edit/delete buttons   |
| `create` | Clicking "New item" button     | Renders `ItemForm` pre-set to that type   |
| `edit`   | Clicking edit inside view mode | Renders `ItemForm` pre-filled             |

On open: calls `touchItem(itemId)` server action to update `lastUsedAt`.

Drawer state is managed by a URL search param (`?item=<id>`) or local React state — URL param preferred for shareability and back-button support.

### `ItemForm.tsx`

Shared create/edit form. Adapts its fields based on `ItemType.category`:

| Category | Fields shown                                                     |
|----------|------------------------------------------------------------------|
| `TEXT`   | title, description, language (dropdown), content (code editor)  |
| `URL`    | title, description, url (text input)                            |
| `FILE`   | title, description, file upload input (calls `/api/upload`)     |

Fields always shown: title, description, tags (multi-input), collection membership (multi-select).

On submit: calls `createItem` or `updateItem` server action, then closes drawer and refreshes the list via `router.refresh()`.

### `ItemActions.tsx`

Compact action bar shown inside `ItemDrawer` (view mode). Buttons:

- Favorite toggle → `toggleItemFavorite`
- Pin toggle → `toggleItemPin`
- Copy content to clipboard (TEXT types only, client-side)
- Open URL in new tab (URL types only)
- Edit → switches drawer to edit mode
- Delete → confirmation dialog → `deleteItem` → closes drawer

### `CreateItemButton.tsx`

A button that opens `ItemDrawer` in create mode, pre-seeded with the current type (from the page context). Used in the page header.

---

## Type-Specific Logic Summary

All type-specific divergence is isolated to **components**, not actions:

| Where              | What adapts                                                      |
|--------------------|------------------------------------------------------------------|
| `ItemForm.tsx`     | Fields rendered based on `itemType.category`                    |
| `ItemCard.tsx`     | Content preview strategy (code vs URL vs file name)             |
| `ItemDrawer.tsx`   | Full content display (Markdown, syntax highlight, link, file)   |
| `ItemActions.tsx`  | Copy/open-URL button visibility                                 |
| `page.tsx`         | Page title, icon, empty-state message                           |

Actions (`items.ts`) and queries (`lib/db/items.ts`) are generic — they work the same for all types.

---

## Data Flow Summary

```
User opens /items/snippets
  → page.tsx (server component)
    → getItemsByType(userId, 'snippet')   [lib/db/items.ts]
    → renders ItemCard list

User clicks an ItemCard
  → ItemDrawer opens (view mode)
    → getItemById(userId, itemId)         [lib/db/items.ts — or passed as prop from list]
    → touchItem(itemId)                   [actions/items.ts]

User clicks "Edit" inside drawer
  → ItemForm renders pre-filled
  → on submit → updateItem(itemId, data)  [actions/items.ts]
  → router.refresh() — re-runs page.tsx query

User clicks "New item"
  → ItemDrawer opens (create mode)
  → ItemForm renders blank (type pre-set)
  → on submit → createItem(data)          [actions/items.ts]
  → router.refresh()

User clicks delete
  → deleteItem(itemId)                    [actions/items.ts]
  → drawer closes, router.refresh()
```
