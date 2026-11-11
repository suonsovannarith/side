/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Home,
  Lightbulb,
  SlidersHorizontal,
  Layers,
  RotateCw,
  Terminal,
  Code2,
  Plus,
  LogOut,
  LogIn,
  PlaySquare,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Trash2,
  RefreshCw,
  Edit3,
  Sparkles,
  Youtube,
  Bot,
} from 'lucide-react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleAuthProvider } from './lib/firebase.ts';
import {
  Channel,
  ContentItem,
  ProductionTask,
  DashboardStats,
  ContentType,
  PriorityLevel,
  ProductionStatus,
  TaskStatus,
  PRODUCTION_STAGES,
} from './types/index.ts';
import {
  INITIAL_CHANNELS,
  INITIAL_CONTENT_ITEMS,
  INITIAL_TASKS,
} from './data/seedData.ts';
import { ContentSLL } from './structures/ContentSLL.ts';
import { TaskDLL } from './structures/TaskDLL.ts';
import { ScheduleCLL } from './structures/ScheduleCLL.ts';
import { ChannelBadge } from './components/ChannelBadge.tsx';
import { VideoCalendarView } from './components/VideoCalendarView.tsx';
import { IdeasSLLView } from './components/IdeasSLLView.tsx';
import { PipelineDLLView } from './components/PipelineDLLView.tsx';
import { RotationCLLView } from './components/RotationCLLView.tsx';
import { CliSimulatorView } from './components/CliSimulatorView.tsx';
import { CppArchitectureView } from './components/CppArchitectureView.tsx';
import { AgentAssistantDrawer } from './components/AgentAssistantDrawer.tsx';
import { YouTubeSyncModal } from './components/YouTubeSyncModal.tsx';

type NavSection =
  | 'home'
  | 'ideas'
  | 'pipeline'
  | 'rotation'
  | 'cli'
  | 'cpp';

export default function App() {
  // Navigation & Sidebar State
  const [activeNav, setActiveNav] = useState<NavSection>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('ALL');

  // Firebase Auth User & In-Memory ID Token
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [syncingWorkspace, setSyncingWorkspace] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data State (Backed by Cloud SQL PostgreSQL when signed in, pre-loaded with 7 channels & March 2026 calendar)
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [contentItems, setContentItems] = useState<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  const [tasks, setTasks] = useState<ProductionTask[]>(INITIAL_TASKS);
  const [currentRotationChannelId, setCurrentRotationChannelId] = useState<string>('CH-01');

  // Selected Content Item for 7-Stage Pipeline & Quick Inspector Modal
  const [selectedPipelineContentId, setSelectedPipelineContentId] = useState<string>('CNT-114');
  const [inspectedContentItem, setInspectedContentItem] = useState<ContentItem | null>(null);

  // Phase 6: AI Assistant Drawer & Phase 7: YouTube Live Sync State
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);
  const [showYouTubeSync, setShowYouTubeSync] = useState<boolean>(false);

  // New Channel Modal State
  const [showNewChannelModal, setShowNewChannelModal] = useState<boolean>(false);
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [newChannelCategory, setNewChannelCategory] = useState<string>('AI-Generated Emotional Stories');
  const [newChannelDesc, setNewChannelDesc] = useState<string>('');
  const [newChannelColor, setNewChannelColor] = useState<string>('#EA580C');
  const [newChannelIcon, setNewChannelIcon] = useState<string>('story');

  // Edit Channel Modal State
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [editChannelName, setEditChannelName] = useState<string>('');
  const [editChannelCategory, setEditChannelCategory] = useState<string>('');
  const [editChannelDesc, setEditChannelDesc] = useState<string>('');
  const [editChannelColor, setEditChannelColor] = useState<string>('#EA580C');
  const [editChannelIcon, setEditChannelIcon] = useState<string>('story');
  const [editChannelLastUploaded, setEditChannelLastUploaded] = useState<string>('');
  const [editChannelSubscribers, setEditChannelSubscribers] = useState<string>('');
  const [editChannelActiveInRotation, setEditChannelActiveInRotation] = useState<boolean>(true);

  // New Content Idea Modal State
  const [showNewContentModal, setShowNewContentModal] = useState<boolean>(false);
  const [newContentTitle, setNewContentTitle] = useState<string>('');
  const [newContentChannelId, setNewContentChannelId] = useState<string>('CH-01');
  const [newContentType, setNewContentType] = useState<ContentType>('Long-form');
  const [newContentPriority, setNewContentPriority] = useState<PriorityLevel>('High');
  const [newContentStatus, setNewContentStatus] = useState<ProductionStatus>('In Production');
  const [newContentDate, setNewContentDate] = useState<string>('2026-03-10');
  const [newContentPath, setNewContentPath] = useState<string>('/data/assets/CH-01/new_script.md');
  const [newContentNotes, setNewContentNotes] = useState<string>('');
  const [autoGenerate7Stages, setAutoGenerate7Stages] = useState<boolean>(true);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Hydrate our three manual linked-list structures (ContentSLL, TaskDLL, ScheduleCLL)
  const sllEngine = useMemo(() => {
    const sll = new ContentSLL();
    sll.loadFromArray(contentItems);
    return sll;
  }, [contentItems]);

  const dllEngine = useMemo(() => {
    const dll = new TaskDLL();
    dll.loadFromArray(tasks);
    return dll;
  }, [tasks]);

  const cllEngine = useMemo(() => {
    const cll = new ScheduleCLL();
    cll.loadFromArray(channels, currentRotationChannelId);
    return cll;
  }, [channels, currentRotationChannelId]);

  // Compute Operational Dashboard Statistics
  const dashboardStats: DashboardStats = useMemo(() => {
    const allContent = sllEngine.toArray();
    const allTasks = dllEngine.toArray();

    const inProductionCount = allContent.filter(
      (c) => c.status === 'In Production'
    ).length;
    const readyToPublishCount = allContent.filter(
      (c) => c.status === 'Ready to Publish'
    ).length;
    const publishedCount = allContent.filter(
      (c) => c.status === 'Published'
    ).length;
    const overdueTasksCount = allTasks.filter(
      (t) => t.status !== 'Completed' && t.dueDate < '2026-03-08'
    ).length;

    const channelCounts = channels.map((ch) => ({
      channelId: ch.id,
      channelName: ch.name,
      count: allContent.filter((c) => c.channelId === ch.id).length,
      color: ch.color,
    }));

    return {
      totalContentIdeas: allContent.length,
      inProductionCount,
      readyToPublishCount,
      publishedCount,
      overdueTasksCount,
      channelCounts,
    };
  }, [sllEngine, dllEngine, channels]);

  // Helper for authenticated API calls to Cloud SQL backend
  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}, tokenOverride?: string) => {
      const tokenToUse = tokenOverride || idToken;
      if (!tokenToUse) return null;

      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToUse}`,
          ...(options.headers || {}),
        },
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed with status ${res.status}`);
      }
      return res.json();
    },
    [idToken]
  );

  // Listen to Firebase Auth state & load user's Cloud SQL PostgreSQL workspace
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          setSyncingWorkspace(true);
          const token = await user.getIdToken();
          setIdToken(token);
          const data = await apiFetch('/api/workspace', { method: 'GET' }, token);
          if (data) {
            setChannels(data.channels);
            setContentItems(data.contentItems);
            setTasks(data.tasks);
            setCurrentRotationChannelId(data.currentRotationChannelId || 'CH-01');
            showToast('Workspace synchronized with Cloud SQL PostgreSQL');
          }
        } catch (err) {
          console.error('Error syncing workspace from Cloud SQL:', err);
          showToast('Loaded workspace in local mode');
        } finally {
          setSyncingWorkspace(false);
          setAuthLoading(false);
        }
      } else {
        setIdToken(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [apiFetch, showToast]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      showToast('Sign-in popup closed or blocked');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out of CreatorDesk');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // --- CRUD Handlers (Mutate Linked Lists + Persist to Cloud SQL PostgreSQL) ---

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const nextNum = channels.length + 1;
    const newCh: Channel = {
      id: `CH-0${nextNum}`,
      name: newChannelName.trim(),
      category: newChannelCategory.trim() || 'General Content',
      description:
        newChannelDesc.trim() ||
        'Managed in CreatorDesk multi-channel publishing system.',
      lastUploadedDate: '9 March 2026',
      color: newChannelColor,
      icon: newChannelIcon,
      activeInRotation: true,
      totalSubscribers: '10K',
    };

    setChannels((prev) => [...prev, newCh]);
    setShowNewChannelModal(false);
    setNewChannelName('');
    setNewChannelDesc('');
    showToast(`Added channel ${newCh.name} (${newCh.id})`);

    if (idToken) {
      try {
        await apiFetch('/api/channels', {
          method: 'POST',
          body: JSON.stringify(newCh),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenEditChannelModal = (ch: Channel) => {
    setEditingChannel(ch);
    setEditChannelName(ch.name);
    setEditChannelCategory(ch.category);
    setEditChannelDesc(ch.description);
    setEditChannelColor(ch.color);
    setEditChannelIcon(ch.icon);
    setEditChannelLastUploaded(ch.lastUploadedDate);
    setEditChannelSubscribers(ch.totalSubscribers || '0');
    setEditChannelActiveInRotation(ch.activeInRotation);
  };

  const handleUpdateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel || !editChannelName.trim()) return;

    const updates: Partial<Channel> = {
      name: editChannelName.trim(),
      category: editChannelCategory.trim() || 'General Content',
      description: editChannelDesc.trim(),
      color: editChannelColor,
      icon: editChannelIcon,
      lastUploadedDate: editChannelLastUploaded.trim() || 'Not uploaded yet',
      totalSubscribers: editChannelSubscribers.trim() || '0',
      activeInRotation: editChannelActiveInRotation,
    };

    const targetId = editingChannel.id;
    setChannels((prev) =>
      prev.map((ch) => (ch.id === targetId ? { ...ch, ...updates } : ch))
    );
    setEditingChannel(null);
    showToast(`Updated channel ${updates.name} (${targetId})`);

    if (idToken) {
      try {
        await apiFetch(`/api/channels/${targetId}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    const targetCh = channels.find((c) => c.id === channelId);
    const channelContentIds = new Set(
      contentItems.filter((c) => c.channelId === channelId).map((c) => c.id)
    );

    // 1. Remove channel from channels state (and ScheduleCLL)
    const remainingChannels = channels.filter((c) => c.id !== channelId);
    setChannels(remainingChannels);

    // 2. Cascade delete content items belonging to this channel (ContentSLL)
    setContentItems((prev) => prev.filter((c) => c.channelId !== channelId));

    // 3. Cascade delete production tasks belonging to those content items (TaskDLL)
    setTasks((prev) => prev.filter((t) => !channelContentIds.has(t.contentId)));

    // 4. Clean up active filters, modals, and rotation pointer if needed
    if (selectedChannelFilter === channelId) {
      setSelectedChannelFilter('ALL');
    }
    if (editingChannel?.id === channelId) {
      setEditingChannel(null);
    }
    if (inspectedContentItem && channelContentIds.has(inspectedContentItem.id)) {
      setInspectedContentItem(null);
    }
    if (currentRotationChannelId === channelId) {
      const nextActive =
        remainingChannels.find((c) => c.activeInRotation) || remainingChannels[0];
      if (nextActive) {
        setCurrentRotationChannelId(nextActive.id);
      }
    }

    showToast(
      `Removed channel ${targetCh?.name || channelId} and ${channelContentIds.size} associated video(s)`
    );

    if (idToken) {
      try {
        await apiFetch(`/api/channels/${channelId}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenNewContentModal = (
    defaultDate?: string,
    defaultChannelId?: string
  ) => {
    const chId =
      defaultChannelId ||
      (selectedChannelFilter !== 'ALL' ? selectedChannelFilter : 'CH-01');
    setNewContentChannelId(chId);
    if (defaultDate) setNewContentDate(defaultDate);
    setNewContentPath(`/data/assets/${chId}/script_${Date.now().toString().slice(-4)}.md`);
    setShowNewContentModal(true);
  };

  const handleCreateContentItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContentTitle.trim()) return;

    const nextCode = `CNT-${101 + contentItems.length + Math.floor(Math.random() * 40)}`;
    const newItem: ContentItem = {
      id: nextCode,
      title: newContentTitle.trim(),
      channelId: newContentChannelId,
      type: newContentType,
      priority: newContentPriority,
      status: newContentStatus,
      plannedPublishDate: newContentDate,
      assetFilePath:
        newContentPath.trim() || `/data/assets/${newContentChannelId}/${nextCode}.md`,
      notes: newContentNotes.trim(),
      createdAt: '2026-03-09',
    };

    // Generate 7-stage tasks in TaskDLL if enabled
    const generatedTasks: ProductionTask[] = [];
    if (autoGenerate7Stages) {
      const baseNum = 600 + tasks.length;
      for (const stage of PRODUCTION_STAGES) {
        generatedTasks.push({
          id: `TSK-${baseNum + stage.number}`,
          contentId: newItem.id,
          stageNumber: stage.number,
          stageName: stage.name,
          status:
            newItem.status === 'Published'
              ? 'Completed'
              : stage.number === 1
              ? 'In Progress'
              : 'Pending',
          dueDate: newItem.plannedPublishDate,
          toolOrAssignee: stage.defaultTool,
          notes: stage.description,
        });
      }
    }

    setContentItems((prev) => [...prev, newItem]);
    if (generatedTasks.length > 0) {
      setTasks((prev) => [...prev, ...generatedTasks]);
    }

    setShowNewContentModal(false);
    setNewContentTitle('');
    setNewContentNotes('');
    setSelectedPipelineContentId(newItem.id);
    showToast(`Inserted ${newItem.id} into ContentSLL & 7 stages into TaskDLL`);

    if (idToken) {
      try {
        await apiFetch('/api/content', {
          method: 'POST',
          body: JSON.stringify({
            item: newItem,
            generate7StagePipeline: autoGenerate7Stages,
          }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAiAddIdeaToSLL = async (item: Partial<ContentItem>) => {
    const nextCode = `CNT-${101 + contentItems.length + Math.floor(Math.random() * 40)}`;
    const newItem: ContentItem = {
      id: nextCode,
      title: item.title || 'Untitled Video Idea',
      channelId: item.channelId || currentRotationChannelId,
      type: item.type || 'Long-form',
      priority: item.priority || 'High',
      status: 'Idea',
      plannedPublishDate: '2026-03-24',
      assetFilePath: item.assetFilePath || `/data/assets/${item.channelId || 'CH-01'}/${nextCode}.md`,
      notes: item.notes || '',
      tags: item.tags || [],
      createdAt: '2026-03-09',
    };

    const baseNum = 600 + tasks.length;
    const generatedTasks: ProductionTask[] = PRODUCTION_STAGES.map((stage) => ({
      id: `TSK-${baseNum + stage.number}`,
      contentId: newItem.id,
      stageNumber: stage.number,
      stageName: stage.name,
      status: stage.number === 1 ? 'In Progress' : 'Pending',
      dueDate: newItem.plannedPublishDate,
      toolOrAssignee: stage.defaultTool,
      notes: stage.description,
    }));

    setContentItems((prev) => [...prev, newItem]);
    setTasks((prev) => [...prev, ...generatedTasks]);
    setSelectedPipelineContentId(newItem.id);
    showToast(`AI Assistant created ${newItem.id} in ContentSLL with 7 stages`);

    if (idToken) {
      try {
        await apiFetch('/api/content', {
          method: 'POST',
          body: JSON.stringify({ item: newItem, generate7StagePipeline: true }),
        });
      } catch (err) {
        console.error('Error persisting AI content idea:', err);
      }
    }
  };

  const handleYouTubeMetricsUpdated = (channelId: string, subscribers: string, lastUpload: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? { ...c, totalSubscribers: subscribers, lastUploadedDate: lastUpload }
          : c
      )
    );
    showToast(`Updated [${channelId}] metrics via YouTube Data API v3`);
  };

  const handleUpdateContentStatus = async (
    contentId: string,
    status: ProductionStatus
  ) => {
    setContentItems((prev) =>
      prev.map((item) => (item.id === contentId ? { ...item, status } : item))
    );
    if (inspectedContentItem?.id === contentId) {
      setInspectedContentItem((prev) => (prev ? { ...prev, status } : null));
    }
    showToast(`Updated ${contentId} status to ${status}`);

    if (idToken) {
      try {
        await apiFetch(`/api/content/${contentId}`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteContentItem = async (contentId: string) => {
    setContentItems((prev) => prev.filter((i) => i.id !== contentId));
    setTasks((prev) => prev.filter((t) => t.contentId !== contentId));
    if (inspectedContentItem?.id === contentId) {
      setInspectedContentItem(null);
    }
    showToast(`Removed node ${contentId} from ContentSLL`);

    if (idToken) {
      try {
        await apiFetch(`/api/content/${contentId}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Bidirectional Doubly Linked List (TaskDLL) Stage Handlers
  const handleAdvanceTaskStage = async (task: ProductionTask) => {
    const newStatus: TaskStatus = 'Completed';
    const nextStageNum = task.stageNumber + 1;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === task.id) {
          return { ...t, status: newStatus };
        }
        // Automatically set the next stage in the DLL to 'In Progress'
        if (
          t.contentId === task.contentId &&
          t.stageNumber === nextStageNum &&
          t.status === 'Pending'
        ) {
          return { ...t, status: 'In Progress' };
        }
        return t;
      })
    );

    // If stage 7 was completed, promote content item status to Ready to Publish
    if (task.stageNumber === 7) {
      await handleUpdateContentStatus(task.contentId, 'Ready to Publish');
    } else {
      showToast(`Completed Stage ${task.stageNumber} (${task.stageName})`);
    }

    if (idToken) {
      try {
        await apiFetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRewindTaskStage = async (task: ProductionTask) => {
    const newStatus: TaskStatus = 'Pending';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    showToast(`Rewound Stage ${task.stageNumber} (${task.id}) to Pending`);

    if (idToken) {
      try {
        await apiFetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    showToast(`Task ${taskId} marked ${status}`);

    if (idToken) {
      try {
        await apiFetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenerate7StagesForContent = async (item: ContentItem) => {
    const baseNum = 700 + tasks.length;
    const created: ProductionTask[] = PRODUCTION_STAGES.map((stage) => ({
      id: `TSK-${baseNum + stage.number}`,
      contentId: item.id,
      stageNumber: stage.number,
      stageName: stage.name,
      status: stage.number === 1 ? 'In Progress' : 'Pending',
      dueDate: item.plannedPublishDate,
      toolOrAssignee: stage.defaultTool,
      notes: stage.description,
    }));

    setTasks((prev) => [...prev, ...created]);
    showToast(`Initialized 7 TaskDLL nodes for ${item.id}`);

    if (idToken) {
      try {
        for (const t of created) {
          await apiFetch('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(t),
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Circular Linked List (ScheduleCLL) Rotation Handler
  const handleAdvanceRotation = async () => {
    const nextChannel = cllEngine.rotateNext();
    if (!nextChannel) return;

    setCurrentRotationChannelId(nextChannel.id);
    showToast(
      `ScheduleCLL Rotated: current = current->next (${nextChannel.name})`
    );

    if (idToken) {
      try {
        await apiFetch('/api/schedule/rotation', {
          method: 'PUT',
          body: JSON.stringify({ currentRotationChannelId: nextChannel.id }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleChannelInRotation = async (
    channelId: string,
    activeInRotation: boolean
  ) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, activeInRotation } : ch
      )
    );
    showToast(
      `${channelId} ${
        activeInRotation ? 'added to' : 'removed from'
      } ScheduleCLL ring`
    );

    if (idToken) {
      try {
        await apiFetch(`/api/channels/${channelId}`, {
          method: 'PUT',
          body: JSON.stringify({ activeInRotation }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] p-2 sm:p-3 flex gap-3 text-slate-900 select-none sm:select-auto">
      {/* LEFT SIDEBAR: Deep Dark Navy (#0F172A / #131B2E) Matching Reference Screenshot */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-[#111827] text-slate-100 rounded-3xl border border-slate-700/70 p-3.5 flex flex-col justify-between shrink-0 transition-all duration-150 shadow-xl`}
      >
        <div className="space-y-3">
          {/* Brand Box */}
          <div className="border border-slate-700/80 rounded-2xl px-4 py-3.5 flex items-center justify-center gap-2.5 bg-[#161F30]/60">
            <div className="w-7 h-7 rounded-lg bg-[#D4A359] text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <PlaySquare className="w-4 h-4" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                CreatorDesk
              </span>
            )}
          </div>

          {/* Collapse Toggle Strip (Matches Reference Screenshot Box Below Logo) */}
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="w-full border border-slate-700/80 hover:border-slate-500 rounded-xl py-2 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Primary Navigation Links */}
          <nav className="space-y-1 pt-1">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'ideas', label: 'Ideas (SLL)', icon: Lightbulb },
              { id: 'pipeline', label: '7-Stage Tasks (DLL)', icon: Layers },
              { id: 'rotation', label: 'Rotation (CLL)', icon: RotateCw },
              { id: 'cli', label: 'CLI & .txt Files', icon: Terminal },
              { id: 'cpp', label: 'C++ OOP Code', icon: Code2 },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id as NavSection)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#DFB260] to-[#C8963E] text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-slate-950' : 'text-slate-400'
                    }`}
                  />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* AI Swarm & YouTube API Live Integrations */}
          <div className="pt-2 border-t border-slate-700/60 space-y-1.5">
            <button
              onClick={() => setShowAiAssistant(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1E293B] hover:bg-[#283548] text-[#D4A359] border border-[#D4A359]/30 transition-all cursor-pointer shadow-xs"
              title="AI Swarm Assistant (Gemini Flash)"
            >
              <Sparkles className="w-4 h-4 text-[#D4A359] shrink-0" />
              {!sidebarCollapsed && <span>AI Swarm Assistant</span>}
            </button>

            <button
              onClick={() => setShowYouTubeSync(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1E293B] hover:bg-[#283548] text-red-400 border border-red-500/30 transition-all cursor-pointer shadow-xs"
              title="YouTube Data API Sync"
            >
              <Youtube className="w-4 h-4 text-red-500 shrink-0" />
              {!sidebarCollapsed && <span>YouTube API Sync</span>}
            </button>
          </div>

          {/* CHANNELS Frame (Matches Reference Screenshot) */}
          {!sidebarCollapsed && (
            <div className="border border-slate-700/80 rounded-2xl p-3 bg-[#161F30]/40 space-y-2.5 mt-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Channels ({channels.length})
                </span>
                {selectedChannelFilter !== 'ALL' && (
                  <button
                    onClick={() => setSelectedChannelFilter('ALL')}
                    className="text-[10px] text-[#D4A359] hover:underline cursor-pointer"
                  >
                    All
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {channels.map((ch) => {
                  const isSelected = selectedChannelFilter === ch.id;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        setSelectedChannelFilter(isSelected ? 'ALL' : ch.id);
                        if (activeNav !== 'home' && activeNav !== 'ideas') {
                          setActiveNav('home');
                        }
                      }}
                      className={`group w-full flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                        isSelected
                          ? 'bg-slate-800 text-white ring-1 ring-[#D4A359]'
                          : 'text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ChannelBadge icon={ch.icon} color={ch.color} size="sm" />
                        <span className="truncate">{ch.name}</span>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditChannelModal(ch);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer"
                          title={`Edit ${ch.name}`}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChannel(ch.id);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/70 transition-colors cursor-pointer"
                          title={`Remove ${ch.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowNewChannelModal(true)}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> New channel
              </button>
            </div>
          )}
        </div>

        {/* Bottom User Profile & Firebase Auth Box (Matches Reference Screenshot) */}
        <div className="space-y-2.5 pt-3">
          <div className="border border-slate-700/80 rounded-2xl p-3 bg-[#161F30]/40 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-slate-600 bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {currentUser?.displayName
                ? currentUser.displayName[0].toUpperCase()
                : 'J'}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.displayName || 'John'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email || 'john@creatordesk.pro'}
                </div>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="px-1 flex items-center justify-between">
              {currentUser ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white py-1.5 px-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#D4A359] hover:text-amber-300 py-2 px-3 rounded-xl border border-[#D4A359]/40 hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign in with Google (Cloud SQL Sync)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT VIEWPORT: Warm Cream Canvas (#EFECE4) Matching Reference Screenshot */}
      <main className="flex-1 bg-[#EFECE4] rounded-3xl p-5 sm:p-7 overflow-y-auto shadow-xl relative">
        {/* Toast Feedback Banner */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#0F172A] text-white border border-[#D4A359] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#D4A359] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {activeNav === 'home' && (
          <VideoCalendarView
            channels={channels}
            contentItems={contentItems}
            tasks={tasks}
            stats={dashboardStats}
            selectedChannelFilter={selectedChannelFilter}
            onSelectChannelFilter={setSelectedChannelFilter}
            onOpenNewContentModal={handleOpenNewContentModal}
            onSelectContentItem={(item) => setInspectedContentItem(item)}
            onOpenNewChannelModal={() => setShowNewChannelModal(true)}
            onEditChannel={handleOpenEditChannelModal}
            onDeleteChannel={handleDeleteChannel}
          />
        )}

        {activeNav === 'ideas' && (
          <IdeasSLLView
            channels={channels}
            contentItems={contentItems}
            onOpenNewContentModal={handleOpenNewContentModal}
            onSelectContentItem={(item) => setInspectedContentItem(item)}
            onUpdateContentStatus={handleUpdateContentStatus}
            onDeleteContentItem={handleDeleteContentItem}
          />
        )}

        {activeNav === 'pipeline' && (
          <PipelineDLLView
            channels={channels}
            contentItems={contentItems}
            tasks={tasks}
            selectedContentId={selectedPipelineContentId}
            onSelectContentId={setSelectedPipelineContentId}
            onAdvanceStage={handleAdvanceTaskStage}
            onRewindStage={handleRewindTaskStage}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onGenerate7StagesForContent={handleGenerate7StagesForContent}
          />
        )}

        {activeNav === 'rotation' && (
          <RotationCLLView
            channels={channels}
            contentItems={contentItems}
            currentRotationChannelId={currentRotationChannelId}
            onAdvanceRotation={handleAdvanceRotation}
            onSelectRotationChannel={(id) => {
              setCurrentRotationChannelId(id);
              showToast(`Set ScheduleCLL rotation pointer to ${id}`);
            }}
            onToggleChannelInRotation={handleToggleChannelInRotation}
            onOpenNewContentModal={handleOpenNewContentModal}
          />
        )}

        {activeNav === 'cli' && (
          <CliSimulatorView
            channels={channels}
            contentItems={contentItems}
            tasks={tasks}
            stats={dashboardStats}
            currentRotationChannelId={currentRotationChannelId}
            onAdvanceRotation={handleAdvanceRotation}
            onOpenNewContentModal={() => handleOpenNewContentModal()}
          />
        )}

        {activeNav === 'cpp' && <CppArchitectureView />}
      </main>

      {/* MODAL 1: + New Channel */}
      {showNewChannelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Add New YouTube Channel Profile
              </h3>
              <button
                onClick={() => setShowNewChannelModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  required
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g., Mystery Chronicles AI"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Channel Category
                </label>
                <select
                  value={newChannelCategory}
                  onChange={(e) => setNewChannelCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="AI-Generated Emotional Stories">
                    AI-Generated Emotional Stories
                  </option>
                  <option value="Podcast & Business Personalities">
                    Podcast &amp; Business Personalities
                  </option>
                  <option value="Celebrity & Controversy Analysis">
                    Celebrity &amp; Controversy Analysis
                  </option>
                  <option value="AI Fictional Adventures for Children">
                    AI Fictional Adventures for Children
                  </option>
                  <option value="Consumer Hardware & Tech Reviews">
                    Consumer Hardware &amp; Tech Reviews
                  </option>
                  <option value="Fitness & Productivity">
                    Fitness &amp; Productivity
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Badge Color
                  </label>
                  <input
                    type="color"
                    value={newChannelColor}
                    onChange={(e) => setNewChannelColor(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Channel Icon
                  </label>
                  <select
                    value={newChannelIcon}
                    onChange={(e) => setNewChannelIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="story">AI Story Sparkle</option>
                    <option value="podcast">Podcast Mic</option>
                    <option value="controversy">Controversy Flame</option>
                    <option value="kids">Kids Adventure Book</option>
                    <option value="tech">Tech Hardware CPU</option>
                    <option value="fitness">Fitness Dumbbell</option>
                    <option value="productivity">Productivity Check</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Short description of content focus and audience..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChannelModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#161F30] hover:bg-[#0f172a] text-white font-semibold cursor-pointer"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1B: Edit Channel Profile & Remove Channel */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChannelBadge
                  icon={editChannelIcon}
                  color={editChannelColor}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Edit Channel Profile
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                      · {editingChannel.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Calls Channel::updateProfile() and syncs with Cloud SQL &amp; ScheduleCLL
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingChannel(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateChannel} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editChannelName}
                    onChange={(e) => setEditChannelName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Channel Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={editChannelCategory}
                    onChange={(e) => setEditChannelCategory(e.target.value)}
                    placeholder="e.g., Consumer Hardware & Gadgets"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Badge Color
                  </label>
                  <input
                    type="color"
                    value={editChannelColor}
                    onChange={(e) => setEditChannelColor(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Channel Icon
                  </label>
                  <select
                    value={editChannelIcon}
                    onChange={(e) => setEditChannelIcon(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="tech">Tech CPU</option>
                    <option value="fitness">Fitness</option>
                    <option value="productivity">Productivity</option>
                    <option value="story">AI Story</option>
                    <option value="podcast">Podcast Mic</option>
                    <option value="controversy">Controversy</option>
                    <option value="kids">Kids Book</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Last Uploaded
                  </label>
                  <input
                    type="text"
                    value={editChannelLastUploaded}
                    onChange={(e) => setEditChannelLastUploaded(e.target.value)}
                    placeholder="12 March 2026"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subscribers
                  </label>
                  <input
                    type="text"
                    value={editChannelSubscribers}
                    onChange={(e) => setEditChannelSubscribers(e.target.value)}
                    placeholder="412K"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editChannelDesc}
                  onChange={(e) => setEditChannelDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editChannelActiveInRotation}
                  onChange={(e) =>
                    setEditChannelActiveInRotation(e.target.checked)
                  }
                  className="rounded text-slate-900"
                />
                <span className="text-slate-700 font-medium">
                  Active in Publishing Rotation (Circular Linked List · ScheduleCLL)
                </span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteChannel(editingChannel.id)}
                  className="px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Channel &amp; Content
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingChannel(null)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#161F30] hover:bg-[#0f172a] text-white font-semibold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: + New Content Idea (All 8 Required Fields) */}
      {showNewContentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  New Video Content Idea (Insert into ContentSLL)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Creates a new ContentItem node and optionally generates its 7-stage TaskDLL checklist.
                </p>
              </div>
              <button
                onClick={() => setShowNewContentModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContentItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={newContentTitle}
                  onChange={(e) => setNewContentTitle(e.target.value)}
                  placeholder="e.g., The Forgotten Inventor Who Built a Time Machine"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Channel *
                  </label>
                  <select
                    value={newContentChannelId}
                    onChange={(e) => {
                      setNewContentChannelId(e.target.value);
                      setNewContentPath(
                        `/data/assets/${e.target.value}/script_draft.md`
                      );
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.id} · {ch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Planned Publishing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newContentDate}
                    onChange={(e) => setNewContentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Content Type
                  </label>
                  <select
                    value={newContentType}
                    onChange={(e) =>
                      setNewContentType(e.target.value as ContentType)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Long-form">Long-form</option>
                    <option value="Short-form">Short-form</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newContentPriority}
                    onChange={(e) =>
                      setNewContentPriority(e.target.value as PriorityLevel)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newContentStatus}
                    onChange={(e) =>
                      setNewContentStatus(e.target.value as ProductionStatus)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Idea">Idea</option>
                    <option value="In Production">In Production</option>
                    <option value="Ready to Publish">Ready to Publish</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Script or Asset File Path *
                </label>
                <input
                  type="text"
                  required
                  value={newContentPath}
                  onChange={(e) => setNewContentPath(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGenerate7Stages}
                  onChange={(e) => setAutoGenerate7Stages(e.target.checked)}
                  className="rounded text-slate-900"
                />
                <span className="text-slate-700 font-medium">
                  Auto-generate 7-stage Production Task pipeline (TaskDLL)
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewContentModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#161F30] hover:bg-[#0f172a] text-white font-semibold cursor-pointer"
                >
                  Insert Video Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Video Item Inspector & 7-Stage Pipeline Quick Drawer */}
      {inspectedContentItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="font-bold text-slate-900">
                    {inspectedContentItem.id}
                  </span>
                  <span>·</span>
                  <span>{inspectedContentItem.channelId}</span>
                  <span>·</span>
                  <span>{inspectedContentItem.type}</span>
                  <span>·</span>
                  <span>Priority: {inspectedContentItem.priority}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {inspectedContentItem.title}
                </h3>
                <div className="text-xs font-mono text-slate-500 mt-1">
                  Asset Path: {inspectedContentItem.assetFilePath} · Planned:{' '}
                  {inspectedContentItem.plannedPublishDate}
                </div>
              </div>
              <button
                onClick={() => setInspectedContentItem(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Quick Actions Bar */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600">
                  Production Status:
                </span>
                <select
                  value={inspectedContentItem.status}
                  onChange={(e) =>
                    handleUpdateContentStatus(
                      inspectedContentItem.id,
                      e.target.value as ProductionStatus
                    )
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 cursor-pointer"
                >
                  <option value="Idea">Idea</option>
                  <option value="In Production">In Production</option>
                  <option value="Ready to Publish">Ready to Publish</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedPipelineContentId(inspectedContentItem.id);
                    setInspectedContentItem(null);
                    setActiveNav('pipeline');
                  }}
                  className="px-3 py-1.5 bg-[#161F30] hover:bg-[#0f172a] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Open Full DLL Visualizer
                </button>
                <button
                  onClick={() => handleDeleteContentItem(inspectedContentItem.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Delete Video Idea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 7-Stage Production Checklist inside Modal */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  7-Stage Production Task Manager (TaskDLL)
                </h4>
              </div>

              {tasks.filter((t) => t.contentId === inspectedContentItem.id)
                .length === 0 ? (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-600">
                    No 7-stage tasks initialized for this video yet.
                  </p>
                  <button
                    onClick={() =>
                      handleGenerate7StagesForContent(inspectedContentItem)
                    }
                    className="px-3.5 py-2 bg-[#D4A359] text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    + Generate 7-Stage Production Tasks
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {tasks
                    .filter((t) => t.contentId === inspectedContentItem.id)
                    .sort((a, b) => a.stageNumber - b.stageNumber)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-white flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">
                            {task.stageNumber}. {task.stageName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {task.toolOrAssignee} · Due: {task.dueDate}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[11px] font-mono font-semibold ${
                              task.status === 'Completed'
                                ? 'text-emerald-600'
                                : task.status === 'In Progress'
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {task.status}
                          </span>
                          <button
                            onClick={() => handleRewindTaskStage(task)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-mono cursor-pointer"
                          >
                            ← prev
                          </button>
                          <button
                            onClick={() => handleAdvanceTaskStage(task)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-mono cursor-pointer"
                          >
                            next →
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: AI Swarm Assistant (Phase 6) */}
      <AgentAssistantDrawer
        isOpen={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        channels={channels}
        onAddIdeaToSLL={handleAiAddIdeaToSLL}
      />

      {/* MODAL: YouTube Data API v3 Live Sync (Phase 7) */}
      <YouTubeSyncModal
        isOpen={showYouTubeSync}
        onClose={() => setShowYouTubeSync(false)}
        channels={channels}
        onChannelMetricsUpdated={handleYouTubeMetricsUpdated}
      />
    </div>
  );
}
