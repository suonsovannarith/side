import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  Channel,
  ContentItem,
  ProductionTask,
  TaskStatus,
  PRODUCTION_STAGES,
} from '../types/index.ts';
import { ChannelBadge } from './ChannelBadge.tsx';

interface PipelineDLLViewProps {
  channels: Channel[];
  contentItems: ContentItem[];
  tasks: ProductionTask[];
  selectedContentId: string;
  onSelectContentId: (contentId: string) => void;
  onAdvanceStage: (task: ProductionTask) => void;
  onRewindStage: (task: ProductionTask) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onGenerate7StagesForContent: (contentItem: ContentItem) => void;
}

export const PipelineDLLView: React.FC<PipelineDLLViewProps> = ({
  channels,
  contentItems,
  tasks,
  selectedContentId,
  onSelectContentId,
  onAdvanceStage,
  onRewindStage,
  onUpdateTaskStatus,
  onGenerate7StagesForContent,
}) => {
  const [reverseTraversalView, setReverseTraversalView] = useState(false);

  const activeContent = useMemo(() => {
    return (
      contentItems.find((c) => c.id === selectedContentId) || contentItems[0]
    );
  }, [contentItems, selectedContentId]);

  const activeChannel = useMemo(() => {
    if (!activeContent) return undefined;
    return channels.find((c) => c.id === activeContent.channelId);
  }, [channels, activeContent]);

  const contentTasks = useMemo(() => {
    if (!activeContent) return [];
    const list = tasks
      .filter((t) => t.contentId === activeContent.id)
      .sort((a, b) => a.stageNumber - b.stageNumber);
    return reverseTraversalView ? [...list].reverse() : list;
  }, [tasks, activeContent, reverseTraversalView]);

  // Overdue check (reference date 2026-03-08 for March 2026 operational window)
  const isOverdue = (task: ProductionTask) => {
    return task.status !== 'Completed' && task.dueDate < '2026-03-08';
  };

  const completedStagesCount = useMemo(() => {
    if (!activeContent) return 0;
    return tasks.filter(
      (t) => t.contentId === activeContent.id && t.status === 'Completed'
    ).length;
  }, [tasks, activeContent]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            7-Stage Production Task Manager · Doubly Linked List (TaskDLL)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Bidirectional pointer structure (prev &lt;-&gt; next) allowing tasks to step forward or backward across the 7 production stages.
          </p>
        </div>

        {/* Select Video Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Inspect Video:
          </span>
          <select
            value={activeContent?.id || ''}
            onChange={(e) => onSelectContentId(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 shadow-2xs focus:outline-none"
          >
            {contentItems.map((item) => (
              <option key={item.id} value={item.id}>
                [{item.id}] {item.title} ({item.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Video Summary Card */}
      {activeContent && (
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <ChannelBadge
              icon={activeChannel?.icon || 'story'}
              color={activeChannel?.color || '#D97706'}
              size="lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="font-bold text-slate-900">{activeContent.id}</span>
                <span>·</span>
                <span>{activeChannel?.name || activeContent.channelId}</span>
                <span>·</span>
                <span>{activeContent.type}</span>
                <span>·</span>
                <span>Planned: {activeContent.plannedPublishDate}</span>
                <span>·</span>
                <span>{activeContent.assetFilePath}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {activeContent.title}
              </h2>
              {activeContent.notes && (
                <p className="text-xs text-slate-600 mt-1">{activeContent.notes}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs font-medium text-slate-500">
                Pipeline Completion
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {completedStagesCount} / 7 Stages
              </div>
            </div>
            <button
              onClick={() => setReverseTraversalView((v) => !v)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {reverseTraversalView
                ? 'Traverse Forward (HEAD -> TAIL)'
                : 'Traverse Reverse (TAIL -> HEAD)'}
            </button>
          </div>
        </section>
      )}

      {/* Doubly Linked List (TaskDLL) Bidirectional Visualizer */}
      <section className="bg-[#161F30] text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#D4A359] font-semibold">
              structures/TaskDLL.h
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs font-mono text-slate-300">
              {reverseTraversalView
                ? 'Reverse Traversal: tail -> prev -> head'
                : 'Forward Traversal: head -> next -> tail'}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            struct TaskNode &#123; Task data; TaskNode* prev; TaskNode* next; &#125;
          </div>
        </div>

        {contentTasks.length === 0 ? (
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-xs text-slate-300 mb-3">
              This content item does not have its 7-stage TaskDLL nodes initialized yet.
            </p>
            {activeContent && (
              <button
                onClick={() => onGenerate7StagesForContent(activeContent)}
                className="px-4 py-2 bg-[#D4A359] hover:bg-[#c59245] text-slate-950 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Initialize 7-Stage Production Pipeline (TaskDLL)
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-max">
              <div className="px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-800/70 text-rose-300 font-mono text-xs font-bold shrink-0">
                nullptr
              </div>

              {contentTasks.map((task, idx) => {
                const overdue = isOverdue(task);
                return (
                  <React.Fragment key={task.id}>
                    <div className="flex flex-col items-center text-[#D4A359] font-mono text-[10px] shrink-0">
                      <span>next →</span>
                      <span>← prev</span>
                    </div>

                    <div
                      className={`w-56 rounded-xl p-3.5 border transition-all shrink-0 ${
                        task.status === 'Completed'
                          ? 'bg-emerald-950/35 border-emerald-700/70'
                          : task.status === 'In Progress'
                          ? 'bg-amber-950/40 border-[#D4A359]'
                          : overdue
                          ? 'bg-rose-950/40 border-rose-600'
                          : 'bg-[#0F172A] border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>Stage {task.stageNumber}/7</span>
                        <span className="text-[#D4A359]">{task.id}</span>
                      </div>
                      <div className="text-xs font-bold text-white leading-snug">
                        {task.stageNumber}. {task.stageName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 truncate">
                        Tool: {task.toolOrAssignee}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
                        <span
                          className={
                            task.status === 'Completed'
                              ? 'text-emerald-400 font-semibold'
                              : task.status === 'In Progress'
                              ? 'text-amber-300 font-semibold'
                              : 'text-slate-400'
                          }
                        >
                          {task.status}
                        </span>
                        <span className={overdue ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          Due: {task.dueDate}
                        </span>
                      </div>

                      {/* Bidirectional Stage Controls */}
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                        <button
                          onClick={() => onRewindStage(task)}
                          className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                          title="Mark stage Pending / Rewind (prev)"
                        >
                          <ChevronLeft className="w-3 h-3" /> prev
                        </button>
                        <button
                          onClick={() => onAdvanceStage(task)}
                          className="flex-1 py-1 px-2 rounded bg-[#D4A359] hover:bg-[#c59245] text-[10px] font-mono font-bold text-slate-950 flex items-center justify-center gap-1 cursor-pointer"
                          title="Complete stage & advance next pointer"
                        >
                          next <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              <div className="flex flex-col items-center text-[#D4A359] font-mono text-[10px] shrink-0">
                <span>next →</span>
                <span>← prev</span>
              </div>

              <div className="px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-800/70 text-rose-300 font-mono text-xs font-bold shrink-0">
                nullptr
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Detailed 7-Stage Production Checklist Table */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Standard 7-Stage Video Production Workflow
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            1. Research · 2. Script · 3. Voiceover · 4. Visuals · 5. Edit · 6. Thumbnail · 7. Publish
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Task ID</th>
                <th className="py-3 px-4">Production Step</th>
                <th className="py-3 px-4">Tool / Workstation</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">DLL Pointer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-xs">
              {contentTasks.map((task) => {
                const overdue = isOverdue(task);
                return (
                  <tr key={task.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      0{task.stageNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {task.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {task.stageName}
                      </div>
                      <div className="text-[11px] text-slate-500">{task.notes}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {task.toolOrAssignee}
                    </td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap tabular-nums">
                      <span className={overdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {task.dueDate}
                      </span>
                      {overdue && (
                        <span className="ml-1.5 text-[10px] font-semibold text-rose-600">
                          · Overdue
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
                        }
                        className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onRewindStage(task)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] cursor-pointer"
                        >
                          ← Rewind
                        </button>
                        <button
                          onClick={() => onAdvanceStage(task)}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] cursor-pointer"
                        >
                          Complete →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
