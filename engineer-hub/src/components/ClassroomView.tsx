import React, { useState } from 'react';
import {
  School,
  Users,
  Copy,
  Check,
  Megaphone,
  BookOpen,
  MessageSquare,
  Plus,
  LogIn,
  User,
} from 'lucide-react';
import { Classroom, UserProfile } from '../types';

interface ClassroomViewProps {
  classrooms: Classroom[];
  activeClassroomId: string;
  onSelectClassroom: (id: string) => void;
  onJoinByCode: (code: string) => boolean;
  onCreateClassroom: (classroom: {
    name: string;
    code: string;
    department: string;
    description: string;
  }) => void;
  onAddAnnouncement: (classroomId: string, title: string, content: string, tag: string) => void;
  onNavigateToChat: () => void;
  currentUser: UserProfile;
}

export const ClassroomView: React.FC<ClassroomViewProps> = ({
  classrooms,
  activeClassroomId,
  onSelectClassroom,
  onJoinByCode,
  onCreateClassroom,
  onAddAnnouncement,
  onNavigateToChat,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'announcements' | 'resources' | 'members'>(
    'announcements'
  );
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [isJoiningClass, setIsJoiningClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newDepartment, setNewDepartment] = useState('Computer Science & Engineering');
  const [newDescription, setNewDescription] = useState('');

  // Announcement posting
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnTag, setNewAnnTag] = useState('Discussion');
  const [isPostingAnn, setIsPostingAnn] = useState(false);

  const currentClassroom =
    classrooms.find((c) => c.id === activeClassroomId) || classrooms[0];

  const handleCopyCode = () => {
    if (!currentClassroom) return;
    navigator.clipboard.writeText(currentClassroom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    const ok = onJoinByCode(joinCodeInput.trim().toUpperCase());
    if (ok) {
      setJoinSuccess(true);
      setJoinError('');
      setJoinCodeInput('');
      setIsJoiningClass(false);
      setTimeout(() => setJoinSuccess(false), 3000);
    } else {
      setJoinError('Classroom with this code was not found.');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassCode.trim()) return;

    onCreateClassroom({
      name: newClassName.trim(),
      code: newClassCode.trim().toUpperCase(),
      department: newDepartment.trim() || 'General Engineering',
      description: newDescription.trim() || 'Engineering collaboration space',
    });

    setNewClassName('');
    setNewClassCode('');
    setNewDescription('');
    setIsCreatingClass(false);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim() || !currentClassroom) return;

    onAddAnnouncement(currentClassroom.id, newAnnTitle.trim(), newAnnContent.trim(), newAnnTag);
    setNewAnnTitle('');
    setNewAnnContent('');
    setIsPostingAnn(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-1">
            <School className="w-3.5 h-3.5" />
            <span>Classroom Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Classroom & Academic Hub
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Collaborate on engineering projects, share announcements, and access shared AI assistance.
          </p>
        </div>

        {/* Global Actions: Join & Create */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsJoiningClass(true);
              setJoinError('');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer border border-slate-300"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Join Classroom</span>
          </button>

          <button
            onClick={() => setIsCreatingClass(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Classroom</span>
          </button>
        </div>
      </div>

      {joinSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Successfully joined classroom!</span>
        </div>
      )}

      {/* When no classrooms exist, show clean empty state */}
      {classrooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <School className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No classrooms yet</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Create or join a classroom to start collaborating.
          </p>
          <div className="pt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsCreatingClass(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Classroom</span>
            </button>
            <button
              onClick={() => {
                setIsJoiningClass(true);
                setJoinError('');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition cursor-pointer flex items-center space-x-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Join Classroom</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Classroom Selection Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Your Classes:
            </span>
            {classrooms.map((cls) => {
              const isSelected = cls.id === currentClassroom?.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => onSelectClassroom(cls.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap border cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <School className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  <span>{cls.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cls.code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Classroom Card */}
          {currentClassroom && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                      {currentClassroom.department}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center space-x-1.5 transition cursor-pointer"
                      title="Click to copy class code"
                    >
                      <span>Code: {currentClassroom.code}</span>
                      {copiedCode ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {currentClassroom.name}
                  </h2>

                  <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                    {currentClassroom.description}
                  </p>

                  <div className="flex items-center space-x-4 pt-2 text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>{currentClassroom.membersCount || 1} Member</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={onNavigateToChat}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open AI Group Chat ➔</span>
                  </button>
                </div>
              </div>

              {/* Classroom Tabs */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                  <div className="flex space-x-6">
                    <button
                      onClick={() => setActiveTab('announcements')}
                      className={`text-xs font-bold transition flex items-center space-x-1.5 border-b-2 -mb-3 pb-3 cursor-pointer ${
                        activeTab === 'announcements'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>Announcements ({currentClassroom.announcements?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('resources')}
                      className={`text-xs font-bold transition flex items-center space-x-1.5 border-b-2 -mb-3 pb-3 cursor-pointer ${
                        activeTab === 'resources'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Resources ({currentClassroom.resources?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('members')}
                      className={`text-xs font-bold transition flex items-center space-x-1.5 border-b-2 -mb-3 pb-3 cursor-pointer ${
                        activeTab === 'members'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Members</span>
                    </button>
                  </div>

                  {activeTab === 'announcements' && (
                    <button
                      onClick={() => setIsPostingAnn(true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post Announcement</span>
                    </button>
                  )}
                </div>

                {/* Tab: Announcements */}
                {activeTab === 'announcements' && (
                  <div className="space-y-4">
                    {isPostingAnn && (
                      <form onSubmit={handlePostAnnouncement} className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                        <h4 className="text-xs font-bold text-blue-950 uppercase">New Announcement</h4>
                        <input
                          type="text"
                          required
                          value={newAnnTitle}
                          onChange={(e) => setNewAnnTitle(e.target.value)}
                          placeholder="Announcement title"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                        />
                        <textarea
                          rows={2}
                          required
                          value={newAnnContent}
                          onChange={(e) => setNewAnnContent(e.target.value)}
                          placeholder="Details or updates for the team..."
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                        />
                        <div className="flex items-center justify-between">
                          <select
                            value={newAnnTag}
                            onChange={(e) => setNewAnnTag(e.target.value)}
                            className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="Discussion">Discussion</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Milestone">Milestone</option>
                            <option value="Resource">Resource</option>
                          </select>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setIsPostingAnn(false)}
                              className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {(!currentClassroom.announcements || currentClassroom.announcements.length === 0) ? (
                      <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                        No announcements posted yet. Click "Post Announcement" to share updates.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentClassroom.announcements.map((ann) => (
                          <div key={ann.id} className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                  {ann.tag}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 mt-1">{ann.title}</h4>
                              </div>
                              <span className="text-[11px] text-slate-400">{ann.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>
                            <div className="text-[10px] text-slate-400 pt-1">
                              Posted by {ann.authorName}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Resources */}
                {activeTab === 'resources' && (
                  <div>
                    {(!currentClassroom.resources || currentClassroom.resources.length === 0) ? (
                      <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                        No resources uploaded yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentClassroom.resources.map((res) => (
                          <div key={res.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{res.title}</h4>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {res.category} • {res.size}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Members */}
                {activeTab === 'members' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {currentUser.name || 'Current User'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {currentUser.email || 'You'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Join Classroom Modal */}
      {isJoiningClass && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Join Classroom</h3>
            <p className="text-xs text-slate-600">
              Enter the unique classroom code provided by your team lead or peer.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-3">
              {joinError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {joinError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Class Code
                </label>
                <input
                  type="text"
                  required
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="e.g. ENG2026"
                  className="w-full text-xs uppercase p-2.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoiningClass(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Classroom Modal */}
      {isCreatingClass && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create New Classroom</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Classroom Name
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Autonomous Robotics Lab"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Class Code (for team members to join)
                </label>
                <input
                  type="text"
                  required
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                  placeholder="e.g. ROBO26"
                  className="w-full text-xs uppercase p-2.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Department / Specialization
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="e.g. Electrical & Electronics Engineering"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Goals and capstone focus of this classroom..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingClass(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
