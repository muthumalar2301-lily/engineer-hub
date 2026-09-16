import React from 'react';
import {
  BrainCircuit,
  Lightbulb,
  FileText,
  School,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Layers,
  FolderGit2,
} from 'lucide-react';
import { ActiveModule, ProjectIdea, SmartNote, UserProfile } from '../types';

interface DashboardProps {
  currentUser: UserProfile;
  onNavigate: (module: ActiveModule) => void;
  savedProjects: ProjectIdea[];
  notes: SmartNote[];
  classroomsCount: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  onNavigate,
  savedProjects,
  notes,
  classroomsCount,
}) => {
  const modules: {
    id: ActiveModule;
    title: string;
    emoji: string;
    icon: React.ReactNode;
    description: string;
    actionText: string;
    borderColor: string;
    iconBg: string;
  }[] = [
    {
      id: 'solver',
      title: 'Problem Solver',
      emoji: '🧠',
      icon: <BrainCircuit className="w-5 h-5 text-emerald-600" />,
      description:
        'Input any engineering challenge to receive root-cause analysis, comparative technical solutions, and a sequential implementation roadmap.',
      actionText: 'Open Problem Solver',
      borderColor: 'hover:border-emerald-500',
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    },
    {
      id: 'ideator',
      title: 'Idea Generator',
      emoji: '💡',
      icon: <Lightbulb className="w-5 h-5 text-indigo-600" />,
      description:
        'Convert analyzed problems into structured project architectures with full tech stack, timeline, difficulty rating, and hackathon scope.',
      actionText: 'Open Idea Generator',
      borderColor: 'hover:border-indigo-500',
      iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    },
    {
      id: 'notes',
      title: 'Smart Notes',
      emoji: '📝',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      description:
        'Structured engineering specifications generated from your project workflow. Review specs, viva questions, summaries, and expansions.',
      actionText: 'Open Smart Notes',
      borderColor: 'hover:border-amber-500',
      iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
    },
    {
      id: 'classroom',
      title: 'Classroom',
      emoji: '🏫',
      icon: <School className="w-5 h-5 text-blue-600" />,
      description:
        'Collaborate in digital classrooms. Create or join classrooms, share project updates, access study resources, and coordinate with peers.',
      actionText: 'Open Classroom',
      borderColor: 'hover:border-blue-500',
      iconBg: 'bg-blue-50 border-blue-200 text-blue-600',
    },
    {
      id: 'chat',
      title: 'AI Group Chat',
      emoji: '💬',
      icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
      description:
        'Interactive engineering assistant. Ask questions about your engineering problems, projects, technologies, and system architecture.',
      actionText: 'Open AI Group Chat',
      borderColor: 'hover:border-purple-500',
      iconBg: 'bg-purple-50 border-purple-200 text-purple-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          ENGINEER HUB
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Turn engineering problems into innovative project ideas and collaborate with your team.
        </p>

        {/* Real User Metric Counters */}
        <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-800 text-sm">{savedProjects.length}</span>
            <span>Saved Projects</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-800 text-sm">{notes.length}</span>
            <span>Smart Notes</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-800 text-sm">{classroomsCount}</span>
            <span>Classrooms</span>
          </div>
        </div>

        {/* Small Visual Workflow Section */}
        <div className="pt-3">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono shadow-sm">
            <span className="text-emerald-400 font-bold">Problem</span>
            <span className="text-slate-500">➔</span>
            <span className="text-emerald-300 font-bold">AI Analysis</span>
            <span className="text-slate-500">➔</span>
            <span className="text-indigo-300 font-bold">Project Idea</span>
            <span className="text-slate-500">➔</span>
            <span className="text-amber-300 font-bold">Smart Notes</span>
            <span className="text-slate-500">➔</span>
            <span className="text-blue-300 font-bold">Classroom</span>
          </div>
        </div>
      </div>

      {/* Main 5 Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Core Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className={`group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between ${mod.borderColor}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${mod.iconBg}`}>
                    {mod.icon}
                  </div>
                  <span className="text-lg">{mod.emoji}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition flex items-center space-x-1.5">
                    <span>{mod.title}</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-emerald-700 transition">
                <span>{mod.actionText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <FolderGit2 className="w-4 h-4 text-emerald-600" />
            <span>Recent Projects</span>
          </h2>
          {savedProjects.length > 0 && (
            <button
              onClick={() => onNavigate('ideator')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              View Idea Generator ➔
            </button>
          )}
        </div>

        {savedProjects.length === 0 ? (
          <div className="py-10 text-center space-y-3 border border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500">
              No projects yet. Start by analyzing an engineering problem.
            </p>
            <button
              onClick={() => onNavigate('solver')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer inline-flex items-center space-x-1.5"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Open Problem Solver</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2 bg-slate-50/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900">{project.title}</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                    {project.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{project.tagline}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
                  <span>{project.domain}</span>
                  <button
                    onClick={() => onNavigate('ideator')}
                    className="text-emerald-600 hover:text-emerald-700 font-sans font-semibold cursor-pointer"
                  >
                    Details ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
