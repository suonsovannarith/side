import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Terminal,
  Download,
  FileText,
  Play,
  RotateCcw,
  Plus,
} from 'lucide-react';
import {
  Channel,
  ContentItem,
  ProductionTask,
  DashboardStats,
} from '../types/index.ts';
import {
  serializeChannelsTxt,
  serializeContentTxt,
  serializeTasksTxt,
  serializeScheduleTxt,
} from '../data/seedData.ts';

interface CliSimulatorViewProps {
  channels: Channel[];
  contentItems: ContentItem[];
  tasks: ProductionTask[];
  stats: DashboardStats;
  currentRotationChannelId: string;
  onAdvanceRotation: () => void;
  onOpenNewContentModal: () => void;
}

export const CliSimulatorView: React.FC<CliSimulatorViewProps> = ({
  channels,
  contentItems,
  tasks,
  stats,
  currentRotationChannelId,
  onAdvanceRotation,
  onOpenNewContentModal,
}) => {
  const [selectedFileTab, setSelectedFileTab] = useState<
    'channels.txt' | 'content.txt' | 'tasks.txt' | 'schedule.txt'
  >('channels.txt');

  const [commandInput, setCommandInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '============================================================',
    '  CreatorDesk C++17 CLI Runtime Environment (v1.0.0)        ',
    '  Structures: ContentSLL | TaskDLL | ScheduleCLL            ',
    '  Data I/O: channels.txt | content.txt | tasks.txt | schedule.txt',
    '============================================================',
    'Type a menu option (1-7) or click a quick command button below.',
    '',
    'MAIN MENU:',
    '  [1] Dashboard Operational Summary',
    '  [2] Traverse ContentSLL (Singly Linked List)',
    '  [3] Traverse TaskDLL (Doubly Linked List - 7-Stage Pipeline)',
    '  [4] Inspect & Advance ScheduleCLL (Circular Linked List Rotation)',
    '  [5] Search Content by Keyword / ID',
    '  [6] Flush / Serialize to data/*.txt files',
    '  [7] Insert New Content Idea',
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const fileContents = useMemo(() => {
    return {
      'channels.txt': serializeChannelsTxt(channels),
      'content.txt': serializeContentTxt(contentItems),
      'tasks.txt': serializeTasksTxt(tasks),
      'schedule.txt': serializeScheduleTxt(channels, currentRotationChannelId),
    };
  }, [channels, contentItems, tasks, currentRotationChannelId]);

  const executeCliOption = (rawCmd: string) => {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    const output: string[] = [`creatordesk> ${rawCmd}`];

    if (cmd === '1' || cmd === 'dashboard') {
      output.push(
        '--- CREATORDESK OPERATIONAL DASHBOARD ---',
        `Total Content Ideas       : ${stats.totalContentIdeas}`,
        `Videos In Production      : ${stats.inProductionCount}`,
        `Ready-to-Publish Videos   : ${stats.readyToPublishCount}`,
        `Published Videos          : ${stats.publishedCount}`,
        `Overdue Production Tasks  : ${stats.overdueTasksCount}`,
        'Content Count per Channel :'
      );
      for (const ch of stats.channelCounts) {
        output.push(`  - [${ch.channelId}] ${ch.channelName.padEnd(24, ' ')} : ${ch.count} items`);
      }
    } else if (cmd === '2' || cmd === 'sll') {
      output.push(
        `--- SINGLY LINKED LIST (ContentSLL) TRAVERSAL (${contentItems.length} nodes) ---`,
        'HEAD'
      );
      contentItems.slice(0, 12).forEach((item, idx) => {
        output.push(
          `  -> [${item.id}] "${item.title}" | ${item.channelId} | ${item.type} | ${item.status} | Due: ${item.plannedPublishDate}`
        );
      });
      if (contentItems.length > 12) {
        output.push(`  ... (${contentItems.length - 12} additional nodes)`);
      }
      output.push('  -> nullptr');
    } else if (cmd === '3' || cmd === 'dll') {
      output.push(
        `--- DOUBLY LINKED LIST (TaskDLL) BIDIRECTIONAL PIPELINE (${tasks.length} nodes) ---`,
        'NULL'
      );
      tasks.slice(0, 14).forEach((t) => {
        output.push(
          `  <-> [${t.id}] (${t.contentId}) Stage ${t.stageNumber}/7: ${t.stageName} [${t.status}] Due: ${t.dueDate}`
        );
      });
      output.push('  <-> NULL');
    } else if (cmd === '4' || cmd === 'cll' || cmd === 'rotate') {
      onAdvanceRotation();
      const active = channels.filter((c) => c.activeInRotation);
      const currIdx = active.findIndex((c) => c.id === currentRotationChannelId);
      const nextCh = active[(currIdx + 1) % Math.max(active.length, 1)];
      output.push(
        '--- CIRCULAR LINKED LIST (ScheduleCLL) ROTATION ---',
        'Executing: current = current->next;',
        `Previous Pointer : ${currentRotationChannelId}`,
        `New Current Turn : ${nextCh?.id} (${nextCh?.name})`,
        `Circular Ring    : ${active.map((c) => c.id).join(' -> ')} -> [HEAD: ${active[0]?.id}]`
      );
    } else if (cmd.startsWith('5') || cmd.startsWith('search')) {
      const term = cmd.replace(/^(5|search)\s*/, '').trim() || 'ai';
      const matches = contentItems.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.id.toLowerCase().includes(term) ||
          c.channelId.toLowerCase().includes(term)
      );
      output.push(
        `--- ContentSLL::search("${term}") -> ${matches.length} match(es) ---`
      );
      matches.forEach((m) => {
        output.push(`  Found: [${m.id}] ${m.title} (${m.status}) - ${m.assetFilePath}`);
      });
    } else if (cmd === '6' || cmd === 'save' || cmd === 'files') {
      output.push(
        '--- FileManager::saveAll() ---',
        `[OK] Wrote ${channels.length} records to data/channels.txt`,
        `[OK] Wrote ${contentItems.length} records to data/content.txt`,
        `[OK] Wrote ${tasks.length} records to data/tasks.txt`,
        `[OK] Wrote circular rotation state to data/schedule.txt`
      );
    } else if (cmd === '7' || cmd === 'add') {
      output.push('Opening New Content Idea dialog (ContentSLL::append)...');
      onOpenNewContentModal();
    } else if (cmd === 'clear') {
      setTerminalLogs(['Console cleared. Type 1-7 to run a menu command.']);
      setCommandInput('');
      return;
    } else {
      output.push(
        `Unrecognized command "${rawCmd}". Enter 1-7, "dashboard", "sll", "dll", "rotate", "search <keyword>", or "clear".`
      );
    }

    setTerminalLogs((prev) => [...prev, ...output, '']);
    setCommandInput('');
  };

  const handleDownloadFile = (filename: keyof typeof fileContents) => {
    const blob = new Blob([fileContents[filename]], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Menu-Driven C++ CLI Simulator &amp; Text-File Storage (data/*.txt)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Run interactive CLI menu commands on your live workspace and inspect or download the four required pipe-delimited text files.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive C++ CLI Console */}
        <div className="lg:col-span-7 bg-[#0F172A] text-slate-100 rounded-2xl border border-slate-800 shadow-xs flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-[#161F30] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#D4A359]" />
              <span className="text-xs font-mono font-bold text-white">
                ./CreatorDesk --cli (Interactive C++ Menu Loop)
              </span>
            </div>
            <button
              onClick={() => executeCliOption('clear')}
              className="text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="px-4 py-2.5 bg-[#111827] border-b border-slate-800/80 flex flex-wrap items-center gap-1.5">
            {[
              { cmd: '1', label: '1. Dashboard' },
              { cmd: '2', label: '2. Traverse SLL' },
              { cmd: '3', label: '3. Traverse DLL' },
              { cmd: '4', label: '4. Rotate CLL' },
              { cmd: '5 tech', label: '5. Search "tech"' },
              { cmd: '6', label: '6. Save .txt Files' },
              { cmd: '7', label: '7. + New Idea' },
            ].map((btn) => (
              <button
                key={btn.cmd}
                onClick={() => executeCliOption(btn.cmd)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-[#D4A359] hover:text-slate-950 text-slate-200 font-mono text-[11px] font-medium transition-colors cursor-pointer"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Terminal Output Scroll Area */}
          <div className="p-4 font-mono text-xs leading-relaxed h-[390px] overflow-y-auto space-y-1 text-slate-200">
            {terminalLogs.map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith('creatordesk>')
                    ? 'text-[#D4A359] font-bold'
                    : line.startsWith('---')
                    ? 'text-emerald-400 font-semibold mt-1'
                    : 'text-slate-300 whitespace-pre-wrap'
                }
              >
                {line || '\u00A0'}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Input Line */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeCliOption(commandInput);
            }}
            className="px-4 py-3 bg-[#161F30] border-t border-slate-800 flex items-center gap-2"
          >
            <span className="text-xs font-mono font-bold text-[#D4A359]">
              creatordesk&gt;
            </span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Enter menu number (1-7) or command (e.g., search story)..."
              className="flex-1 bg-transparent text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#D4A359] hover:bg-[#c59245] text-slate-950 font-mono font-bold text-xs rounded cursor-pointer"
            >
              Run
            </button>
          </form>
        </div>

        {/* Right 5 Cols: Four Text Files Inspector (channels.txt, content.txt, tasks.txt, schedule.txt) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-bold text-slate-900">
                Persistent Text-File Storage (data/*.txt)
              </span>
            </div>
            <button
              onClick={() => handleDownloadFile(selectedFileTab)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Download {selectedFileTab}
            </button>
          </div>

          {/* File Selector Tabs */}
          <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-1 overflow-x-auto">
            {(
              ['channels.txt', 'content.txt', 'tasks.txt', 'schedule.txt'] as const
            ).map((fname) => (
              <button
                key={fname}
                onClick={() => setSelectedFileTab(fname)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedFileTab === fname
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {fname}
              </button>
            ))}
          </div>

          {/* File Content Preview */}
          <div className="p-4 flex-1 bg-[#0F172A] text-slate-200 font-mono text-[11px] leading-relaxed overflow-auto max-h-[430px]">
            <pre className="whitespace-pre">{fileContents[selectedFileTab]}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
