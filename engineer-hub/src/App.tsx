import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WorkflowBanner } from './components/WorkflowBanner';
import { Dashboard } from './components/Dashboard';
import { ProblemSolver } from './components/ProblemSolver';
import { IdeaGenerator } from './components/IdeaGenerator';
import { SmartNotes } from './components/SmartNotes';
import { ClassroomView } from './components/ClassroomView';
import { SharedGroupChat } from './components/SharedGroupChat';
import { Login } from './components/Login';

import {
  ActiveModule,
  UserProfile,
  Classroom,
  ChatMessage,
  SmartNote,
  ProjectIdea,
  ProblemAnalysis,
} from './types';

import {
  INITIAL_CLASSROOMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_SMART_NOTES,
  INITIAL_PROJECT_IDEAS,
  DEFAULT_USER,
} from './data/initialData';

const formatServerMessage = (m: any): ChatMessage => ({
  id: m.id,
  classroomId: m.classroomId,
  senderId: m.senderId || m.userId || 'usr-anon',
  senderName: m.senderName || m.userName || (m.isAi ? 'Engineer AI' : 'Engineer'),
  senderRole: m.senderRole || (m.isAi ? 'ai' : 'user'),
  text: m.text || m.message || '',
  timestamp: m.timestamp,
  isAiPrompt: m.isAiPrompt || m.isAi || false,
  attachedItem:
    m.attachedItem ||
    (m.attachments && m.attachments[0]
      ? {
          type: m.attachments[0].type,
          id: m.attachments[0].id,
          title: m.attachments[0].title,
          summary: m.attachments[0].snippet,
        }
      : undefined),
});

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('engineer_hub_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse user from local storage:', e);
    }
    return null;
  });

  // Navigation Module
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

  // Classrooms & Active Selection (clean empty start)
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [activeClassroomId, setActiveClassroomId] = useState<string>('');

  // Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isLoadingAiChat, setIsLoadingAiChat] = useState(false);

  // Workflow-Generated Smart Notes
  const [notes, setNotes] = useState<SmartNote[]>(INITIAL_SMART_NOTES);
  const [isLoadingAiNote, setIsLoadingAiNote] = useState(false);

  // Projects
  const [savedProjects, setSavedProjects] = useState<ProjectIdea[]>(INITIAL_PROJECT_IDEAS);

  // Active Problem Analysis
  const [currentAnalysis, setCurrentAnalysis] = useState<ProblemAnalysis | null>(null);

  // Fetch initial classrooms from server
  useEffect(() => {
    fetch('/api/classrooms')
      .then((res) => res.json())
      .then((data) => {
        if (data.classrooms && Array.isArray(data.classrooms)) {
          setClassrooms(data.classrooms);
          if (data.classrooms.length > 0 && !activeClassroomId) {
            setActiveClassroomId(data.classrooms[0].id);
          }
        }
      })
      .catch((err) => console.log('Using initial fallback classrooms:', err));
  }, []);

  // Fetch classroom messages when active classroom changes
  useEffect(() => {
    if (!activeClassroomId) return;
    fetch(`/api/classrooms/${activeClassroomId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          const formatted = data.messages.map(formatServerMessage);
          setChatMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = formatted.filter((m: ChatMessage) => !existingIds.has(m.id));
            return [...prev, ...newMsgs];
          });
        }
      })
      .catch((err) => console.log('Using initial fallback chat messages:', err));
  }, [activeClassroomId]);

  const activeClassroom =
    classrooms.find((c) => c.id === activeClassroomId) || classrooms[0] || null;

  // Login handler
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveModule('dashboard');
  };

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('engineer_hub_user');
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
    setCurrentUser(null);
    setActiveModule('dashboard');
  };

  // Convert Problem Analysis into a Project Idea
  const handleConvertToProject = (analysis: ProblemAnalysis) => {
    setCurrentAnalysis(analysis);
    setActiveModule('ideator');
  };

  // Save Workflow Spec to Smart Notes
  const handleAddNote = (newNote: Omit<SmartNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const note: SmartNote = {
      ...newNote,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setNotes((prev) => [note, ...prev]);
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Run AI actions on Smart Note
  const handleRunAiAction = async (
    noteId: string,
    action: 'explain' | 'summarize' | 'questions' | 'expand'
  ) => {
    const targetNote = notes.find((n) => n.id === noteId);
    if (!targetNote) return;

    setIsLoadingAiNote(true);
    try {
      const res = await fetch('/api/ai/smart-notes/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteContent: targetNote.content,
          action,
          subject: targetNote.domain || targetNote.subject || 'Engineering',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setNotes((prev) =>
            prev.map((n) =>
              n.id === noteId
                ? {
                    ...n,
                    aiInsights: [
                      ...(n.aiInsights || []),
                      {
                        type: action,
                        content: data.result,
                        timestamp: new Date().toISOString(),
                      },
                    ],
                  }
                : n
            )
          );
        }
      }
    } catch (err) {
      console.error('Smart note AI error:', err);
    } finally {
      setIsLoadingAiNote(false);
    }
  };

  // Save Project Idea
  const handleSaveProject = (project: ProjectIdea) => {
    setSavedProjects((prev) => {
      const exists = prev.find((p) => p.id === project.id);
      if (exists) {
        return prev.map((p) => (p.id === project.id ? project : p));
      }
      return [project, ...prev];
    });
  };

  // Share to Classroom
  const handleShareToClassroom = async (
    item: ProblemAnalysis | ProjectIdea | SmartNote,
    type: 'problem' | 'project' | 'note' = 'problem'
  ) => {
    if (!currentUser) return;
    let title = '';
    let summary = '';

    if ('category' in item && 'solutions' in item) {
      type = 'problem';
      title = item.originalProblem;
      summary = `Root Cause: ${item.mainCause}. Best Solution: ${item.recommendedSolution?.title}`;
    } else if ('tagline' in item && 'techStack' in item) {
      type = 'project';
      title = item.title;
      summary = `${item.tagline} • Domain: ${item.domain} • Difficulty: ${item.difficulty}`;
    } else if ('content' in item) {
      type = 'note';
      title = item.title;
      summary = `Spec: ${item.domain || item.subject} • ${item.content.slice(0, 90)}...`;
    }

    const shareText = `Shared engineering ${type}: **${title}**\n\n*${summary}*\n\nLet's collaborate on the design and implementation!`;

    await handleSendMessage(shareText, false, {
      type,
      id: 'id' in item ? item.id : 'gen-analysis',
      title,
      summary,
    });

    setActiveModule('chat');
  };

  // Send Message in Shared Group Chat
  const handleSendMessage = async (
    text: string,
    isAskingAi: boolean,
    attachedItem?: ChatMessage['attachedItem']
  ) => {
    if (!currentUser) return;
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classroomId: activeClassroomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiPrompt: isAskingAi,
      attachedItem,
    };

    setChatMessages((prev) => [...prev, userMessage]);

    if (isAskingAi) {
      setIsLoadingAiChat(true);
    }

    try {
      const res = await fetch(`/api/classrooms/${activeClassroomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          message: text,
          triggerAi: isAskingAi,
          attachments: attachedItem
            ? [
                {
                  type: attachedItem.type,
                  id: attachedItem.id,
                  title: attachedItem.title,
                  snippet: attachedItem.summary,
                },
              ]
            : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.aiMessage) {
          const formattedAi = formatServerMessage(data.aiMessage);
          setChatMessages((prev) => [...prev, formattedAi]);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoadingAiChat(false);
    }
  };

  // Join Classroom by Code
  const handleJoinByCode = (code: string) => {
    const target = classrooms.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (target) {
      setActiveClassroomId(target.id);
      return true;
    }
    return false;
  };

  // Create Classroom
  const handleCreateClassroom = async (newClass: {
    name: string;
    code: string;
    department: string;
    description: string;
  }) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClass.name,
          code: newClass.code,
          department: newClass.department,
          teacherName: currentUser.name,
          description: newClass.description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.classroom) {
          setClassrooms((prev) => [data.classroom, ...prev]);
          setActiveClassroomId(data.classroom.id);
          return;
        }
      }
    } catch (err) {
      console.error('Create class error:', err);
    }

    // Fallback local creation
    const created: Classroom = {
      id: `cls-${Date.now()}`,
      name: newClass.name,
      code: newClass.code,
      department: newClass.department,
      description: newClass.description,
      teacherName: currentUser.name,
      membersCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      announcements: [
        {
          id: `ann-${Date.now()}`,
          title: 'Classroom Initialized',
          content: `Welcome to ${newClass.name}. Share your engineering notes, analyze problems, and collaborate with your team!`,
          authorName: currentUser.name,
          timestamp: new Date().toISOString().split('T')[0],
          tag: 'Notice',
        },
      ],
      resources: [],
    };

    setClassrooms((prev) => [created, ...prev]);
    setActiveClassroomId(created.id);
  };

  // Add Announcement
  const handleAddAnnouncement = async (
    classroomId: string,
    title: string,
    content: string,
    tag: string
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          authorName: currentUser.name,
          tag,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.announcement) {
          setClassrooms((prev) =>
            prev.map((cls) =>
              cls.id === classroomId
                ? { ...cls, announcements: [data.announcement, ...cls.announcements] }
                : cls
            )
          );
          return;
        }
      }
    } catch (err) {
      console.log('Announcement server fallback:', err);
    }

    const newAnn = {
      id: `ann-${Date.now()}`,
      title,
      content,
      authorName: currentUser.name,
      timestamp: 'Just now',
      tag,
    };

    setClassrooms((prev) =>
      prev.map((cls) =>
        cls.id === classroomId
          ? { ...cls, announcements: [newAnn, ...cls.announcements] }
          : cls
      )
    );
  };

  // If not authenticated, render Login screen
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation - Fixed layout with visible ENGINEER HUB title & single-user profile */}
      <Navbar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeClassroomName={activeClassroom?.name}
      />

      {/* Interactive Workflow Progress Tracker */}
      <WorkflowBanner
        currentModule={activeModule}
        onSelectModule={setActiveModule}
        hasSolvedProblem={Boolean(currentAnalysis)}
        hasGeneratedProject={savedProjects.length > 0}
        notesCount={notes.length}
      />

      {/* Main Content Render */}
      <main className="flex-1">
        {activeModule === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            onNavigate={setActiveModule}
            savedProjects={savedProjects}
            notes={notes}
            classroomsCount={classrooms.length}
          />
        )}

        {activeModule === 'solver' && (
          <ProblemSolver
            currentAnalysis={currentAnalysis}
            onAnalysisComplete={setCurrentAnalysis}
            onConvertToProject={handleConvertToProject}
            onSaveToNotes={handleAddNote}
            onShareToClassroom={(analysis) => handleShareToClassroom(analysis, 'problem')}
          />
        )}

        {activeModule === 'ideator' && (
          <IdeaGenerator
            initialAnalysisForProject={currentAnalysis}
            savedProjects={savedProjects}
            onSaveProject={handleSaveProject}
            onSaveToNotes={handleAddNote}
            onShareToClassroom={(project) => handleShareToClassroom(project, 'project')}
          />
        )}

        {activeModule === 'notes' && (
          <SmartNotes
            notes={notes}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onRunAiAction={handleRunAiAction}
            onNavigateToModule={setActiveModule}
            isLoadingAi={isLoadingAiNote}
          />
        )}

        {activeModule === 'classroom' && (
          <ClassroomView
            classrooms={classrooms}
            activeClassroomId={activeClassroomId}
            onSelectClassroom={setActiveClassroomId}
            onJoinByCode={handleJoinByCode}
            onCreateClassroom={handleCreateClassroom}
            onAddAnnouncement={handleAddAnnouncement}
            onNavigateToChat={() => setActiveModule('chat')}
            currentUser={currentUser}
          />
        )}

        {activeModule === 'chat' && (
          <SharedGroupChat
            classroom={activeClassroom}
            messages={chatMessages.filter((m) => m.classroomId === activeClassroomId)}
            onSendMessage={handleSendMessage}
            currentUser={currentUser}
            isLoadingAi={isLoadingAiChat}
          />
        )}
      </main>

      {/* Engineering Hub Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-200">ENGINEER HUB</span>
            <span>—</span>
            <span>Unified Engineering Problem Solving & Collaborative Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-500 font-mono text-[11px]">
            <span>Workflow: Problem ➔ AI ➔ Project ➔ Notes ➔ Classroom</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Gemini 3.8 Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
