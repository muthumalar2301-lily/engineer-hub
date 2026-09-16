import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  FileText,
  MessageSquare,
  Lightbulb,
  Check,
  Share2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ProblemAnalysis, SmartNote } from '../types';

interface ProblemSolverProps {
  currentAnalysis: ProblemAnalysis | null;
  onAnalysisComplete: (analysis: ProblemAnalysis) => void;
  onConvertToProject: (analysis: ProblemAnalysis) => void;
  onSaveToNotes: (note: Omit<SmartNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onShareToClassroom: (analysis: ProblemAnalysis) => void;
}

export const ProblemSolver: React.FC<ProblemSolverProps> = ({
  currentAnalysis,
  onAnalysisComplete,
  onConvertToProject,
  onSaveToNotes,
  onShareToClassroom,
}) => {
  const [problemText, setProblemText] = useState(currentAnalysis?.originalProblem || '');
  const [domain, setDomain] = useState('Energy Management & IoT');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const domains = [
    'Energy Management & IoT',
    'Cybersecurity & Network Defense',
    'Embedded Systems & Robotics',
    'CleanTech & Sustainable Energy',
    'Healthcare & Biomedical Devices',
    'Campus Infrastructure & Smart City',
    'AI & Distributed Software',
  ];

  const handleAnalyze = async () => {
    if (!problemText.trim()) {
      setErrorMessage('Please enter an engineering problem description.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSaveSuccess(false);
    setShareSuccess(false);

    try {
      const res = await fetch('/api/ai/solve-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: problemText.trim(),
          domain,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis request failed');
      }

      const data: ProblemAnalysis = await res.json();
      onAnalysisComplete(data);
    } catch (err: any) {
      console.error('Error analyzing problem:', err);
      setErrorMessage('Failed to analyze problem. Please retry or check network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsNote = () => {
    if (!currentAnalysis) return;

    const noteContent = `### Problem Analysis: ${currentAnalysis.originalProblem}

- **Category**: ${currentAnalysis.category}
- **Root Cause**: ${currentAnalysis.mainCause}
- **Impact**: ${currentAnalysis.impact}
- **Users Affected**: ${currentAnalysis.usersAffected}

#### Evaluated Solutions
${currentAnalysis.solutions
  .map(
    (s, i) =>
      `${i + 1}. **${s.name}**\n   - Description: ${s.description}\n   - Cost: ${s.cost} | Complexity: ${s.complexity} | Efficiency: ${s.efficiency}`
  )
  .join('\n')}

#### Recommended Solution
> **${currentAnalysis.recommendedSolution?.title}**
${currentAnalysis.recommendedSolution?.rationale}

#### Implementation Steps
${currentAnalysis.implementationPlan?.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}
`;

    onSaveToNotes({
      title: `Engineering Spec: ${currentAnalysis.recommendedSolution?.title || currentAnalysis.category}`,
      problemTitle: currentAnalysis.originalProblem,
      domain: currentAnalysis.domain || domain,
      subject: currentAnalysis.domain || domain,
      problemAnalysis: `Root Cause: ${currentAnalysis.mainCause}. Operational Impact: ${currentAnalysis.impact}. Affected Users: ${currentAnalysis.usersAffected}.`,
      projectIdeaTitle: currentAnalysis.recommendedSolution?.title || `${currentAnalysis.category} System`,
      projectDescription: currentAnalysis.recommendedSolution?.rationale || currentAnalysis.impact,
      keyFeatures: currentAnalysis.implementationPlan || [
        currentAnalysis.recommendedSolution?.title,
        'Root-cause mitigation architecture',
        'Performance optimization tracking',
      ],
      suggestedTechnologies: {
        frontend: ['React', 'Tailwind CSS', 'Telemetry Dashboard'],
        backend: ['Node.js', 'Express API Engine'],
        hardware:
          domain.includes('IoT') || domain.includes('Embedded') || domain.includes('Energy')
            ? ['ESP32', 'Smart Relay Module', 'Edge Sensors']
            : [],
        database: ['SQLite / TimescaleDB'],
        apisAndTools: ['REST APIs', 'Cloud Telemetry'],
      },
      expectedImpact: currentAnalysis.impact,
      tags: ['problem-solver', 'root-cause', currentAnalysis.category.toLowerCase().replace(/\s+/g, '-')],
      content: noteContent,
      isPinned: true,
      sourceType: 'problem_analysis',
      aiInsights: [
        {
          type: 'summarize',
          content: `Recommended Solution: ${currentAnalysis.recommendedSolution?.title}. Primary driver: ${currentAnalysis.mainCause}.`,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleShare = () => {
    if (!currentAnalysis) return;
    onShareToClassroom(currentAnalysis);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Problem Solver</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineer's Problem Solver AI
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Describe a real-world engineering challenge. The AI assesses root causes, benchmarks multi-tier solutions in an engineering matrix, identifies the optimal solution, and generates a concrete implementation blueprint.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Engineering Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Problem Statement</span>
              <span className="text-[11px] font-normal text-slate-400">
                Be specific about operational context
              </span>
            </label>
            <textarea
              rows={3}
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Enter your engineering problem or technical challenge..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Generates multi-solution tradeoffs + sequential implementation steps</span>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white transition flex items-center space-x-2 shadow-md ${
              isLoading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Engineering Dynamics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>🔍 Analyze Problem</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {currentAnalysis && (
        <div className="space-y-6">
          {/* Action Header Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Engineering Analysis Complete
                </h3>
                <p className="text-xs text-slate-400">
                  Ready to be converted into an engineering project note or shared with your classroom.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onConvertToProject(currentAnalysis)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>🚀 Convert to Engineering Project</span>
              </button>

              <button
                onClick={handleSaveAsNote}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 cursor-pointer ${
                  saveSuccess
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved to Notes!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>📝 Save as Smart Note</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 cursor-pointer ${
                  shareSuccess
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Shared to Class!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>💬 Share to Class</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 1: Problem Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Problem Analysis</span>
              </h2>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                {currentAnalysis.category}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Problem Category
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {currentAnalysis.category}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Main Technical Cause
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {currentAnalysis.mainCause}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Systemic Impact
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {currentAnalysis.impact}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Users Affected
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {currentAnalysis.usersAffected}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Possible Solutions & Comparison Matrix */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Possible Solutions & Engineering Comparison</span>
              </h2>
              <span className="text-xs text-slate-500">
                Tradeoff analysis across cost, complexity, and efficiency
              </span>
            </div>

            {/* Solutions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentAnalysis.solutions.map((sol, index) => (
                <div
                  key={sol.name}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 uppercase font-mono">
                      Solution {index + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sol.efficiency === 'Very High' || sol.efficiency === 'High'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sol.efficiency} Efficiency
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{sol.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{sol.description}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center font-mono text-[11px]">
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-400 block font-sans">Cost</span>
                      <span className="font-bold text-slate-800">{sol.cost}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-400 block font-sans">Complexity</span>
                      <span className="font-bold text-slate-800">{sol.complexity}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-400 block font-sans">Efficiency</span>
                      <span className="font-bold text-emerald-600">{sol.efficiency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Matrix Table */}
            <div className="overflow-x-auto pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Engineering Decision Matrix
              </h4>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Solution</th>
                    <th className="py-2.5 px-4">Cost</th>
                    <th className="py-2.5 px-4">Complexity</th>
                    <th className="py-2.5 px-4">Efficiency</th>
                    <th className="py-2.5 px-4">Engineering Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {currentAnalysis.solutions.map((sol) => (
                    <tr key={sol.name} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{sol.name}</td>
                      <td className="py-2.5 px-4 font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            sol.cost === 'Low'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sol.cost === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sol.cost}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            sol.complexity === 'Low'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sol.complexity === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {sol.complexity}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            sol.efficiency === 'Very High' || sol.efficiency === 'High'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {sol.efficiency}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                        {sol.pros?.[0] || 'Viable baseline'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Recommended Solution & Implementation Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recommended Solution Card */}
            <div className="lg:col-span-1 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-xl p-5 border border-emerald-500/40 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold mb-2">
                  <span>⭐ Recommended Solution</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {currentAnalysis.recommendedSolution?.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {currentAnalysis.recommendedSolution?.rationale}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => onConvertToProject(currentAnalysis)}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <span>Build This as Capstone Project ➔</span>
                </button>
              </div>
            </div>

            {/* Implementation Plan Roadmap */}
            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>🛠 Implementation Plan</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {currentAnalysis.implementationPlan?.length || 0} Milestone Steps
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                {currentAnalysis.implementationPlan?.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition"
                  >
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-800 font-medium leading-relaxed">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!currentAnalysis && !isLoading && (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No Problem Analyzed Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Enter an engineering problem or technical challenge above, select your engineering domain, and click Analyze Problem to generate a root-cause breakdown, multi-tier solution matrix, and implementation roadmap.
          </p>
        </div>
      )}
    </div>
  );
};
