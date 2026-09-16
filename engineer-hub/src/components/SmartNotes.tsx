import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Search,
  Pin,
  Trash2,
  Copy,
  Check,
  Download,
  Share2,
  Cpu,
  BrainCircuit,
  Lightbulb,
  Layers,
  ArrowRight,
  ExternalLink,
  Code,
  Wrench,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SmartNote, ActiveModule } from '../types';

interface SmartNotesProps {
  notes: SmartNote[];
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRunAiAction: (
    noteId: string,
    action: 'explain' | 'summarize' | 'questions' | 'expand'
  ) => Promise<void>;
  onNavigateToModule: (module: ActiveModule) => void;
  isLoadingAi: boolean;
}

export const SmartNotes: React.FC<SmartNotesProps> = ({
  notes,
  onDeleteNote,
  onTogglePin,
  onRunAiAction,
  onNavigateToModule,
  isLoadingAi,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Available unique domains from notes
  const domains = ['All', ...Array.from(new Set(notes.map((n) => n.domain || n.subject || 'Engineering')))];

  const filteredNotes = notes.filter((note) => {
    const matchesDomain =
      selectedDomain === 'All' ||
      (note.domain || note.subject) === selectedDomain;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.problemTitle && note.problemTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (note.projectIdeaTitle && note.projectIdeaTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const selectedNote =
    notes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || notes[0];

  const handleCopyMarkdown = (note: SmartNote) => {
    const textToCopy = `# ${note.title}
Domain: ${note.domain || note.subject}
Date: ${note.createdAt}

## Problem Title
${note.problemTitle || note.title}

## Problem Analysis
${note.problemAnalysis || 'N/A'}

## Project Idea / Title
${note.projectIdeaTitle || note.title}

## Project Description
${note.projectDescription || 'N/A'}

## Key Features
${(note.keyFeatures || []).map((f) => `- ${f}`).join('\n')}

## Suggested Technologies
- Frontend: ${(note.suggestedTechnologies?.frontend || []).join(', ') || 'N/A'}
- Backend: ${(note.suggestedTechnologies?.backend || []).join(', ') || 'N/A'}
- Hardware: ${(note.suggestedTechnologies?.hardware || []).join(', ') || 'N/A'}
- Database: ${(note.suggestedTechnologies?.database || []).join(', ') || 'N/A'}

## Expected Impact
${note.expectedImpact || 'N/A'}

---
${note.content}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const handleExportText = (note: SmartNote) => {
    const element = document.createElement('a');
    const file = new Blob([note.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.toLowerCase().replace(/\s+/g, '-')}-spec.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Workflow-Generated Engineering Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart Notes & Technical Specs
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Structured engineering specifications generated from your problem-solving and project ideation workflow.
          </p>
        </div>

        {/* Workflow Origin Indicator */}
        <div className="flex items-center space-x-3 bg-amber-50/80 border border-amber-200/80 px-4 py-2.5 rounded-xl text-xs text-amber-900">
          <BrainCircuit className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Problem Solver ➔ Idea Generator ➔ <strong className="font-bold text-amber-950">Smart Note</strong>
          </span>
        </div>
      </div>

      {/* Empty State when no notes exist */}
      {notes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Smart Notes yet</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Analyze a problem and generate a project idea to save your engineering knowledge here.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateToModule('solver')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer inline-flex items-center space-x-2"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Go to Problem Solver</span>
            </button>
          </div>
        </div>
      ) : (
        /* Main Two-Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Note List & Search Filter */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search and Domain Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search project specifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Domain Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {domains.map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setSelectedDomain(dom)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                      selectedDomain === dom
                        ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Cards List */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredNotes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-amber-50/60 border-amber-400 shadow-xs ring-1 ring-amber-400/40'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                            {note.domain || note.subject || 'Engineering'}
                          </span>
                          {note.isPinned && (
                            <Pin className="w-3 h-3 text-amber-600 fill-amber-600" />
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs truncate">
                          {note.title}
                        </h4>
                        {note.problemTitle && note.problemTitle !== note.title && (
                          <p className="text-[11px] text-slate-500 truncate">
                            Problem: {note.problemTitle}
                          </p>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {note.createdAt}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {note.projectDescription || note.problemAnalysis || note.content}
                    </p>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span className="flex items-center space-x-1 font-mono">
                        <Cpu className="w-3 h-3 text-emerald-600" />
                        <span>Workflow Spec</span>
                      </span>
                      {note.aiInsights && note.aiInsights.length > 0 && (
                        <span className="flex items-center space-x-1 text-amber-700 font-bold">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{note.aiInsights.length} AI insights</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Specification Card with Engineering Fields & AI Actions */}
          <div className="lg:col-span-8 space-y-4">
            {selectedNote ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                {/* Note Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono">
                        {selectedNote.domain || selectedNote.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Created: {selectedNote.createdAt}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {selectedNote.title}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onTogglePin(selectedNote.id)}
                      className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
                        selectedNote.isPinned
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                      title={selectedNote.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyMarkdown(selectedNote)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                    >
                      {copiedNoteId === selectedNote.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Markdown</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleExportText(selectedNote)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export</span>
                    </button>

                    <button
                      onClick={() => onDeleteNote(selectedNote.id)}
                      className="p-2 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Structured Engineering Spec Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Problem & Analysis Block */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                      <BrainCircuit className="w-4 h-4 text-emerald-600" />
                      <span>1. Problem Analysis</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      {selectedNote.problemTitle || selectedNote.title}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedNote.problemAnalysis ||
                        'Analyzed engineering challenge with identified root causes, constraints, and operational bottlenecks.'}
                    </p>
                  </div>

                  {/* Project Idea & Description Block */}
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      <span>2. Project Architecture</span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-950">
                      {selectedNote.projectIdeaTitle || selectedNote.title}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedNote.projectDescription ||
                        'Synthesized project architecture designed to solve the underlying problem with high technical efficiency.'}
                    </p>
                  </div>
                </div>

                {/* Key Features & Tech Stack */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Key Features */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      <span>Key Features & Innovations</span>
                    </h4>
                    {selectedNote.keyFeatures && selectedNote.keyFeatures.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {selectedNote.keyFeatures.map((feat, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Features derived during project workflow generation.
                      </p>
                    )}
                  </div>

                  {/* Suggested Technologies */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-600" />
                      <span>Suggested Technologies</span>
                    </h4>
                    <div className="space-y-2 text-xs">
                      {selectedNote.suggestedTechnologies ? (
                        <>
                          {selectedNote.suggestedTechnologies.frontend &&
                            selectedNote.suggestedTechnologies.frontend.length > 0 && (
                              <div>
                                <span className="font-semibold text-slate-700">Frontend: </span>
                                <span className="text-slate-600">
                                  {selectedNote.suggestedTechnologies.frontend.join(', ')}
                                </span>
                              </div>
                            )}
                          {selectedNote.suggestedTechnologies.backend &&
                            selectedNote.suggestedTechnologies.backend.length > 0 && (
                              <div>
                                <span className="font-semibold text-slate-700">Backend: </span>
                                <span className="text-slate-600">
                                  {selectedNote.suggestedTechnologies.backend.join(', ')}
                                </span>
                              </div>
                            )}
                          {selectedNote.suggestedTechnologies.hardware &&
                            selectedNote.suggestedTechnologies.hardware.length > 0 && (
                              <div>
                                <span className="font-semibold text-slate-700">Hardware / IoT: </span>
                                <span className="text-slate-600">
                                  {selectedNote.suggestedTechnologies.hardware.join(', ')}
                                </span>
                              </div>
                            )}
                          {selectedNote.suggestedTechnologies.database &&
                            selectedNote.suggestedTechnologies.database.length > 0 && (
                              <div>
                                <span className="font-semibold text-slate-700">Database: </span>
                                <span className="text-slate-600">
                                  {selectedNote.suggestedTechnologies.database.join(', ')}
                                </span>
                              </div>
                            )}
                        </>
                      ) : (
                        <p className="text-slate-500 italic">
                          Hardware and software stacks configured via Idea Generator.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expected Impact */}
                {selectedNote.expectedImpact && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-900">Expected Engineering Impact: </span>
                    <span className="text-emerald-800">{selectedNote.expectedImpact}</span>
                  </div>
                )}

                {/* AI Interactive Assistant Strip */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-100">
                        Smart AI Spec Actions (Powered by Gemini)
                      </span>
                    </div>
                    {isLoadingAi && (
                      <span className="text-[11px] text-amber-300 animate-pulse font-mono">
                        Generating AI analysis...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={isLoadingAi}
                      onClick={() => onRunAiAction(selectedNote.id, 'explain')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                      <span>Explain in Simple Terms</span>
                    </button>

                    <button
                      disabled={isLoadingAi}
                      onClick={() => onRunAiAction(selectedNote.id, 'summarize')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Summarize for Viva</span>
                    </button>

                    <button
                      disabled={isLoadingAi}
                      onClick={() => onRunAiAction(selectedNote.id, 'questions')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Generate Viva Questions</span>
                    </button>

                    <button
                      disabled={isLoadingAi}
                      onClick={() => onRunAiAction(selectedNote.id, 'expand')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Code className="w-3.5 h-3.5 text-purple-400" />
                      <span>Expand Architecture</span>
                    </button>
                  </div>
                </div>

                {/* AI Insights Generated for this note */}
                {selectedNote.aiInsights && selectedNote.aiInsights.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      AI Generated Insights & Viva Prep
                    </h4>
                    <div className="space-y-3">
                      {selectedNote.aiInsights.map((insight, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono border-b border-slate-200/60 pb-1.5">
                            <span className="font-bold text-indigo-700 uppercase">
                              Action: {insight.type}
                            </span>
                            <span>{new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                            <ReactMarkdown>{insight.content}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Markdown Technical Documentation */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Detailed Specification Notes
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 prose prose-xs max-w-none text-slate-700 leading-relaxed">
                    <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                Select a project specification from the left to review details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
