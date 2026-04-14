# DevStash Item Types

All 7 system item types — non-editable, seeded on startup.

---

## Type Classification

| Category | Types                          | Description                              |
|----------|-------------------------------|------------------------------------------|
| `TEXT`   | snippet, prompt, command, note | Store text/code content via `content`    |
| `URL`    | link                           | Store a URL via `url`                    |
| `FILE`   | file, image                   | Store a file via `fileUrl` / `fileName` |

---

## Individual Types

### Snippet
| Field    | Value              |
|----------|--------------------|
| Icon     | `Code`             |
| Color    | `#3b82f6` (blue)   |
| Category | `TEXT`             |
| Route    | `/items/snippets`  |
| Pro Only | No                 |

**Purpose:** Reusable code blocks across any language. Primary use case for developers storing boilerplate, utilities, hooks, and patterns.

**Key fields:** `content` (the code), `language` (e.g. `"typescript"`, `"dockerfile"` — enables syntax highlighting), `isPinned`, `isFavorite`

---

### Prompt
| Field    | Value              |
|----------|--------------------|
| Icon     | `Sparkles`         |
| Color    | `#8b5cf6` (purple) |
| Category | `TEXT`             |
| Route    | `/items/prompts`   |
| Pro Only | No                 |

**Purpose:** AI prompts, system messages, and workflow templates. Targeted at AI-first developers saving reusable instructions.

**Key fields:** `content` (the prompt text), `isFavorite` — `language` is typically unused

---

### Command
| Field    | Value              |
|----------|--------------------|
| Icon     | `Terminal`         |
| Color    | `#f97316` (orange) |
| Category | `TEXT`             |
| Route    | `/items/commands`  |
| Pro Only | No                 |

**Purpose:** Shell commands, CLI scripts, deployment steps. Replaces `.bash_history` and `.txt` files.

**Key fields:** `content` (the command or script), `isPinned` — `language` can optionally indicate shell dialect (bash, zsh, etc.)

---

### Note
| Field    | Value              |
|----------|--------------------|
| Icon     | `StickyNote`       |
| Color    | `#fde047` (yellow) |
| Category | `TEXT`             |
| Route    | `/items/notes`     |
| Pro Only | No                 |

**Purpose:** Markdown notes, documentation, course notes. Rendered with a Markdown editor.

**Key fields:** `content` (markdown text), `title`, `description`

---

### Link
| Field    | Value               |
|----------|---------------------|
| Icon     | `Link`              |
| Color    | `#10b981` (emerald) |
| Category | `URL`               |
| Route    | `/items/links`      |
| Pro Only | No                  |

**Purpose:** Bookmarked URLs — docs, references, design resources, external tools.

**Key fields:** `url` (the bookmark target), `title`, `description` — `content`, `fileUrl`, `language` are unused

---

### File
| Field    | Value              |
|----------|--------------------|
| Icon     | `File`             |
| Color    | `#6b7280` (gray)   |
| Category | `FILE`             |
| Route    | `/items/files`     |
| Pro Only | **Yes**            |

**Purpose:** Context files, documents, PDFs, and other arbitrary files uploaded to Cloudflare R2.

**Key fields:** `fileUrl` (Cloudflare R2 URL), `fileName` (original name), `fileSize` (bytes) — `content` and `url` are unused

---

### Image
| Field    | Value              |
|----------|--------------------|
| Icon     | `Image`            |
| Color    | `#ec4899` (pink)   |
| Category | `FILE`             |
| Route    | `/items/images`    |
| Pro Only | **Yes**            |

**Purpose:** Screenshots, diagrams, design assets — stored on Cloudflare R2.

**Key fields:** `fileUrl`, `fileName`, `fileSize` — same as file type, distinguished by the type name for display/filtering

---

## Shared Properties

All item types share these fields regardless of category:

| Field         | Description                                     |
|---------------|-------------------------------------------------|
| `id`          | cuid primary key                                |
| `title`       | Required display name                           |
| `description` | Optional subtitle / summary                     |
| `isFavorite`  | Starred by the user                             |
| `isPinned`    | Pinned to top of views                          |
| `lastUsedAt`  | Tracks recency for "Recently Used" view         |
| `createdAt`   | Creation timestamp                              |
| `updatedAt`   | Last modified timestamp                         |
| `userId`      | Owner                                           |
| `itemTypeId`  | FK to `ItemType`                                |
| `tags`        | Many-to-many via `TagsOnItems`                  |
| `collections` | Many-to-many via `ItemCollection`               |

---

## Display Differences

| Category | Content Display               | Notes                                          |
|----------|-------------------------------|------------------------------------------------|
| `TEXT`   | Rendered in Markdown editor   | Snippets also get syntax highlighting via `language` |
| `URL`    | Clickable link + preview card | `url` field shown prominently                  |
| `FILE`   | Download/preview button       | `fileUrl` used for R2 access; Pro gate enforced |

---

## Pro Gate

`file` and `image` types are restricted to Pro users (`user.isPro = true`). During development all users have full access. The `isSystem: true` flag on these types marks them as platform-defined and non-editable by users.
