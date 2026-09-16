import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Share2,
  Check,
  Cpu,
  Layers,
  Clock,
  Award,
  AlertCircle,
  RefreshCw,
  Code2,
  ShieldAlert,
} from 'lucide-react';
import { ProjectIdea, ProblemAnalysis, SmartNote } from '../types';

interface IdeaGeneratorProps {
  initialAnalysisForProject: ProblemAnalysis | null;
  savedProjects: ProjectIdea[];
  onSaveProject: (project: ProjectIdea) => void;
  onSaveToNotes: (note: Omit<SmartNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onShareToClassroom: (project: ProjectIdea) => void;
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({
  initialAnalysisForProject,
  savedProjects,
  onSaveProject,
  onSaveToNotes,
  onShareToClassroom,
}) => {
  const [domain, setDomain] = useState('Computer Science & Engineering');
  const [problem, setProblem] = useState('');
  const [constraints, setConstraints] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectIdea | null>(
    savedProjects.length > 0 ? savedProjects[0] : null
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If redirected from Problem Solver with an analysis, auto populate or trigger conversion
  useEffect(() => {
    if (initialAnalysisForProject) {
      setDomain(initialAnalysisForProject.domain || initialAnalysisForProject.category);
      setProblem(initialAnalysisForProject.originalProblem);
      setConstraints(
        `Focus on: ${initialAnalysisForProject.recommendedSolution?.title || 'Optimal Solution'}, Scalable architecture`
      );
      // Automatically convert if not already done
      convertAnalysisToProject(initialAnalysisForProject);
    }
  }, [initialAnalysisForProject]);

  const convertAnalysisToProject = async (analysis: ProblemAnalysis) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/problem-to-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis }),
      });

      if (!res.ok) throw new Error('Problem conversion failed');
      const data: ProjectIdea = await res.json();
      setActiveProject(data);
      onSaveProject(data);
    } catch (err) {
      console.error('Failed to convert problem to project:', err);
      setErrorMessage('Failed to generate project from analysis. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!problem.trim()) {
      setErrorMessage('Please provide a target problem or opportunity.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/ai/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          problem: problem.trim(),
          constraints: constraints.trim(),
          difficulty,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');
      const data: ProjectIdea = await res.json();
      setActiveProject(data);
      onSaveProject(data);
    } catch (err) {
      console.error('Error generating project idea:', err);
      setErrorMessage('Failed to generate project idea. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToNote = () => {
    if (!activeProject) return;

    const noteContent = `### Project Specification: ${activeProject.title}

> *${activeProject.tagline}*

- **Domain**: ${activeProject.domain}
- **Difficulty**: ${activeProject.difficulty}
- **Timeline**: ${activeProject.estimatedTimeline}

#### 1. Problem Statement
${activeProject.problemStatement}

#### 2. Engineering Innovation
${activeProject.innovation}

#### 3. Technology Stack
- **Frontend**: ${activeProject.techStack?.frontend?.join(', ') || 'N/A'}
- **Backend**: ${activeProject.techStack?.backend?.join(', ') || 'N/A'}
- **Hardware/Sensors**: ${activeProject.techStack?.hardware?.join(', ') || 'N/A'}
- **Database**: ${activeProject.techStack?.database?.join(', ') || 'N/A'}
- **APIs & Tools**: ${activeProject.techStack?.apisAndTools?.join(', ') || 'N/A'}

#### 4. Key Architectural Features
${activeProject.keyFeatures?.map((f) => `- ${f}`).join('\n')}

#### 5. Future Scope & Hackathon Value
${activeProject.futureScope}
`;

    onSaveToNotes({
      title: activeProject.title,
      problemTitle: activeProject.problemStatement,
      domain: activeProject.domain,
      subject: activeProject.domain,
      problemAnalysis: activeProject.problemStatement,
      projectIdeaTitle: activeProject.title,
      projectDescription: `${activeProject.tagline} — ${activeProject.innovation}`,
      keyFeatures: activeProject.keyFeatures || [],
      suggestedTechnologies: {
        frontend: activeProject.techStack?.frontend || [],
        backend: activeProject.techStack?.backend || [],
        hardware: activeProject.techStack?.hardware || [],
        database: activeProject.techStack?.database || [],
        apisAndTools: activeProject.techStack?.apisAndTools || [],
      },
      expectedImpact: activeProject.futureScope || 'High practical capstone & hackathon viability.',
      tags: ['project-idea', activeProject.domain.toLowerCase().replace(/\s+/g, '-'), 'capstone'],
      content: noteContent,
      isPinned: true,
      sourceType: 'project_idea',
      associatedProjectId: activeProject.id,
      aiInsights: [
        {
          type: 'summarize',
          content: `Project Blueprint for "${activeProject.title}". Innovation core: ${activeProject.innovation}`,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 3000);
  };

  const handleShare = () => {
    if (!activeProject) return;
    onShareToClassroom(activeProject);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-1">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Module 2 — Engineering Project Synthesizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineering Idea Generator
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Translate any problem statement into a comprehensive engineering project blueprint with defined architecture, categorized technology stack, milestone timeline, and innovation scope.
          </p>
        </div>

        {initialAnalysisForProject && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Carrying Context from Problem Solver</span>
          </div>
        )}
      </div>

      {/* Generator Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Engineering Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. Cybersecurity, IoT, Renewable Energy"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Project Constraints
            </label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. Software only, Beginner friendly, Under $50"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Complexity Level
            </label>
            <div className="flex items-center space-x-1">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`flex-1 py-2 text-xs rounded-lg font-bold transition ${
                    difficulty === lvl
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Problem Statement / Core Need
            </label>
            <textarea
              rows={2}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Enter your target engineering problem or challenge to generate a complete project architecture..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Generates complete technology stack, features, timeline, and hackathon readiness
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white transition flex items-center space-x-2 shadow-md ${
              isLoading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Project Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>💡 Generate Project Idea</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Project Display */}
      {activeProject && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                ★
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Project Blueprint Generated
                </h3>
                <p className="text-xs text-slate-400">
                  Save to Smart Notes or share with your digital classroom for team collaboration.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveToNote}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
                  noteSuccess
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {noteSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved to Notes!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>📝 Save as Project Note</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
                  shareSuccess
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Shared to Classroom!</span>
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

          {/* Project Header Banner */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono">
                  {activeProject.domain}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  Difficulty: {activeProject.difficulty}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated Dev: {activeProject.estimatedTimeline}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {activeProject.title}
              </h2>
              <p className="text-slate-600 text-sm mt-1 font-medium">
                {activeProject.tagline}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block mb-1">
                  Problem Statement
                </span>
                <p className="text-slate-800 leading-relaxed">
                  {activeProject.problemStatement}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <span className="font-bold text-indigo-900 uppercase tracking-wide text-[10px] block mb-1">
                  Engineering Innovation
                </span>
                <p className="text-indigo-950 font-medium leading-relaxed">
                  {activeProject.innovation}
                </p>
              </div>
            </div>
          </div>

          {/* Technology Stack Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>Recommended Engineering Technology Stack</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Ready for Dev</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Frontend */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Frontend
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.techStack?.frontend?.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-medium"
                    >
                      {tech}
                    </span>
                  )) || <span className="text-slate-400 text-xs">N/A</span>}
                </div>
              </div>

              {/* Backend */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Backend & Logic
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.techStack?.backend?.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-medium"
                    >
                      {tech}
                    </span>
                  )) || <span className="text-slate-400 text-xs">N/A</span>}
                </div>
              </div>

              {/* Hardware */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Hardware / Edge
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.techStack?.hardware && activeProject.techStack.hardware.length > 0 ? (
                    activeProject.techStack.hardware.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-medium"
                      >
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs font-mono">Software-Only</span>
                  )}
                </div>
              </div>

              {/* Database */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Database & Storage
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.techStack?.database?.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-medium"
                    >
                      {tech}
                    </span>
                  )) || <span className="text-slate-400 text-xs">N/A</span>}
                </div>
              </div>

              {/* APIs & Security */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  APIs & Frameworks
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.techStack?.apisAndTools?.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono text-[11px] font-medium"
                    >
                      {tech}
                    </span>
                  )) || <span className="text-slate-400 text-xs">N/A</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Features and Future Scope */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Key Architectural & Functional Features</span>
              </h3>
              <div className="space-y-2 pt-2">
                {activeProject.keyFeatures?.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[11px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 font-medium leading-relaxed">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-900 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold mb-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>Future Scope & Hackathon Value</span>
                </div>
                <h4 className="font-bold text-white text-sm">Industrial & Competition Scope</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {activeProject.futureScope}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                Ideal for Smart India Hackathon (SIH), IEEE student project paper submissions, and capstone evaluations.
              </div>
            </div>
          </div>
        </div>
      )}

      {!activeProject && !isLoading && (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No Project Blueprint Generated Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Enter an engineering problem above or carry over an analysis from the Problem Solver to generate a full technical architecture, technology stack, implementation roadmap, and viva questions.
          </p>
        </div>
      )}
    </div>
  );
};
