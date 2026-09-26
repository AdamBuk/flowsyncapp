import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import { Task, Project, FirebaseCustomConfig } from '../types';

const FIREBASE_CONFIG_STORAGE_KEY = 'flow_firebase_custom_config_v2';
const LOCAL_PROJECTS_KEY = 'flow_projects_v3';
const LOCAL_TASKS_PREFIX = 'flow_project_tasks_v3_';

function getActiveFirebaseConfig(): FirebaseCustomConfig | null {
  try {
    const stored = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.apiKey && parsed.projectId) return parsed;
    }

    if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
      };
    }
  } catch (e) {
    console.warn('Error reading Firebase config:', e);
  }
  return null;
}

class RealtimeSyncService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private isConnectedToFirestore = false;
  private broadcastChannel: BroadcastChannel | null = null;

  // Local active listeners to ensure instant UI reactivity in the same tab
  private taskListeners = new Map<string, Set<(tasks: Task[]) => void>>();
  private projectListeners = new Set<(projects: Project[]) => void>();

  constructor() {
    this.initFirebase();
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('flowsync_global_channel_v3');
    }
  }

  private initFirebase() {
    const config = getActiveFirebaseConfig();
    if (config && config.apiKey && config.projectId) {
      try {
        const apps = getApps();
        this.app = apps.length ? apps[0] : initializeApp(config);
        this.db = getFirestore(this.app);
        this.isConnectedToFirestore = true;
      } catch (err) {
        console.error('[SyncService] Firebase initialization failed:', err);
        this.isConnectedToFirestore = false;
      }
    } else {
      this.isConnectedToFirestore = false;
    }
  }

  public isCloudConnected(): boolean {
    return this.isConnectedToFirestore;
  }

  public saveCustomFirebaseConfig(config: FirebaseCustomConfig): boolean {
    try {
      localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
      this.initFirebase();
      return true;
    } catch (e) {
      console.error('Failed to save config:', e);
      return false;
    }
  }

  public clearCustomFirebaseConfig(): void {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
    this.app = null;
    this.db = null;
    this.isConnectedToFirestore = false;
  }

  // --- PROJECTS REALTIME SYNC ---

  public loadLocalProjects(): Project[] {
    try {
      const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Pristine default: 1 clean project, 0 dummy tasks
      const defaultProj: Project = {
        id: 'general',
        name: 'General',
        createdAt: Date.now()
      };
      this.saveLocalProjects([defaultProj]);
      return [defaultProj];
    } catch {
      return [{ id: 'general', name: 'General', createdAt: Date.now() }];
    }
  }

  private saveLocalProjects(projects: Project[]): void {
    try {
      localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
      this.broadcastChannel?.postMessage({ type: 'PROJECTS_UPDATED', projects });
      // Notify active listeners in current tab immediately
      this.projectListeners.forEach((fn) => fn(projects));
    } catch (e) {
      console.error('Failed saving local projects:', e);
    }
  }

  public subscribeToProjects(callback: (projects: Project[]) => void): Unsubscribe {
    this.projectListeners.add(callback);

    // Provide instant cached data immediately
    callback(this.loadLocalProjects());

    if (this.isConnectedToFirestore && this.db) {
      const colRef = collection(this.db, 'projects');
      const unsubFirestore = onSnapshot(
        colRef,
        (snap) => {
          const list: Project[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Project, 'id'>) }));
          list.sort((a, b) => a.createdAt - b.createdAt);
          if (list.length === 0) {
            const locals = this.loadLocalProjects();
            locals.forEach((p) => this.createProject(p));
            callback(locals);
          } else {
            try {
              localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(list));
            } catch {}
            callback(list);
          }
        },
        () => callback(this.loadLocalProjects())
      );
      return () => {
        this.projectListeners.delete(callback);
        unsubFirestore();
      };
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PROJECTS_UPDATED') {
        callback(event.data.projects);
      }
    };
    this.broadcastChannel?.addEventListener('message', onMessage);

    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_PROJECTS_KEY && e.newValue) {
        try { callback(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      this.projectListeners.delete(callback);
      this.broadcastChannel?.removeEventListener('message', onMessage);
      window.removeEventListener('storage', onStorage);
    };
  }

  public async ensureProject(projectId: string, name?: string): Promise<Project> {
    const current = this.loadLocalProjects();
    const existing = current.find((p) => p.id === projectId);
    if (existing) return existing;

    const newProj: Project = {
      id: projectId,
      name: name || (projectId.charAt(0).toUpperCase() + projectId.slice(1).replace(/[-_]/g, ' ')),
      createdAt: Date.now()
    };
    const updated = [...current, newProj];
    this.saveLocalProjects(updated);

    if (this.isConnectedToFirestore && this.db) {
      try {
        const { id, ...data } = newProj;
        await setDoc(doc(this.db, 'projects', id), data, { merge: true });
      } catch (e) {
        console.error('Firestore ensureProject error:', e);
      }
    }
    return newProj;
  }

  public async createProject(project: Project): Promise<void> {
    // 1. Optimistic local update
    const current = this.loadLocalProjects();
    const updated = [...current.filter((p) => p.id !== project.id), project];
    this.saveLocalProjects(updated);

    // 2. Cloud sync
    if (this.isConnectedToFirestore && this.db) {
      try {
        const { id, ...data } = project;
        await setDoc(doc(this.db, 'projects', id), data);
      } catch (e) {
        console.error('Firestore createProject error:', e);
      }
    }
  }

  public async deleteProject(projectId: string): Promise<void> {
    // 1. Optimistic local update - remove project from project list
    const current = this.loadLocalProjects();
    const updated = current.filter((p) => p.id !== projectId);
    this.saveLocalProjects(updated);

    // 2. Mark any tasks belonging to this project as soft-deleted so they appear in Trash
    try {
      const tasks = this.loadLocalTasks(projectId);
      if (tasks.length > 0) {
        const now = Date.now();
        const softDeleted = tasks.map((t) => ({
          ...t,
          isDeleted: true,
          deletedAt: t.deletedAt || now,
          updatedAt: now,
        }));
        this.saveLocalTasks(projectId, softDeleted);

        // Also update Firestore if connected
        if (this.isConnectedToFirestore && this.db) {
          const batch = writeBatch(this.db);
          softDeleted.forEach((t) => {
            const taskRef = doc(this.db!, 'projects', projectId, 'tasks', t.id);
            batch.update(taskRef, { isDeleted: true, deletedAt: t.deletedAt, updatedAt: now });
          });
          await batch.commit().catch(() => {});
        }
      }
    } catch (e) {
      console.error('Error soft-deleting tasks for project:', e);
    }

    // 3. Cloud sync for project doc removal
    if (this.isConnectedToFirestore && this.db) {
      try {
        await deleteDoc(doc(this.db, 'projects', projectId));
      } catch (e) {
        console.error('Firestore deleteProject error:', e);
      }
    }
  }

  // --- TASKS REALTIME SYNC BY PROJECT ---

  public loadLocalTasks(projectId: string): Task[] {
    try {
      const raw = localStorage.getItem(LOCAL_TASKS_PREFIX + projectId);
      // Strictly starts empty: ZERO dummy tasks
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalTasks(projectId: string, tasks: Task[]): void {
    try {
      localStorage.setItem(LOCAL_TASKS_PREFIX + projectId, JSON.stringify(tasks));
      this.broadcastChannel?.postMessage({ type: 'TASKS_UPDATED', projectId, tasks });
      // Notify active listeners in current tab immediately
      const listeners = this.taskListeners.get(projectId);
      if (listeners) {
        listeners.forEach((fn) => fn(tasks));
      }
    } catch (e) {
      console.error('Failed saving local tasks:', e);
    }
  }

  public subscribeToTasks(projectId: string, callback: (tasks: Task[]) => void): Unsubscribe {
    if (!this.taskListeners.has(projectId)) {
      this.taskListeners.set(projectId, new Set());
    }
    this.taskListeners.get(projectId)!.add(callback);

    // Provide instant cached data immediately
    callback(this.loadLocalTasks(projectId));

    if (this.isConnectedToFirestore && this.db) {
      const colRef = collection(this.db, 'projects', projectId, 'tasks');
      const unsubFirestore = onSnapshot(
        colRef,
        (snap) => {
          const tasks: Task[] = [];
          snap.forEach((d) => tasks.push({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }));
          tasks.sort((a, b) => (b.order ?? b.createdAt) - (a.order ?? a.createdAt));
          try {
            localStorage.setItem(LOCAL_TASKS_PREFIX + projectId, JSON.stringify(tasks));
          } catch {}
          callback(tasks);
        },
        (err) => {
          console.warn('Firestore onSnapshot error, falling back to local tasks:', err);
          callback(this.loadLocalTasks(projectId));
        }
      );
      return () => {
        this.taskListeners.get(projectId)?.delete(callback);
        unsubFirestore();
      };
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TASKS_UPDATED' && event.data.projectId === projectId) {
        callback(event.data.tasks);
      }
    };
    this.broadcastChannel?.addEventListener('message', onMessage);

    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_TASKS_PREFIX + projectId && e.newValue) {
        try { callback(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      this.taskListeners.get(projectId)?.delete(callback);
      this.broadcastChannel?.removeEventListener('message', onMessage);
      window.removeEventListener('storage', onStorage);
    };
  }

  public async createTask(task: Task): Promise<void> {
    // 1. Optimistic local update (0ms instant reactivity)
    const tasks = this.loadLocalTasks(task.projectId);
    const updated = [task, ...tasks.filter((t) => t.id !== task.id)];
    this.saveLocalTasks(task.projectId, updated);

    // 2. Cloud sync in background
    if (this.isConnectedToFirestore && this.db) {
      try {
        const { id, ...data } = task;
        await setDoc(doc(this.db, 'projects', task.projectId, 'tasks', id), data);
      } catch (e) {
        console.error('Firestore createTask error:', e);
      }
    }
  }

  public async updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<void> {
    // 1. Optimistic local update
    const tasks = this.loadLocalTasks(projectId);
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t));
    this.saveLocalTasks(projectId, updated);

    // 2. Cloud sync in background
    if (this.isConnectedToFirestore && this.db) {
      try {
        await updateDoc(doc(this.db, 'projects', projectId, 'tasks', taskId), {
          ...updates,
          updatedAt: Date.now()
        });
      } catch (e) {
        console.error('Firestore updateTask error:', e);
      }
    }
  }

  public async reorderTasks(projectId: string, tasks: Task[]): Promise<void> {
    // 1. Optimistic local update
    this.saveLocalTasks(projectId, tasks);

    // 2. Cloud sync in background
    if (this.isConnectedToFirestore && this.db) {
      try {
        const batch = writeBatch(this.db);
        tasks.forEach((t) => {
          const taskRef = doc(this.db!, 'projects', projectId, 'tasks', t.id);
          batch.update(taskRef, {
            order: t.order ?? t.createdAt,
            status: t.status,
            updatedAt: Date.now()
          });
        });
        await batch.commit();
      } catch (e) {
        console.error('Firestore reorderTasks error:', e);
      }
    }
  }

  public async softDeleteTask(projectId: string, taskId: string): Promise<void> {
    const now = Date.now();
    await this.updateTask(projectId, taskId, {
      isDeleted: true,
      deletedAt: now,
      updatedAt: now
    });
  }

  public async restoreTask(projectId: string, taskId: string): Promise<void> {
    const now = Date.now();
    await this.updateTask(projectId, taskId, {
      isDeleted: false,
      deletedAt: null,
      updatedAt: now
    });
  }

  public async permanentlyDeleteTask(projectId: string, taskId: string): Promise<void> {
    // 1. Optimistic local update
    const tasks = this.loadLocalTasks(projectId);
    const updated = tasks.filter((t) => t.id !== taskId);
    this.saveLocalTasks(projectId, updated);

    // 2. Cloud sync in background
    if (this.isConnectedToFirestore && this.db) {
      try {
        await deleteDoc(doc(this.db, 'projects', projectId, 'tasks', taskId));
      } catch (e) {
        console.error('Firestore permanentlyDeleteTask error:', e);
      }
    }
  }

  public async emptyTrash(projectId: string): Promise<void> {
    const tasks = this.loadLocalTasks(projectId);
    const deletedTasks = tasks.filter((t) => t.isDeleted);
    const remainingTasks = tasks.filter((t) => !t.isDeleted);
    this.saveLocalTasks(projectId, remainingTasks);

    if (this.isConnectedToFirestore && this.db && deletedTasks.length > 0) {
      try {
        const batch = writeBatch(this.db);
        deletedTasks.forEach((t) => {
          const taskRef = doc(this.db!, 'projects', projectId, 'tasks', t.id);
          batch.delete(taskRef);
        });
        await batch.commit();
      } catch (e) {
        console.error('Firestore emptyTrash error:', e);
      }
    }
  }

  public async deleteTask(projectId: string, taskId: string): Promise<void> {
    // Default delete is now soft-delete for history & recovery
    await this.softDeleteTask(projectId, taskId);
  }
}

export const realtimeSync = new RealtimeSyncService();
