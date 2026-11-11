import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  SlidersHorizontal,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  PlaySquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderGit2,
  Layers,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  Channel,
  ContentItem,
  ProductionTask,
  DashboardStats,
  ContentType,
  PriorityLevel,
  ProductionStatus,
} from '../types/index.ts';
import { ChannelBadge } from './ChannelBadge.tsx';

interface VideoCalendarViewProps {
  channels: Channel[];
  contentItems: ContentItem[];
  tasks: ProductionTask[];
  stats: DashboardStats;
  selectedChannelFilter: string;
  onSelectChannelFilter: (channelId: string) => void;
  onOpenNewContentModal: (defaultDate?: string, defaultChannelId?: string) => void;
  onSelectContentItem: (item: ContentItem) => void;
  onOpenNewChannelModal: () => void;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channelId: string) => void;
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const VideoCalendarView: React.FC<VideoCalendarViewProps> = ({
  channels,
  contentItems,
  tasks,
  stats,
  selectedChannelFilter,
  onSelectChannelFilter,
  onOpenNewContentModal,
  onSelectContentItem,
  onOpenNewChannelModal,
  onEditChannel,
  onDeleteChannel,
}) => {
  // Default to March 2026 to match the reference screenshot & seeded schedule
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(2); // 0-indexed: 2 = March
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [showFilterBar, setShowFilterBar] = useState<boolean>(false);
  const [compactChannels, setCompactChannels] = useState<boolean>(false);

  const channelMap = useMemo(() => {
    const map = new Map<string, Channel>();
    for (const ch of channels) {
      map.set(ch.id, ch);
    }
    return map;
  }, [channels]);

  const filteredItems = useMemo(() => {
    return contentItems.filter((item) => {
      if (selectedChannelFilter !== 'ALL' && item.channelId !== selectedChannelFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== 'ALL' && item.type !== typeFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const chName = channelMap.get(item.channelId)?.name.toLowerCase() || '';
        return (
          item.title.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          chName.includes(q) ||
          item.assetFilePath.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contentItems, selectedChannelFilter, statusFilter, typeFilter, searchQuery, channelMap]);

  // Build 35 or 42 calendar cells starting on Monday
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Convert JS Sunday=0..Saturday=6 to Monday=0..Sunday=6
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
    }[] = [];

    // Leading days from previous month
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dateStr = `${prevMonthYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Trailing days from next month to complete 5 or 6 weeks (35 or 42 cells)
    const totalCells = cells.length <= 35 ? 35 : 42;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
    let nextDay = 1;
    while (cells.length < totalCells) {
      const dateStr = `${nextMonthYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: nextDay++,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Group filtered content items by plannedPublishDate
  const itemsByDate = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    for (const item of filteredItems) {
      const list = map.get(item.plannedPublishDate) || [];
      list.push(item);
      map.set(item.plannedPublishDate, list);
    }
    return map;
  }, [filteredItems]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getCardTint = (item: ContentItem, channel?: Channel) => {
    if (item.status === 'Published') {
      return 'bg-[#DCFCE7]/85 hover:bg-[#DCFCE7] border-[#BBF7D0]';
    }
    if (item.status === 'Ready to Publish') {
      return 'bg-[#E0F2FE]/85 hover:bg-[#E0F2FE] border-[#BAE6FD]';
    }
    if (item.status === 'In Production') {
      return 'bg-[#FEF3C7]/90 hover:bg-[#FEF3C7] border-[#FDE68A]';
    }
    // Idea state
    return 'bg-[#F3F4F6] hover:bg-[#E5E7EB] border-slate-200';
  };

  return (
    <div className="space-y-7">
      {/* Top Operational Dashboard Summary Strip (Required by Spec: Total Ideas, In Production, Ready, Published, Overdue Tasks, Channel Counts) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white/90 border border-slate-200/80 rounded-xl px-4 py-3 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Content Ideas</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.totalContentIdeas}
            </span>
            <span className="text-[11px] font-mono text-slate-500">ContentSLL</span>
          </div>
        </div>

        <div className="bg-white/90 border border-slate-200/80 rounded-xl px-4 py-3 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">In Production</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
              {stats.inProductionCount}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Active stages</span>
          </div>
        </div>

        <div className="bg-white/90 border border-slate-200/80 rounded-xl px-4 py-3 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Ready to Publish</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-sky-600 font-mono tabular-nums">
              {stats.readyToPublishCount}
            </span>
            <span className="text-[11px] text-sky-700 font-medium">Stage 7/7</span>
          </div>
        </div>

        <div className="bg-white/90 border border-slate-200/80 rounded-xl px-4 py-3 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Published Videos</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
              {stats.publishedCount}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Live</span>
          </div>
        </div>

        <div className="bg-white/90 border border-slate-200/80 rounded-xl px-4 py-3 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Overdue Tasks</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                stats.overdueTasksCount > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {stats.overdueTasksCount}
            </span>
            <span className="text-[11px] font-mono text-slate-500">TaskDLL</span>
          </div>
        </div>

        <div className="bg-white/90 border border-slate-200/80 rounded-xl px-4 py-3 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Active Channels</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {channels.length}
            </span>
            <span className="text-[11px] font-mono text-slate-500">ScheduleCLL</span>
          </div>
        </div>
      </section>

      {/* "Your channels" Horizontal Dark Navy Strips (Matches Reference Screenshot) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your channels</h2>
            {selectedChannelFilter !== 'ALL' && (
              <button
                onClick={() => onSelectChannelFilter('ALL')}
                className="text-xs font-medium text-amber-700 hover:text-amber-900 underline cursor-pointer"
              >
                Clear channel filter ({channelMap.get(selectedChannelFilter)?.name})
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCompactChannels((v) => !v)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {compactChannels ? 'Show full bars' : 'Compact grid'}
            </button>
            <button
              onClick={onOpenNewChannelModal}
              className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add channel
            </button>
          </div>
        </div>

        {compactChannels ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {channels.map((ch) => {
              const count =
                stats.channelCounts.find((c) => c.channelId === ch.id)?.count ?? 0;
              const isSelected = selectedChannelFilter === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() =>
                    onSelectChannelFilter(isSelected ? 'ALL' : ch.id)
                  }
                  className={`group w-full text-left flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f172a] text-white ring-2 ring-[#D4A359]'
                      : 'bg-[#161F30] hover:bg-[#1E293B] text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ChannelBadge icon={ch.icon} color={ch.color} size="md" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{ch.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {count} videos · Last: {ch.lastUploadedDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditChannel(ch);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={`Edit ${ch.name}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChannel(ch.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/90 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title={`Remove ${ch.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2.5">
            {channels.map((ch) => {
              const count =
                stats.channelCounts.find((c) => c.channelId === ch.id)?.count ?? 0;
              const isSelected = selectedChannelFilter === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() =>
                    onSelectChannelFilter(isSelected ? 'ALL' : ch.id)
                  }
                  className={`w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-xl transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-[#0f172a] text-white ring-2 ring-[#D4A359]'
                      : 'bg-[#161F30] hover:bg-[#1E293B] text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <ChannelBadge icon={ch.icon} color={ch.color} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-[15px] tracking-tight text-white">
                          {ch.name}
                        </span>
                        <span className="text-xs text-slate-400 hidden md:inline">
                          · {ch.category} · {count} videos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last uploaded video: {ch.lastUploadedDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditChannel(ch);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                        title={`Edit ${ch.name}`}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChannel(ch.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-rose-950/90 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title={`Delete ${ch.name} and its content`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Video Calendar Header & Controls (Matches Reference Screenshot) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Video calendar ({selectedChannelFilter === 'ALL' ? 'all channels' : channelMap.get(selectedChannelFilter)?.name})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, ID, path..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 w-48"
              />
            </div>

            <button
              onClick={() => onOpenNewContentModal()}
              className="px-3.5 py-1.5 bg-[#161F30] hover:bg-[#0f172a] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> New video idea
            </button>
          </div>
        </div>

        {/* Month Selector & Filter / Settings Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            { (statusFilter !== 'ALL' || typeFilter !== 'ALL' || searchQuery) && (
              <span className="text-xs text-slate-600">
                Showing {filteredItems.length} of {contentItems.length} videos
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterBar((v) => !v)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                showFilterBar || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-800 border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>

            <button
              onClick={() => {
                setCurrentYear(2026);
                setCurrentMonth(2);
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setSearchQuery('');
                onSelectChannelFilter('ALL');
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Reset calendar view to March 2026"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Reset View
            </button>

            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-lg flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-lg flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filter Drawer */}
        {showFilterBar && (
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                {(['ALL', 'Idea', 'In Production', 'Ready to Publish', 'Published'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Format:</span>
                {(['ALL', 'Long-form', 'Short-form'] as const).map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setTypeFilter(tp)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      typeFilter === tp
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tp}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#DCFCE7] border border-[#86EFAC]" />
                Published
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#E0F2FE] border border-[#7DD3FC]" />
                Ready
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#FEF3C7] border border-[#FCD34D]" />
                In Production
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#F3F4F6] border border-slate-300" />
                Idea
              </span>
            </div>
          </div>
        )}

        {/* 7-Column Calendar Grid (Matches Reference Screenshot Layout & Card Proportions) */}
        <div>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-3 mb-2 px-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-[11px] font-bold text-slate-400 tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {calendarDays.map((cell) => {
              const dayVideos = itemsByDate.get(cell.dateStr) || [];
              return (
                <div
                  key={cell.dateStr}
                  className={`group min-h-[168px] rounded-2xl p-3 flex flex-col justify-between transition-all border ${
                    cell.isCurrentMonth
                      ? 'bg-white border-white/80 shadow-2xs hover:border-slate-300'
                      : 'bg-white/60 border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    {/* Day Number & Quick Add Button */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-bold font-mono tabular-nums ${
                          cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      <button
                        onClick={() =>
                          onOpenNewContentModal(
                            cell.dateStr,
                            selectedChannelFilter !== 'ALL' ? selectedChannelFilter : undefined
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 flex items-center justify-center transition-all cursor-pointer"
                        title={`Schedule video on ${cell.dateStr}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Video Cards Inside Day Cell */}
                    {dayVideos.length === 0 ? (
                      <div className="text-[11px] text-slate-400 font-medium pt-1 select-none">
                        No videos
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayVideos.map((video) => {
                          const ch = channelMap.get(video.channelId);
                          const videoTasks = tasks.filter(
                            (t) => t.contentId === video.id
                          );
                          const completedCount = videoTasks.filter(
                            (t) => t.status === 'Completed'
                          ).length;

                          return (
                            <button
                              key={video.id}
                              onClick={() => onSelectContentItem(video)}
                              className={`w-full text-left rounded-xl p-2 border transition-all cursor-pointer ${getCardTint(
                                video,
                                ch
                              )}`}
                            >
                              {/* Row 1: Red Video Play Icon + Truncated Video Title */}
                              <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-2.5 rounded-[3px] bg-red-600 text-white inline-flex items-center justify-center shrink-0">
                                  <span className="w-0 h-0 border-y-[2.5px] border-y-transparent border-l-[4px] border-l-white ml-[0.5px]" />
                                </span>
                                <span className="text-[11.5px] font-bold text-slate-900 truncate leading-tight">
                                  {video.title}
                                </span>
                              </div>

                              {/* Row 2: Channel Icon + Channel Name + Stage Counter */}
                              <div className="mt-1.5 flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <ChannelBadge
                                    icon={ch?.icon || 'tech'}
                                    color={ch?.color || '#64748B'}
                                    size="xs"
                                  />
                                  <span className="text-[10.5px] font-medium text-slate-600 truncate">
                                    {ch?.name || video.channelId}
                                  </span>
                                </div>
                                {videoTasks.length > 0 && (
                                  <span className="text-[9.5px] font-mono text-slate-500 shrink-0 tabular-nums">
                                    {completedCount}/7
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
