import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  FileCode,
  BookOpen,
  Database,
  Layers,
} from 'lucide-react';
import { CPP_SOURCE_FILES, CppSourceFile } from '../data/cppSourceFiles.ts';

export const CppArchitectureView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CppSourceFile>(
    CPP_SOURCE_FILES[0]
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          C++17 OOP Source Code &amp; Architecture Specification
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Complete header and implementation reference demonstrating Encapsulation, Constructor/Method Overloading, SLL/DLL/CLL Data Structures, and File I/O.
        </p>
      </div>

      {/* Requirement Compliance Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-bold text-slate-900">
            1. Applied OOP Principles
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Private member encapsulation, 3 overloaded constructors per model, and overloaded update/search methods.
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-bold text-slate-900">
            2. Three Linked Lists (SLL/DLL/CLL)
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Manual pointer implementations for ContentSLL.h, TaskDLL.h (bidirectional), and ScheduleCLL.h (circular ring).
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-bold text-slate-900">
            3. Persistent File I/O &amp; CRUD
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Serializes and parses channels.txt, content.txt, tasks.txt, and schedule.txt across sessions.
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-bold text-slate-900">
            4. Bonus: Cloud SQL + GUI
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Connected to Cloud SQL for PostgreSQL via Drizzle ORM with Firebase Google Auth and full web GUI.
          </p>
        </div>
      </div>

      {/* Code Explorer Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Project Tree */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-2">
          <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider px-2 pb-1">
            CreatorDesk/ C++ Project Tree
          </div>
          {CPP_SOURCE_FILES.map((file) => {
            const isSelected = file.path === selectedFile.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-[#161F30] text-white'
                    : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <FileCode
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    isSelected ? 'text-[#D4A359]' : 'text-slate-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="font-mono text-xs font-bold truncate">
                    {file.path}
                  </div>
                  <div
                    className={`text-[11px] truncate ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {file.concepts.join(' · ')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Viewer: C++ Code */}
        <div className="lg:col-span-8 bg-[#0F172A] text-slate-100 rounded-2xl border border-slate-800 shadow-xs flex flex-col overflow-hidden">
          <div className="px-5 py-3.5 bg-[#161F30] border-b border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold text-[#D4A359]">
                CreatorDesk/{selectedFile.path}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {selectedFile.description}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-mono flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy C++ Code
                </>
              )}
            </button>
          </div>

          <div className="p-5 font-mono text-xs leading-relaxed overflow-auto max-h-[540px] text-slate-200">
            <pre className="whitespace-pre">{selectedFile.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
