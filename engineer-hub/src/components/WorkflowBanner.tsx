import React from 'react';
import {
  BrainCircuit,
  Lightbulb,
  FileText,
  School,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ActiveModule } from '../types';

interface WorkflowBannerProps {
  currentModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  hasSolvedProblem: boolean;
  hasGeneratedProject: boolean;
  notesCount: number;
}

export const WorkflowBanner: React.FC<WorkflowBannerProps> = ({
  currentModule,
  onSelectModule,
  hasSolvedProblem,
  hasGeneratedProject,
  notesCount,
}) => {
  const steps = [
    {
      id: 'solver' as ActiveModule,
      title: '1. Problem Solver',
      desc: 'Analyze real-world problem',
      icon: <BrainCircuit className="w-3.5 h-3.5" />,
      completed: hasSolvedProblem,
    },
    {
      id: 'ideator' as ActiveModule,
      title: '2. Idea Generator',
      desc: 'Convert solution to project',
      icon: <Lightbulb className="w-3.5 h-3.5" />,
      completed: hasGeneratedProject,
    },
    {
      id: 'notes' as ActiveModule,
      title: '3. Smart Notes',
      desc: 'Save specs & AI insights',
      icon: <FileText className="w-3.5 h-3.5" />,
      completed: notesCount > 2,
    },
    {
      id: 'classroom' as ActiveModule,
      title: '4. Classroom',
      desc: 'Digital class workspace',
      icon: <School className="w-3.5 h-3.5" />,
      completed: true,
    },
    {
      id: 'chat' as ActiveModule,
      title: '5. Shared AI Chat',
      desc: 'Peer & AI group discussion',
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      completed: true,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/80 px-4 py-3 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-400">
            <Sparkles className="w-3 h-3" />
          </span>
          <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
            The Engineer's Workflow:
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 font-mono">
            Problem ➔ AI Analysis ➔ Project Idea ➔ Smart Notes ➔ Team Discussion
          </span>
        </div>

        {/* Steps Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
          {steps.map((step, idx) => {
            const isActive = currentModule === step.id;
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => onSelectModule(step.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                    {step.icon}
                  </span>
                  <span>{step.title}</span>
                  {step.completed && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}
                </button>
                {idx < steps.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-500 shrink-0 hidden lg:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
