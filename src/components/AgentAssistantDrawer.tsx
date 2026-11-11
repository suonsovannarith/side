import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  Check,
  Send,
  X,
  Plus,
  Layers,
  ArrowRight,
  Flame,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Channel, ContentItem } from '../types/index.ts';
import { IdeaBrainstormResult, StageScriptResult } from '../lib/gemini.ts';

interface AgentAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onAddIdeaToSLL: (item: Partial<ContentItem>) => void;
}

export const AgentAssistantDrawer: React.FC<AgentAssistantDrawerProps> = ({
  isOpen,
  onClose,
  channels,
  onAddIdeaToSLL,
}) => {
  const [activePersona, setActivePersona] = useState<'chill' | 'professional'>('chill');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || 'CH-01');
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [loadingScript, setLoadingScript] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<IdeaBrainstormResult[]>([]);
  const [activeScript, setActiveScript] = useState<{ title: string; script: StageScriptResult } | null>(null);
  const [addedTitles, setAddedTitles] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const handleGenerateIdeas = async () => {
    if (!activeChannel) return;
    setLoadingIdeas(true);
    try {
      const res = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName: activeChannel.name,
          category: activeChannel.category,
          persona: activePersona,
        }),
      });
      const data = await res.json();
      if (data.ideas) {
        setGeneratedIdeas(data.ideas);
      }
    } catch (err) {
      console.error('Error generating ideas:', err);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleGenerateScript = async (title: string) => {
    if (!activeChannel) return;
    setLoadingScript(true);
    try {
      const res = await fetch('/api/ai/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category: activeChannel.category,
          persona: activePersona,
        }),
      });
      const data = await res.json();
      if (data.script) {
        setActiveScript({ title, script: data.script });
      }
    } catch (err) {
      console.error('Error generating script:', err);
    } finally {
      setLoadingScript(false);
    }
  };

  const handleAddDirectly = (idea: IdeaBrainstormResult) => {
    onAddIdeaToSLL({
      title: idea.title,
      channelId: selectedChannelId,
      type: idea.type,
      priority: idea.priority,
      status: 'Idea',
      tags: idea.tags,
      notes: `Hook: ${idea.hook}`,
      assetFilePath: `/data/assets/${selectedChannelId}/${idea.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`,
    });
    setAddedTitles((prev) => new Set(prev).add(idea.title));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#161F30] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4A359]/20 text-[#D4A359] rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                CreatorDesk AI Swarm Assistant
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D4A359] text-slate-950">
                  Gemini Flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Autonomous ideation, scripting &amp; 7-stage pipeline integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Switcher & Channel Selector */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Select AI Agent Persona
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActivePersona('chill')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  activePersona === 'chill'
                    ? 'border-[#D4A359] bg-white ring-2 ring-[#D4A359]/20 shadow-xs'
                    : 'border-slate-200 bg-white/60 hover:bg-white text-slate-600'
                }`}
              >
                <Flame className={`w-4 h-4 mt-0.5 shrink-0 ${activePersona === 'chill' ? 'text-amber-500' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    @gemini-homie
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-medium">Chill</span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Viral dopamine hooks, creative pacing, anti-burnout vibes.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona('professional')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  activePersona === 'professional'
                    ? 'border-[#161F30] bg-white ring-2 ring-[#161F30]/20 shadow-xs'
                    : 'border-slate-200 bg-white/60 hover:bg-white text-slate-600'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${activePersona === 'professional' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    @professional-architect
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono font-medium">Pro</span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    High CTR titles, retention analytics, strict production standard.
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Target Channel
              </label>
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#D4A359]"
              >
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    [{ch.id}] {ch.name} — {ch.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-5">
              <button
                onClick={handleGenerateIdeas}
                disabled={loadingIdeas}
                className="px-4 py-2 bg-[#D4A359] hover:bg-[#c59245] text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingIdeas ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Brainstorm Hooks
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {generatedIdeas.length === 0 && !activeScript && (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-[#D4A359]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Ready to Brainstorm with Gemini AI
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Pick a channel and click "Brainstorm Hooks". The AI will generate 3 tailored video ideas with hooks, tags, and production estimates.
              </p>
            </div>
          )}

          {/* Generated Ideas List */}
          {generatedIdeas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Synthesized Video Hooks ({generatedIdeas.length})
                </h3>
                <span className="text-[11px] text-[#D4A359] font-semibold">
                  Tuned by {activePersona === 'chill' ? '@gemini-homie' : '@professional-architect'}
                </span>
              </div>

              {generatedIdeas.map((idea, idx) => {
                const isAdded = addedTitles.has(idea.title);
                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 mr-2">
                          {idea.type}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {idea.priority} Priority
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {idea.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleAddDirectly(idea)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          isAdded
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-[#161F30] hover:bg-slate-800 text-white shadow-2xs'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Added to SLL
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Add to Ideas
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/60 font-serif italic">
                      🎯 <strong className="font-sans not-italic text-slate-800">Opening Hook:</strong> "{idea.hook}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {idea.tags.map((t, tidx) => (
                          <span
                            key={tidx}
                            className="text-[10px] font-mono bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleGenerateScript(idea.title)}
                        className="text-[11px] font-bold text-[#D4A359] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Generate 7-Stage Script <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active 7-Stage Script Breakdown Modal / Section */}
          {loadingScript && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
              <span className="text-xs font-semibold text-amber-900">
                Synthesizing 7-stage script, visuals, and voiceover directives...
              </span>
            </div>
          )}

          {activeScript && (
            <div className="p-5 bg-white rounded-xl border-2 border-[#D4A359]/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#161F30] text-[#D4A359]">
                  7-Stage Production Directive
                </span>
                <button
                  onClick={() => setActiveScript(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Dismiss
                </button>
              </div>

              <h4 className="text-sm font-bold text-slate-900">
                {activeScript.title}
              </h4>
              <p className="text-xs text-slate-600">
                {activeScript.script.conceptOutline}
              </p>

              <div>
                <span className="text-[11px] font-bold text-slate-800 block mb-1">
                  Visual Scene Directives (Stage 4):
                </span>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-0.5">
                  {activeScript.script.visualDirectives.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-800 block mb-1">
                  Audio &amp; Voiceover Cadence (Stage 3):
                </span>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {activeScript.script.audioVoiceoverNotes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
