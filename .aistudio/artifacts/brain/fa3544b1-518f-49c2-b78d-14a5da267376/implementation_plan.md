# CreatorDesk — Channel Editing & Cascading Removal Enhancement

This update adds full **Channel Edit** and **Channel Remove** capabilities to CreatorDesk, enabling users to modify all channel attributes or delete a channel (along with its associated content items and production tasks) directly from both the left navigation sidebar and the main dashboard channel cards.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed from your responses:

- **Confirmed Decision 1 — Cascading Deletion of Associated Content & Tasks**: Removing a channel deletes the channel record itself and automatically removes all content ideas (`ContentSLL` nodes) and 7-stage production tasks (`TaskDLL` nodes) belonging to that channel, while advancing or re-linking the Circular Linked List (`ScheduleCLL`) rotation pointer if the deleted channel was the active turn.
- **Confirmed Decision 2 — Dual-Surface Entry Points (Sidebar + Dashboard Cards)**: Edit and Delete action triggers appear on both the left navigation sidebar channel rows and the horizontal/compact "Your channels" status bars on the Home dashboard.
- **Confirmed Decision 3 — Full Attribute Editing Modal**: The Edit Channel modal allows modifying all channel properties: Channel Name, Category, Description, Badge Color, Icon, Last Uploaded Video Date, Subscriber Count, and Active in Publishing Rotation toggle, with a built-in Delete Channel action.

---

## 1. Overview & Core Concept

- **What It Does**: Empowers creators to customize any pre-loaded or newly created channel profile and prune unwanted channels at any time. Every edit or deletion immediately updates the UI, recalculates dashboard KPI metrics, re-links the in-memory `ContentSLL`, `TaskDLL`, and `ScheduleCLL` structures, updates the live `.txt` file exports (`channels.txt`, `content.txt`, `tasks.txt`, `schedule.txt`), and persists changes to Cloud SQL for PostgreSQL.
- **Target Audience / Persona**: Multi-channel YouTube creators adapting their workspace to their own brand lineup and demonstrating complete C++ CRUD operations (`Channel::updateProfile` and cascading linked-list node removal).
- **Key Value**: Eliminates static channel constraints so the 7 pre-loaded starter channels can be tailored or replaced effortlessly.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Triggering Channel Edit from the Sidebar or Dashboard**:
     - In the dark navy **Left Sidebar** (`CHANNELS` list), hovering over any channel reveals a subtle **Edit (Pencil)** and **Remove (Trash)** icon group on the right edge without disrupting click-to-filter navigation (`e.stopPropagation()`).
     - On the **Home Dashboard** (`Your channels` horizontal dark navy strips and compact grid cards), each channel bar includes dedicated **Edit** and **Delete** action buttons alongside the "Last uploaded video" metadata.
  2. **Editing All Channel Attributes**:
     - Clicking **Edit** opens the **Edit Channel Profile Modal** pre-populated with the selected channel's current values:
       - Channel ID badge (read-only identifier, e.g., `CH-01`)
       - Channel Name & Category (with quick category presets or custom input)
       - Badge Color picker & Channel Icon selector (`tech`, `fitness`, `productivity`, `story`, `podcast`, `controversy`, `kids`) with a live `ChannelBadge` preview
       - Last Uploaded Video Date & Subscriber Count
       - Description text area
       - "Include in Publishing Rotation (`ScheduleCLL`)" toggle switch
     - Clicking **Save Changes** updates the channel in state and Cloud SQL PostgreSQL and displays a confirmation toast.
  3. **Removing a Channel & Cascading Cleanup**:
     - Clicking **Delete / Remove Channel** (either directly on the card/sidebar or via the "Delete Channel" button inside the Edit Channel modal) removes the channel, purges its associated content ideas from `ContentSLL` and production tasks from `TaskDLL`, resets the active channel filter to `ALL` if the deleted channel was currently filtered, and updates the `ScheduleCLL` rotation pointer if needed.

- **Visual Identity & Theme**:
  - Preserves the **Warm-Editorial & Studio Dark-Navy** palette (`#111827` / `#161F30` dark surfaces, `#EFECE4` cream canvas, `#D4A359` warm gold accents, and `#DC2626` semantic crimson for destructive delete affordances).
  - Action buttons inside the dark navy channel strips use subtle translucent slate surfaces (`bg-slate-800/80 hover:bg-slate-700 text-slate-200`) with crimson hover states (`hover:bg-rose-950/80 hover:text-rose-300`) for deletion.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Transactional Cascading Delete in Cloud SQL + Client State**
  - *Chosen Approach*: When `DELETE /api/channels/:code` is invoked, the backend repository deletes all rows in `production_tasks` whose `content_code` belongs to the target `channel_code`, deletes all rows in `content_items` matching `channel_code`, and deletes the `channels` row—mirroring the exact cascade performed on `ContentSLL`, `TaskDLL`, and `ScheduleCLL` on the client.
  - *Why*: Prevents orphaned content items or tasks from skewing dashboard KPI counts ("Overdue tasks", "In Production", etc.) after a channel is removed.
  - *Alternatives Considered*: Leaving orphaned content items linked to a non-existent `channelId` (rejected per your confirmation to delete associated content and tasks).

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         Channel Edit & Delete Flow                        │
│                                                                           │
│  ┌─────────────────────────────┐      ┌────────────────────────────────┐  │
│  │   Dark Navy Left Sidebar    │      │   Home Dashboard Channel Bars  │  │
│  │  - Channel Row Hover Icons  │      │  - Full Strip & Compact Cards  │  │
│  │    [Edit Pencil] [Trash]    │      │    [Edit Button] [Trash Icon]  │  │
│  └──────────────┬──────────────┘      └───────────────┬────────────────┘  │
│                 └──────────────────┬──────────────────┘                   │
│                                    ▼                                      │
│                  ┌───────────────────────────────────┐                    │
│                  │    Edit Channel Profile Modal     │                    │
│                  │ - Name, Category, Description     │                    │
│                  │ - Color, Icon, Last Upload, Subs  │                    │
│                  │ - Active in Rotation (ScheduleCLL)│                    │
│                  │ - [Delete Channel] [Save Changes] │                    │
│                  └─────────┬───────────────┬─────────┘                    │
│                            │               │                              │
│              Update Action │               │ Cascading Delete Action      │
│                            ▼               ▼                              │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │         In-Memory Linked List Engine & State Synchronization        │  │
│  │ - Update channel profile & ScheduleCLL ring membership              │  │
│  │ - On delete: Remove channel from ScheduleCLL, purge matching        │  │
│  │   ContentSLL nodes & TaskDLL nodes, advance rotation pointer        │  │
│  └─────────────────────────────────┬───────────────────────────────────┘  │
└────────────────────────────────────┼──────────────────────────────────────┘
                                     │ PUT /api/channels/:code
                                     │ DELETE /api/channels/:code
┌────────────────────────────────────▼──────────────────────────────────────┐
│                   Express + Drizzle ORM (Cloud SQL Postgres)              │
│ - updateChannelRecord(uid, channelCode, updates)                          │
│ - deleteChannelRecord(uid, channelCode): cascades tasks -> content -> ch  │
└───────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping

- **`handleOpenEditChannelModal(channel)`**: Opens the edit modal pre-filled with all attributes of the target `Channel`.
- **`handleUpdateChannel(e)`**: Validates inputs, updates `channels` state, syncs `ScheduleCLL` active rotation membership, sends `PUT /api/channels/:code` to Cloud SQL PostgreSQL, and displays a confirmation toast.
- **`handleDeleteChannel(channelId)`**: Finds all content items with `channelId`, removes their tasks from `tasks` (`TaskDLL`) and items from `contentItems` (`ContentSLL`), removes the channel from `channels` (`ScheduleCLL`), updates `currentRotationChannelId` if the deleted channel was active in rotation, resets `selectedChannelFilter` to `'ALL'` if needed, and invokes `DELETE /api/channels/:code` on the backend.
