import {
  SmartNote,
  ProblemAnalysis,
  ProjectIdea,
  Classroom,
  ChatMessage,
  UserProfile,
} from '../types';

export const DEFAULT_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  department: 'Engineering',
  year: 'Innovator',
};

// Backwards compatibility aliases
export const STUDENT_USER = DEFAULT_USER;
export const TEACHER_USER = DEFAULT_USER;

export const INITIAL_PRESET_PROBLEMS: Array<{
  title: string;
  domain: string;
  problem: string;
}> = [];

export const INITIAL_SMART_NOTES: SmartNote[] = [];

export const INITIAL_PROJECT_IDEAS: ProjectIdea[] = [];

export const INITIAL_CLASSROOMS: Classroom[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
