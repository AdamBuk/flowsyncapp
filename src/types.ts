export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface UserAssignee {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  tags: string[];
  dueDate?: string | null;
  assignee?: UserAssignee | null;
  subtasks: Subtask[];
  order?: number;
  rawText?: string;
  completed?: boolean;
  isDeleted?: boolean;
  deletedAt?: number | null;
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'list' | 'board';
export type SortOption = 'created' | 'due_date' | 'priority' | 'title';
export type FilterStatus = 'all' | TaskStatus | 'active' | 'completed';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
