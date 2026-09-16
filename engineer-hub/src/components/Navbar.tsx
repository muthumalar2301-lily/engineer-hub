import React from 'react';
import {
  Cpu,
  BrainCircuit,
  Lightbulb,
  FileText,
  School,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';
import { ActiveModule, UserProfile } from '../types';

interface NavbarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  currentUser: UserProfile;
  onLogout?: () => void;
  activeClassroomName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onSelectModule,
  currentUser,
  onLogout,
  activeClassroomName,
}) => {
  const navItems: { id: ActiveModule; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'solver', label: 'Problem Solver', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'ideator', label: 'Idea Generator', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'notes', label: 'Smart Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'classroom', label: 'Classroom', icon: <School className="w-4 h-4" /> },
    { id: 'chat', label: 'AI Group Chat', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.25rem] py-2 gap-3 sm:gap-6">
          {/* Logo and Brand - Always fully visible, never clipped or overlapping */}
          <div
            className="shrink-0 flex items-center space-x-3 cursor-pointer select-none group"
            onClick={() => onSelectModule('dashboard')}
            title="Engineer Hub"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="font-black text-lg sm:text-xl tracking-tight text-white whitespace-nowrap">
                ENGINEER HUB
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-normal whitespace-nowrap hidden sm:inline">
                Engineering Innovation Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 shrink-0">
            {navItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 shadow-xs border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Active Classroom Pill & User Profile with Neutral Icon */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {activeClassroomName && (
              <button
                onClick={() => onSelectModule('classroom')}
                className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-slate-300 cursor-pointer hover:border-slate-600 transition"
                title="Active Classroom"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="max-w-[130px] truncate font-medium">{activeClassroomName}</span>
              </button>
            )}

            {/* Profile Card with Neutral User Icon */}
            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-emerald-400 font-bold shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold leading-none text-slate-100 max-w-[120px] truncate">
                  {currentUser.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-none max-w-[120px] truncate font-mono">
                  {currentUser.email || ''}
                </div>
              </div>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign out of Engineer Hub"
                  className="ml-1 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Bar */}
        <div className="flex lg:hidden items-center py-2 border-t border-slate-800 overflow-x-auto space-x-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-[11px] font-medium whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
