import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  ArrowRight,
  FolderCode,
  Play,
  SlidersHorizontal,
  FileCode2,
} from 'lucide-react';
import {
  Channel,
  ContentItem,
  ContentType,
  PriorityLevel,
  ProductionStatus,
} from '../types/index.ts';
import { ChannelBadge } from './ChannelBadge.tsx';

interface IdeasSLLViewProps {
  channels: Channel[];
  contentItems: ContentItem[];
  onOpenNewContentModal: (defaultDate?: string, defaultChannelId?: string) => void;
  onSelectContentItem: (item: ContentItem) => void;
  onUpdateContentStatus: (contentId: string, status: ProductionStatus) => void;
  onDeleteContentItem: (contentId: string) => void;
}

export const IdeasSLLView: React.FC<IdeasSLLViewProps> = ({
  channels,
  contentItems,
  onOpenNewContentModal,
  onSelectContentItem,
  onUpdateContentStatus,
  onDeleteContentItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [traversalIndex, setTraversalIndex] = useState<number | null>(null);

  const channelMap = useMemo(() => {
    const m = new Map<string, Channel>();
    channels.forEach((c) => m.set(c.id, c));
    return m;
  }, [channels]);

  const filteredItems = useMemo(() => {
    return contentItems.filter((item) => {
      if (channelFilter !== 'ALL' && item.channelId !== channelFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.assetFilePath.toLowerCase().includes(q) ||
          item.channelId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contentItems, channelFilter, statusFilter, priorityFilter, searchQuery]);

  // Simulate C++ Singly Linked List linear traversal O(n)
  const runLinearTraversalDemo = () => {
    if (filteredItems.length === 0) return;
    setTraversalIndex(0);
    let step = 0;
    const maxSteps = Math.min(filteredItems.length, 10);
    const interval = setInterval(() => {
      step++;
      if (step >= maxSteps) {
        clearInterval(interval);
        setTimeout(() => setTraversalIndex(null), 600);
      } else {
        setTraversalIndex(step);
      }
    }, 220);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Content Idea Management · Singly Linked List (ContentSLL)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Each node stores Content ID, Video Title, Channel ID, Content Type, Priority, Status, Planned Date, and Script/Asset File Path.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={runLinearTraversalDemo}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 text-amber-600" />
            Simulate SLL Traversal O(n)
          </button>
          <button
            onClick={() => onOpenNewContentModal()}
            className="px-4 py-2 bg-[#161F30] hover:bg-[#0f172a] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Insert SLL Node (New Idea)
          </button>
        </div>
      </div>

      {/* Live Singly Linked List (ContentSLL) Pointer Chain Visualizer */}
      <section className="bg-[#161F30] text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#D4A359] font-semibold">
              structures/ContentSLL.h
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300 font-mono">
              size() = {filteredItems.length} nodes
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            struct ContentNode &#123; ContentItem data; ContentNode* next; &#125;
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max">
            {/* HEAD pointer box */}
            <div className="px-3 py-2 rounded-lg bg-[#D4A359]/20 border border-[#D4A359] text-[#D4A359] font-mono text-xs font-bold shrink-0">
              HEAD
            </div>
            <ArrowRight className="w-4 h-4 text-[#D4A359] shrink-0" />

            {filteredItems.slice(0, 8).map((item, idx) => {
              const ch = channelMap.get(item.channelId);
              const addr = `0x7f${(1040 + idx * 32).toString(16)}`;
              const nextAddr =
                idx < filteredItems.length - 1
                  ? `0x7f${(1040 + (idx + 1) * 32).toString(16)}`
                  : 'nullptr';
              const isHighlighted = traversalIndex === idx;

              return (
                <React.Fragment key={item.id}>
                  <div
                    onClick={() => onSelectContentItem(item)}
                    className={`w-52 rounded-xl p-3 border transition-all cursor-pointer shrink-0 ${
                      isHighlighted
                        ? 'bg-[#D4A359]/25 border-[#D4A359] scale-105'
                        : 'bg-[#0F172A] border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>@{addr}</span>
                      <span className="text-[#D4A359] font-semibold">{item.id}</span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      {item.title}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate">{ch?.name || item.channelId}</span>
                      <span>· {item.priority}</span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">next*:</span>
                      <span className="text-emerald-400">{nextAddr}</span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                </React.Fragment>
              );
            })}

            {filteredItems.length > 8 && (
              <>
                <div className="px-3 py-2 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-mono text-slate-300 shrink-0">
                  ... +{filteredItems.length - 8} more nodes
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              </>
            )}

            <div className="px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-800/70 text-rose-300 font-mono text-xs font-bold shrink-0">
              nullptr
            </div>
          </div>
        </div>
      </section>

      {/* Search & Multi-Facet Filter Bar */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ContentSLL by Content ID, Video Title, Channel ID, or Script File Path..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Channels ({channels.length})</option>
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.id} · {ch.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Idea">Idea</option>
            <option value="In Production">In Production</option>
            <option value="Ready to Publish">Ready to Publish</option>
            <option value="Published">Published</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </section>

      {/* High-Density Content Idea Table (All 8 Required Fields) */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Content ID</th>
                <th className="py-3 px-4">Video Title</th>
                <th className="py-3 px-4">Channel ID</th>
                <th className="py-3 px-4">Type · Priority</th>
                <th className="py-3 px-4">Production Status</th>
                <th className="py-3 px-4">Planned Date</th>
                <th className="py-3 px-4">Script / Asset File Path</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No content items match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const ch = channelMap.get(item.channelId);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/90 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                        {item.id}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectContentItem(item)}
                          className="font-semibold text-slate-900 hover:text-amber-700 text-left cursor-pointer"
                        >
                          {item.title}
                        </button>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ChannelBadge
                            icon={ch?.icon || 'tech'}
                            color={ch?.color || '#64748B'}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium text-slate-900">
                              {ch?.name || item.channelId}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {item.channelId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <span>{item.type}</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span
                          className={
                            item.priority === 'High'
                              ? 'font-semibold text-rose-600'
                              : item.priority === 'Medium'
                              ? 'font-medium text-amber-700'
                              : 'text-slate-500'
                          }
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            onUpdateContentStatus(
                              item.id,
                              e.target.value as ProductionStatus
                            )
                          }
                          className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none"
                        >
                          <option value="Idea">Idea</option>
                          <option value="In Production">In Production</option>
                          <option value="Ready to Publish">Ready to Publish</option>
                          <option value="Published">Published</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap tabular-nums">
                        {item.plannedPublishDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 max-w-[220px] truncate" title={item.assetFilePath}>
                        {item.assetFilePath}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onSelectContentItem(item)}
                            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-medium transition-colors cursor-pointer"
                          >
                            7-Stage Pipeline
                          </button>
                          <button
                            onClick={() => onDeleteContentItem(item.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete node from ContentSLL"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
