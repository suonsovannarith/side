import { and, asc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { channels, contentItems, productionTasks, users } from './schema.ts';
import {
  INITIAL_CHANNELS,
  INITIAL_CONTENT_ITEMS,
  INITIAL_TASKS,
} from '../data/seedData.ts';
import {
  Channel,
  ContentItem,
  ProductionTask,
  PRODUCTION_STAGES,
} from '../types/index.ts';

/**
 * Safely upsert a user in Cloud SQL PostgreSQL using Firebase Auth UID
 */
export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0] || 'Creator',
        currentRotationChannelId: 'CH-01',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database error in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

/**
 * Seed initial CreatorDesk data for a user if their workspace is empty
 */
export async function ensureUserWorkspaceSeeded(uid: string) {
  try {
    const existingChannels = await db
      .select()
      .from(channels)
      .where(eq(channels.userUid, uid));

    if (existingChannels.length > 0) {
      return;
    }

    // Insert all 7 pre-loaded channels
    await db.insert(channels).values(
      INITIAL_CHANNELS.map((ch, idx) => ({
        userUid: uid,
        channelCode: ch.id,
        name: ch.name,
        category: ch.category,
        description: ch.description,
        lastUploadedDate: ch.lastUploadedDate,
        color: ch.color,
        icon: ch.icon,
        activeInRotation: ch.activeInRotation,
        totalSubscribers: ch.totalSubscribers || '0',
        sortOrder: idx,
      }))
    );

    // Insert initial content items
    await db.insert(contentItems).values(
      INITIAL_CONTENT_ITEMS.map((item) => ({
        userUid: uid,
        contentCode: item.id,
        title: item.title,
        channelCode: item.channelId,
        type: item.type,
        priority: item.priority,
        status: item.status,
        plannedPublishDate: item.plannedPublishDate,
        assetFilePath: item.assetFilePath,
        notes: item.notes || '',
      }))
    );

    // Insert initial 7-stage production tasks
    await db.insert(productionTasks).values(
      INITIAL_TASKS.map((t) => ({
        userUid: uid,
        taskCode: t.id,
        contentCode: t.contentId,
        stageNumber: t.stageNumber,
        stageName: t.stageName,
        status: t.status,
        dueDate: t.dueDate,
        toolOrAssignee: t.toolOrAssignee,
        notes: t.notes || '',
      }))
    );
  } catch (error) {
    console.error('Database error in ensureUserWorkspaceSeeded:', error);
    throw new Error('Failed to seed initial workspace data.', { cause: error });
  }
}

/**
 * Fetch complete workspace state for a user
 */
export async function getUserWorkspace(uid: string, email: string, displayName?: string) {
  try {
    const userRecord = await getOrCreateUser(uid, email, displayName);
    await ensureUserWorkspaceSeeded(uid);

    const dbChannels = await db
      .select()
      .from(channels)
      .where(eq(channels.userUid, uid))
      .orderBy(asc(channels.sortOrder), asc(channels.id));

    const dbContent = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.userUid, uid))
      .orderBy(asc(contentItems.plannedPublishDate), asc(contentItems.id));

    const dbTasks = await db
      .select()
      .from(productionTasks)
      .where(eq(productionTasks.userUid, uid))
      .orderBy(asc(productionTasks.contentCode), asc(productionTasks.stageNumber));

    const formattedChannels: Channel[] = dbChannels.map((c) => ({
      id: c.channelCode,
      name: c.name,
      category: c.category,
      description: c.description,
      lastUploadedDate: c.lastUploadedDate,
      color: c.color,
      icon: c.icon,
      activeInRotation: c.activeInRotation,
      totalSubscribers: c.totalSubscribers || '0',
    }));

    const formattedContent: ContentItem[] = dbContent.map((i) => ({
      id: i.contentCode,
      title: i.title,
      channelId: i.channelCode,
      type: i.type as ContentItem['type'],
      priority: i.priority as ContentItem['priority'],
      status: i.status as ContentItem['status'],
      plannedPublishDate: i.plannedPublishDate,
      assetFilePath: i.assetFilePath,
      notes: i.notes || '',
      createdAt: i.createdAt ? i.createdAt.toISOString().split('T')[0] : '2026-03-01',
    }));

    const formattedTasks: ProductionTask[] = dbTasks.map((t) => ({
      id: t.taskCode,
      contentId: t.contentCode,
      stageNumber: t.stageNumber,
      stageName: t.stageName,
      status: t.status as ProductionTask['status'],
      dueDate: t.dueDate,
      toolOrAssignee: t.toolOrAssignee,
      notes: t.notes || '',
    }));

    return {
      channels: formattedChannels,
      contentItems: formattedContent,
      tasks: formattedTasks,
      currentRotationChannelId: userRecord.currentRotationChannelId || 'CH-01',
    };
  } catch (error) {
    console.error('Database error in getUserWorkspace:', error);
    throw new Error('Failed to load workspace from database.', { cause: error });
  }
}

/**
 * Create a new channel in PostgreSQL
 */
export async function createChannelRecord(uid: string, channel: Channel) {
  try {
    await db.insert(channels).values({
      userUid: uid,
      channelCode: channel.id,
      name: channel.name,
      category: channel.category,
      description: channel.description,
      lastUploadedDate: channel.lastUploadedDate,
      color: channel.color,
      icon: channel.icon,
      activeInRotation: channel.activeInRotation,
      totalSubscribers: channel.totalSubscribers || '0',
      sortOrder: 99,
    });
    return channel;
  } catch (error) {
    console.error('Database error in createChannelRecord:', error);
    throw new Error('Failed to create channel.', { cause: error });
  }
}

/**
 * Update a channel in PostgreSQL
 */
export async function updateChannelRecord(uid: string, channelCode: string, updates: Partial<Channel>) {
  try {
    const setValues: Record<string, unknown> = {};
    if (updates.name !== undefined) setValues.name = updates.name;
    if (updates.category !== undefined) setValues.category = updates.category;
    if (updates.description !== undefined) setValues.description = updates.description;
    if (updates.lastUploadedDate !== undefined) setValues.lastUploadedDate = updates.lastUploadedDate;
    if (updates.color !== undefined) setValues.color = updates.color;
    if (updates.icon !== undefined) setValues.icon = updates.icon;
    if (updates.activeInRotation !== undefined) setValues.activeInRotation = updates.activeInRotation;
    if (updates.totalSubscribers !== undefined) setValues.totalSubscribers = updates.totalSubscribers;

    await db
      .update(channels)
      .set(setValues)
      .where(and(eq(channels.userUid, uid), eq(channels.channelCode, channelCode)));
  } catch (error) {
    console.error('Database error in updateChannelRecord:', error);
    throw new Error('Failed to update channel.', { cause: error });
  }
}

/**
 * Delete a channel and its content/tasks in PostgreSQL
 */
export async function deleteChannelRecord(uid: string, channelCode: string) {
  try {
    // 1. Find all content items belonging to this channel
    const channelContent = await db
      .select({ contentCode: contentItems.contentCode })
      .from(contentItems)
      .where(and(eq(contentItems.userUid, uid), eq(contentItems.channelCode, channelCode)));

    // 2. Delete all production tasks for each content item in this channel
    for (const item of channelContent) {
      await db
        .delete(productionTasks)
        .where(
          and(
            eq(productionTasks.userUid, uid),
            eq(productionTasks.contentCode, item.contentCode)
          )
        );
    }

    // 3. Delete all content items belonging to this channel
    await db
      .delete(contentItems)
      .where(and(eq(contentItems.userUid, uid), eq(contentItems.channelCode, channelCode)));

    // 4. Delete the channel itself
    await db
      .delete(channels)
      .where(and(eq(channels.userUid, uid), eq(channels.channelCode, channelCode)));
  } catch (error) {
    console.error('Database error in deleteChannelRecord:', error);
    throw new Error('Failed to delete channel.', { cause: error });
  }
}

/**
 * Create a content item and optionally initialize its 7-stage production pipeline
 */
export async function createContentRecord(
  uid: string,
  item: ContentItem,
  generate7StagePipeline: boolean = true
) {
  try {
    await db.insert(contentItems).values({
      userUid: uid,
      contentCode: item.id,
      title: item.title,
      channelCode: item.channelId,
      type: item.type,
      priority: item.priority,
      status: item.status,
      plannedPublishDate: item.plannedPublishDate,
      assetFilePath: item.assetFilePath,
      notes: item.notes || '',
    });

    const createdTasks: ProductionTask[] = [];
    if (generate7StagePipeline) {
      const baseNum = Math.floor(1000 + Math.random() * 8999);
      for (const stage of PRODUCTION_STAGES) {
        const taskStatus: ProductionTask['status'] =
          item.status === 'Published'
            ? 'Completed'
            : item.status === 'Ready to Publish' && stage.number < 7
            ? 'Completed'
            : stage.number === 1
            ? 'In Progress'
            : 'Pending';

        const task: ProductionTask = {
          id: `TSK-${baseNum + stage.number}`,
          contentId: item.id,
          stageNumber: stage.number,
          stageName: stage.name,
          status: taskStatus,
          dueDate: item.plannedPublishDate,
          toolOrAssignee: stage.defaultTool,
          notes: stage.description,
        };
        createdTasks.push(task);
      }

      await db.insert(productionTasks).values(
        createdTasks.map((t) => ({
          userUid: uid,
          taskCode: t.id,
          contentCode: t.contentId,
          stageNumber: t.stageNumber,
          stageName: t.stageName,
          status: t.status,
          dueDate: t.dueDate,
          toolOrAssignee: t.toolOrAssignee,
          notes: t.notes,
        }))
      );
    }

    return { item, createdTasks };
  } catch (error) {
    console.error('Database error in createContentRecord:', error);
    throw new Error('Failed to create content item.', { cause: error });
  }
}

/**
 * Update a content item in PostgreSQL
 */
export async function updateContentRecord(uid: string, contentCode: string, updates: Partial<ContentItem>) {
  try {
    const setValues: Record<string, unknown> = {};
    if (updates.title !== undefined) setValues.title = updates.title;
    if (updates.channelId !== undefined) setValues.channelCode = updates.channelId;
    if (updates.type !== undefined) setValues.type = updates.type;
    if (updates.priority !== undefined) setValues.priority = updates.priority;
    if (updates.status !== undefined) setValues.status = updates.status;
    if (updates.plannedPublishDate !== undefined) setValues.plannedPublishDate = updates.plannedPublishDate;
    if (updates.assetFilePath !== undefined) setValues.assetFilePath = updates.assetFilePath;
    if (updates.notes !== undefined) setValues.notes = updates.notes;

    await db
      .update(contentItems)
      .set(setValues)
      .where(and(eq(contentItems.userUid, uid), eq(contentItems.contentCode, contentCode)));
  } catch (error) {
    console.error('Database error in updateContentRecord:', error);
    throw new Error('Failed to update content item.', { cause: error });
  }
}

/**
 * Delete a content item and its associated production tasks
 */
export async function deleteContentRecord(uid: string, contentCode: string) {
  try {
    await db
      .delete(productionTasks)
      .where(and(eq(productionTasks.userUid, uid), eq(productionTasks.contentCode, contentCode)));

    await db
      .delete(contentItems)
      .where(and(eq(contentItems.userUid, uid), eq(contentItems.contentCode, contentCode)));
  } catch (error) {
    console.error('Database error in deleteContentRecord:', error);
    throw new Error('Failed to delete content item.', { cause: error });
  }
}

/**
 * Create a single production task in PostgreSQL
 */
export async function createTaskRecord(uid: string, task: ProductionTask) {
  try {
    await db.insert(productionTasks).values({
      userUid: uid,
      taskCode: task.id,
      contentCode: task.contentId,
      stageNumber: task.stageNumber,
      stageName: task.stageName,
      status: task.status,
      dueDate: task.dueDate,
      toolOrAssignee: task.toolOrAssignee,
      notes: task.notes || '',
    });
    return task;
  } catch (error) {
    console.error('Database error in createTaskRecord:', error);
    throw new Error('Failed to create production task.', { cause: error });
  }
}

/**
 * Update a production task in PostgreSQL
 */
export async function updateTaskRecord(uid: string, taskCode: string, updates: Partial<ProductionTask>) {
  try {
    const setValues: Record<string, unknown> = {};
    if (updates.stageNumber !== undefined) setValues.stageNumber = updates.stageNumber;
    if (updates.stageName !== undefined) setValues.stageName = updates.stageName;
    if (updates.status !== undefined) setValues.status = updates.status;
    if (updates.dueDate !== undefined) setValues.dueDate = updates.dueDate;
    if (updates.toolOrAssignee !== undefined) setValues.toolOrAssignee = updates.toolOrAssignee;
    if (updates.notes !== undefined) setValues.notes = updates.notes;

    await db
      .update(productionTasks)
      .set(setValues)
      .where(and(eq(productionTasks.userUid, uid), eq(productionTasks.taskCode, taskCode)));
  } catch (error) {
    console.error('Database error in updateTaskRecord:', error);
    throw new Error('Failed to update production task.', { cause: error });
  }
}

/**
 * Delete a production task in PostgreSQL
 */
export async function deleteTaskRecord(uid: string, taskCode: string) {
  try {
    await db
      .delete(productionTasks)
      .where(and(eq(productionTasks.userUid, uid), eq(productionTasks.taskCode, taskCode)));
  } catch (error) {
    console.error('Database error in deleteTaskRecord:', error);
    throw new Error('Failed to delete production task.', { cause: error });
  }
}

/**
 * Update the user's Circular Linked List rotation pointer (schedule.txt state)
 */
export async function updateRotationPointer(uid: string, currentRotationChannelId: string) {
  try {
    await db
      .update(users)
      .set({ currentRotationChannelId })
      .where(eq(users.uid, uid));
  } catch (error) {
    console.error('Database error in updateRotationPointer:', error);
    throw new Error('Failed to update schedule rotation pointer.', { cause: error });
  }
}

/**
 * Reset user workspace to initial seed data
 */
export async function resetUserWorkspace(uid: string) {
  try {
    await db.delete(productionTasks).where(eq(productionTasks.userUid, uid));
    await db.delete(contentItems).where(eq(contentItems.userUid, uid));
    await db.delete(channels).where(eq(channels.userUid, uid));
    await updateRotationPointer(uid, 'CH-01');
    await ensureUserWorkspaceSeeded(uid);
  } catch (error) {
    console.error('Database error in resetUserWorkspace:', error);
    throw new Error('Failed to reset workspace.', { cause: error });
  }
}
