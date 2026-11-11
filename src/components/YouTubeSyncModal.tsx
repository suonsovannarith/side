import React, { useState } from 'react';
import {
  Youtube,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  X,
  PlaySquare,
  TrendingUp,
  Video,
  Radio,
  Clock,
} from 'lucide-react';
import { Channel } from '../types/index.ts';
import { YouTubeSyncResult, YouTubePublishResponse } from '../lib/youtube.ts';

interface YouTubeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onChannelMetricsUpdated: (channelId: string, subscribers: string, lastUpload: string) => void;
}

export const YouTubeSyncModal: React.FC<YouTubeSyncModalProps> = ({
  isOpen,
  onClose,
  channels,
  onChannelMetricsUpdated,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || 'CH-01');
  const [syncing, setSyncing] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<YouTubeSyncResult | null>(null);
  const [publishResult, setPublishResult] = useState<YouTubePublishResponse | null>(null);

  if (!isOpen) return null;

  const currentChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const handleSyncMetrics = async () => {
    if (!currentChannel) return;
    setSyncing(true);
    setPublishResult(null);
    try {
      const res = await fetch('/api/youtube/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelCode: currentChannel.id,
          channelName: currentChannel.name,
          currentSubscribers: currentChannel.totalSubscribers || '300K',
        }),
      });
      const data: YouTubeSyncResult = await res.json();
      setSyncResult(data);
      onChannelMetricsUpdated(data.channelId, data.syncedSubscribers, data.syncedLastUpload);
    } catch (err) {
      console.error('Error syncing YouTube metrics:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDirectPublishDemo = async () => {
    if (!currentChannel) return;
    setPublishing(true);
    try {
      const res = await fetch('/api/youtube/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: `CNT-${Date.now().toString().slice(-4)}`,
          title: `[Live Stage 7] Latest Release for ${currentChannel.name}`,
          description: `Uploaded directly via CreatorDesk 7-stage production pipeline for ${currentChannel.name}.`,
          tags: ['creatordesk', currentChannel.category.toLowerCase(), '2026'],
          privacyStatus: 'public',
        }),
      });
      const data: YouTubePublishResponse = await res.json();
      setPublishResult(data);
    } catch (err) {
      console.error('Error publishing to YouTube:', err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F0F0F] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 text-white rounded-xl">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                YouTube Data API v3 Live Integration
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Connected
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sync live metrics, channel analytics &amp; direct stage 7 publishing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selection & Sync Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Select YouTube Channel
            </label>
            <select
              value={selectedChannelId}
              onChange={(e) => {
                setSelectedChannelId(e.target.value);
                setSyncResult(null);
                setPublishResult(null);
              }}
              className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  [{ch.id}] {ch.name} — Current Subs: {ch.totalSubscribers || '0'}
                </option>
              ))}
            </select>
          </div>

          {/* Current Channel Snapshot */}
          {currentChannel && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{currentChannel.name}</div>
                  <div className="text-[11px] text-slate-500">{currentChannel.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-red-600">
                    {syncResult ? syncResult.syncedSubscribers : currentChannel.totalSubscribers || '0'} Subs
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Last Upload: {syncResult ? syncResult.syncedLastUpload : currentChannel.lastUploadedDate}
                  </div>
                </div>
              </div>

              {syncResult && (
                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Video className="w-3.5 h-3.5 text-red-500" />
                    <span>Videos: <strong>{syncResult.videoCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Total Views: <strong>{syncResult.totalViews}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSyncMetrics}
              disabled={syncing}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Live Metrics'}
            </button>

            <button
              onClick={handleDirectPublishDemo}
              disabled={publishing}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <PlaySquare className="w-3.5 h-3.5" />
              {publishing ? 'Publishing...' : 'Simulate Stage 7 Publish'}
            </button>
          </div>

          {/* Publishing Result */}
          {publishResult && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Video Scheduled &amp; Published Successfully!
              </div>
              <p className="text-[11px] text-emerald-700">
                {publishResult.message}
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs">
                <a
                  href={publishResult.watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  Watch URL <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={publishResult.studioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-slate-700 hover:underline flex items-center gap-1"
                >
                  YouTube Studio <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
