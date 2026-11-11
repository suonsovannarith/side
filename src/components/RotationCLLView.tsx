import React, { useMemo } from 'react';
import {
  RotateCw,
  ArrowRight,
  CornerDownLeft,
  Calendar,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Channel, ContentItem } from '../types/index.ts';
import { ScheduleCLL } from '../structures/ScheduleCLL.ts';
import { ChannelBadge } from './ChannelBadge.tsx';

interface RotationCLLViewProps {
  channels: Channel[];
  contentItems: ContentItem[];
  currentRotationChannelId: string;
  onAdvanceRotation: () => void;
  onSelectRotationChannel: (channelId: string) => void;
  onToggleChannelInRotation: (channelId: string, active: boolean) => void;
  onOpenNewContentModal: (defaultDate?: string, defaultChannelId?: string) => void;
}

export const RotationCLLView: React.FC<RotationCLLViewProps> = ({
  channels,
  contentItems,
  currentRotationChannelId,
  onAdvanceRotation,
  onSelectRotationChannel,
  onToggleChannelInRotation,
  onOpenNewContentModal,
}) => {
  // Instantiate our custom Circular Linked List (ScheduleCLL) to compute upcoming sequence
  const cllInstance = useMemo(() => {
    const cll = new ScheduleCLL();
    cll.loadFromArray(channels, currentRotationChannelId);
    return cll;
  }, [channels, currentRotationChannelId]);

  const activeChannels = useMemo(
    () => cllInstance.toArray(),
    [cllInstance]
  );

  const currentChannel = useMemo(
    () => cllInstance.getCurrent()?.data || activeChannels[0],
    [cllInstance, activeChannels]
  );

  const upcomingForecast = useMemo(
    () => cllInstance.peekUpcomingRotation(8),
    [cllInstance]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Publishing Rotation · Circular Linked List (ScheduleCLL)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Maintains a continuous publishing cycle across active channels where tail-&gt;next points directly back to head.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onAdvanceRotation}
            className="px-4 py-2.5 bg-[#D4A359] hover:bg-[#c59245] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCw className="w-4 h-4" />
            Advance Rotation (current = current-&gt;next)
          </button>
        </div>
      </div>

      {/* Circular Linked List (ScheduleCLL) Ring Topology Visualizer */}
      <section className="bg-[#161F30] text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#D4A359] font-semibold">
              structures/ScheduleCLL.h
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs font-mono text-emerald-400">
              tail-&gt;next == head (Verified Circular Topology)
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            currentPtr = {currentChannel?.id || 'nullptr'} ({currentChannel?.name || 'None'})
          </div>
        </div>

        <div className="overflow-x-auto pb-3">
          <div className="flex items-center gap-2.5 min-w-max">
            {activeChannels.map((ch, idx) => {
              const isCurrent = ch.id === currentChannel?.id;
              const isHead = idx === 0;
              const isTail = idx === activeChannels.length - 1;
              const nextCh = activeChannels[(idx + 1) % activeChannels.length];

              return (
                <React.Fragment key={ch.id}>
                  <div
                    onClick={() => onSelectRotationChannel(ch.id)}
                    className={`w-56 rounded-xl p-3.5 border transition-all cursor-pointer shrink-0 ${
                      isCurrent
                        ? 'bg-[#D4A359]/20 border-[#D4A359] ring-2 ring-[#D4A359]/50'
                        : 'bg-[#0F172A] border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                      <span className="text-slate-400">
                        {isHead ? '[HEAD]' : isTail ? '[TAIL]' : `NODE_${idx + 1}`}
                      </span>
                      {isCurrent && (
                        <span className="text-[#D4A359] font-bold">
                          ★ CURRENT TURN
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <ChannelBadge icon={ch.icon} color={ch.color} size="md" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {ch.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {ch.id}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">next*:</span>
                      <span className="text-emerald-400">
                        → {nextCh?.id} {isTail ? '(HEAD)' : ''}
                      </span>
                    </div>
                  </div>

                  {!isTail ? (
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <div className="px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-700/70 text-emerald-300 font-mono text-xs flex items-center gap-1.5 shrink-0">
                      <CornerDownLeft className="w-3.5 h-3.5" />
                      Wraps to HEAD ({activeChannels[0]?.id})
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Turn Spotlight + Upcoming 8-Slot Round-Robin Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Current Channel Up Next Card */}
        {currentChannel && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-amber-700 font-bold">
                Next Channel to Publish
              </div>
              <div className="mt-3 flex items-center gap-3.5">
                <ChannelBadge
                  icon={currentChannel.icon}
                  color={currentChannel.color}
                  size="lg"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {currentChannel.name}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {currentChannel.category}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {currentChannel.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel ID:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {currentChannel.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Uploaded:</span>
                  <span className="font-medium text-slate-800">
                    {currentChannel.lastUploadedDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Queued Videos:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {
                      contentItems.filter(
                        (i) =>
                          i.channelId === currentChannel.id &&
                          i.status !== 'Published'
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() =>
                  onOpenNewContentModal('2026-03-16', currentChannel.id)
                }
                className="flex-1 py-2 px-3 bg-[#161F30] hover:bg-[#0f172a] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Video for {currentChannel.name}
              </button>
            </div>
          </div>
        )}

        {/* Right: Upcoming Round-Robin Publishing Queue & Rotation Inclusion Toggles */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Upcoming 8 Publishing Slots (Round-Robin CLL Forecast)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generated by traversing current-&gt;next around ScheduleCLL.
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {upcomingForecast.map((ch, idx) => (
                <div
                  key={`${ch.id}-${idx}`}
                  className={`p-3 rounded-xl border ${
                    idx === 0
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-500">
                    Slot #{idx + 1} {idx === 0 ? '(Next)' : ''}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <ChannelBadge icon={ch.icon} color={ch.color} size="sm" />
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {ch.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Channel Rotation Membership
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {channels.map((ch) => (
                <label
                  key={ch.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200/80 hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <ChannelBadge icon={ch.icon} color={ch.color} size="sm" />
                    <span className="font-semibold text-slate-900">{ch.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ch.activeInRotation}
                    onChange={(e) =>
                      onToggleChannelInRotation(ch.id, e.target.checked)
                    }
                    className="rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
