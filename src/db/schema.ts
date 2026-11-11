import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').default('Creator'),
  currentRotationChannelId: text('current_rotation_channel_id').default('CH-01'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Channels table (channels.txt)
export const channels = pgTable('channels', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  channelCode: text('channel_code').notNull(), // e.g., CH-01
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  lastUploadedDate: text('last_uploaded_date').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  activeInRotation: boolean('active_in_rotation').default(true).notNull(),
  totalSubscribers: text('total_subscribers').default('0'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Content Items table (content.txt & ContentSLL)
export const contentItems = pgTable('content_items', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  contentCode: text('content_code').notNull(), // e.g., CNT-101
  title: text('title').notNull(),
  channelCode: text('channel_code').notNull(), // e.g., CH-01
  type: text('type').notNull(), // 'Short-form' | 'Long-form'
  priority: text('priority').notNull(), // 'High' | 'Medium' | 'Low'
  status: text('status').notNull(), // 'Idea' | 'In Production' | 'Ready to Publish' | 'Published'
  plannedPublishDate: text('planned_publish_date').notNull(), // YYYY-MM-DD
  assetFilePath: text('asset_file_path').notNull(),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Production Tasks table (tasks.txt & TaskDLL)
export const productionTasks = pgTable('production_tasks', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  taskCode: text('task_code').notNull(), // e.g., TSK-501
  contentCode: text('content_code').notNull(), // e.g., CNT-101
  stageNumber: integer('stage_number').notNull(), // 1 to 7
  stageName: text('stage_name').notNull(),
  status: text('status').notNull(), // 'Pending' | 'In Progress' | 'Completed' | 'Blocked'
  dueDate: text('due_date').notNull(), // YYYY-MM-DD
  toolOrAssignee: text('tool_or_assignee').notNull(),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  channels: many(channels),
  contentItems: many(contentItems),
  productionTasks: many(productionTasks),
}));

export const channelsRelations = relations(channels, ({ one }) => ({
  user: one(users, {
    fields: [channels.userUid],
    references: [users.uid],
  }),
}));

export const contentItemsRelations = relations(contentItems, ({ one }) => ({
  user: one(users, {
    fields: [contentItems.userUid],
    references: [users.uid],
  }),
}));

export const productionTasksRelations = relations(productionTasks, ({ one }) => ({
  user: one(users, {
    fields: [productionTasks.userUid],
    references: [users.uid],
  }),
}));
