import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  writeBatch,
  onSnapshot,
  query,
  where,
  Unsubscribe
} from 'firebase/firestore';
import { Task, Project, FirebaseCustomConfig, TeamMember, DEFAULT_TEAM_MEMBERS } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyCTuv_LYoYxwm-s6A0qr2ZbJbSNAerJaJ0",
  authDomain: "flowsync-app-d7a67.firebaseapp.com",
  projectId: "flowsync-app-d7a67",
  storageBucket: "flowsync-app-d7a67.firebasestorage.app",
  messagingSenderId: "757362876811",
  appId: "1:757362876811:web:9550213b9cf964188b4f8e"
};

// Initialize Firebase App & Firestore unconditionally with real database
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Helper to remove undefined values before writing to Firestore (prevents Firestore errors)
function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !('_methodName' in value)
      ) {
        result[key] = cleanFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

class RealtimeSyncService {
  private cachedProjects: Project[] = [];
  private cachedTeamMembers: TeamMember[] = [];

  constructor() {
    // Ensure default general project exists on init
    this.ensureProject('general', 'General').catch((err) => {
      console.warn('[SyncService] Could not auto-ensure default project:', err);
    });
  }

  public isCloudConnected(): boolean {
    return true;
  }

  public saveCustomFirebaseConfig(_config: FirebaseCustomConfig): boolean {
    return true;
  }

  public clearCustomFirebaseConfig(): void {}

  // --- PROJECTS REALTIME SYNC VIA FIRESTORE ---

  public loadLocalProjects(): Project[] {
    return this.cachedProjects.length > 0
      ? this.cachedProjects
      : [{ id: 'general', name: 'General', createdAt: Date.now() }];
  }

  public subscribeToProjects(callback: (projects: Project[]) => void): Unsubscribe {
    const colRef = collection(db, 'projects');

    if (this.cachedProjects.length > 0) {
      callback(this.cachedProjects);
    }

    const unsub = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty) {
          const defaultProject: Project = {
            id: 'general',
            name: 'General',
            createdAt: Date.now()
          };
          try {
            await setDoc(doc(db, 'projects', defaultProject.id), defaultProject);
          } catch (e) {
            console.error('[SyncService] Error initializing default project:', e);
          }
          this.cachedProjects = [defaultProject];
          callback([defaultProject]);
          return;
        }

        const projects: Project[] = [];
        snapshot.forEach((d) => {
          projects.push({ id: d.id, ...(d.data() as Omit<Project, 'id'>) });
        });
        projects.sort((a, b) => a.createdAt - b.createdAt);
        this.cachedProjects = projects;
        callback(projects);
      },
      (error) => {
        console.error('[SyncService] subscribeToProjects onSnapshot error:', error);
      }
    );

    return unsub;
  }

  public async ensureProject(projectId: string, name?: string): Promise<Project> {
    try {
      const projRef = doc(db, 'projects', projectId);
      const snap = await getDoc(projRef);
      if (snap.exists()) {
        const proj = { id: snap.id, ...(snap.data() as Omit<Project, 'id'>) };
        return proj;
      }
      const newProj: Project = {
        id: projectId,
        name: name || (projectId.charAt(0).toUpperCase() + projectId.slice(1).replace(/[-_]/g, ' ')),
        createdAt: Date.now()
      };
      await setDoc(projRef, newProj);
      return newProj;
    } catch (err) {
      console.error('[SyncService] ensureProject error:', err);
      return {
        id: projectId,
        name: name || projectId,
        createdAt: Date.now()
      };
    }
  }

  public async createProject(project: Project): Promise<void> {
    try {
      await setDoc(doc(db, 'projects', project.id), cleanFirestoreData(project));
    } catch (err) {
      console.error('[SyncService] createProject error:', err);
      throw err;
    }
  }

  public async deleteProject(projectId: string): Promise<void> {
    try {
      // 1. Mark all tasks of this project as isDeleted: true
      const tasksQuery = query(collection(db, 'tasks'), where('projectId', '==', projectId));
      const tasksSnap = await getDocs(tasksQuery);
      if (!tasksSnap.empty) {
        const batch = writeBatch(db);
        const now = Date.now();
        tasksSnap.forEach((taskDoc) => {
          batch.update(taskDoc.ref, {
            isDeleted: true,
            deletedAt: now,
            updatedAt: now
          });
        });
        await batch.commit();
      }

      // 2. Remove project document
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (err) {
      console.error('[SyncService] deleteProject error:', err);
      throw err;
    }
  }

  // --- TASKS REALTIME SYNC VIA FIRESTORE ---

  public subscribeToTasks(projectId: string, callback: (tasks: Task[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const tasks: Task[] = [];
        snapshot.forEach((d) => {
          tasks.push({ id: d.id, ...(d.data() as Omit<Task, 'id'>) });
        });
        // Sort by custom order descending or created date
        tasks.sort((a, b) => (b.order ?? b.createdAt) - (a.order ?? a.createdAt));
        callback(tasks);
      },
      (error) => {
        console.error('[SyncService] subscribeToTasks onSnapshot error:', error);
      }
    );

    return unsub;
  }

  // --- GLOBAL REALTIME TRASH SYNC ---

  public subscribeToTrash(callback: (tasks: Task[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'tasks'),
      where('isDeleted', '==', true)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const tasks: Task[] = [];
        snapshot.forEach((d) => {
          tasks.push({ id: d.id, ...(d.data() as Omit<Task, 'id'>) });
        });
        // Sort deleted tasks with newest deletions first
        tasks.sort((a, b) => (b.deletedAt ?? b.updatedAt) - (a.deletedAt ?? a.updatedAt));
        callback(tasks);
      },
      (error) => {
        console.error('[SyncService] subscribeToTrash onSnapshot error:', error);
      }
    );

    return unsub;
  }

  // --- CRUD OPERATIONS ---

  public async createTask(task: Task): Promise<void> {
    try {
      await setDoc(doc(db, 'tasks', task.id), cleanFirestoreData(task));
    } catch (err) {
      console.error('[SyncService] createTask error:', err);
      throw err;
    }
  }

  public async updateTask(_projectId: string, taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const dataToClean: Record<string, any> = {
        ...updates,
        updatedAt: Date.now()
      };

      // If assignee is explicitly set to undefined or null or empty string, remove it from Firestore
      if ('assignee' in updates && (!updates.assignee || updates.assignee === undefined)) {
        dataToClean.assignee = deleteField();
      }

      await updateDoc(doc(db, 'tasks', taskId), cleanFirestoreData(dataToClean));
    } catch (err) {
      console.error('[SyncService] updateTask error:', err);
      throw err;
    }
  }

  public async reorderTasks(_projectId: string, tasks: Task[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      tasks.forEach((t) => {
        batch.update(doc(db, 'tasks', t.id), {
          order: t.order ?? t.createdAt,
          status: t.status,
          updatedAt: Date.now()
        });
      });
      await batch.commit();
    } catch (err) {
      console.error('[SyncService] reorderTasks error:', err);
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

  public async permanentlyDeleteTask(_projectId: string, taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (err) {
      console.error('[SyncService] permanentlyDeleteTask error:', err);
    }
  }

  public async emptyTrash(_projectId?: string): Promise<void> {
    try {
      const q = query(collection(db, 'tasks'), where('isDeleted', '==', true));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (err) {
      console.error('[SyncService] emptyTrash error:', err);
    }
  }

  public async deleteTask(projectId: string, taskId: string): Promise<void> {
    await this.softDeleteTask(projectId, taskId);
  }

  // --- TEAM MEMBERS REALTIME SYNC ---

  public subscribeToTeamMembers(callback: (members: TeamMember[]) => void): Unsubscribe {
    const colRef = collection(db, 'teamMembers');

    if (this.cachedTeamMembers.length > 0) {
      callback(this.cachedTeamMembers);
    }

    const unsub = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Initialize with default initial team members if empty
          const batch = writeBatch(db);
          const initialList: TeamMember[] = [];
          const now = Date.now();
          DEFAULT_TEAM_MEMBERS.forEach((name, idx) => {
            const memberId = 'member_' + now + '_' + idx;
            const memberDoc: TeamMember = {
              id: memberId,
              name,
              createdAt: now + idx,
            };
            batch.set(doc(db, 'teamMembers', memberId), memberDoc);
            initialList.push(memberDoc);
          });
          try {
            await batch.commit();
          } catch (e) {
            console.error('[SyncService] Error seeding default team members:', e);
          }
          this.cachedTeamMembers = initialList;
          callback(initialList);
          return;
        }

        const members: TeamMember[] = [];
        snapshot.forEach((d) => {
          members.push({ id: d.id, ...(d.data() as Omit<TeamMember, 'id'>) });
        });
        members.sort((a, b) => a.createdAt - b.createdAt);
        this.cachedTeamMembers = members;
        callback(members);
      },
      (error) => {
        console.error('[SyncService] subscribeToTeamMembers onSnapshot error:', error);
      }
    );

    return unsub;
  }

  public async addTeamMember(name: string): Promise<TeamMember> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Member name cannot be empty');
    const now = Date.now();
    const newMember: TeamMember = {
      id: 'member_' + now + '_' + Math.random().toString(36).substring(2, 6),
      name: trimmed,
      createdAt: now,
    };
    try {
      await setDoc(doc(db, 'teamMembers', newMember.id), cleanFirestoreData(newMember));
      return newMember;
    } catch (err) {
      console.error('[SyncService] addTeamMember error:', err);
      throw err;
    }
  }

  public async deleteTeamMember(memberId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'teamMembers', memberId));
    } catch (err) {
      console.error('[SyncService] deleteTeamMember error:', err);
      throw err;
    }
  }
}

export const realtimeSync = new RealtimeSyncService();
