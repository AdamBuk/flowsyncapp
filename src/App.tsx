import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Project, Task, TaskStatus, Priority, SortOption, ViewMode, TeamMember } from './types';
import { realtimeSync } from './services/firebase';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { TaskSection } from './components/TaskSection';
import { KanbanBoard } from './components/KanbanBoard';
import { TrashView } from './components/TrashView';
import { NewTaskModal } from './components/NewTaskModal';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { FirebaseModal } from './components/FirebaseModal';
import { TeamManagementModal } from './components/TeamManagementModal';
import { useI18n } from './i18n';

const VIEW_MODE_STORAGE_KEY = 'flow_view_mode_v1';

export const App: React.FC = () => {
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('project') || 'general';
  });

  // View state: List vs Board, and Trash view
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (saved === 'board' || saved === 'list') return saved;
    } catch {}
    return 'list';
  });
  const [isTrashActive, setIsTrashActive] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('created');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals & Slide-over states
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {}
  }, []);

  // 1. Subscribe to Projects in Real-Time
  useEffect(() => {
    realtimeSync.ensureProject(activeProjectId);

    const unsub = realtimeSync.subscribeToProjects((updatedProjects) => {
      setProjects(updatedProjects);
      if (updatedProjects.length > 0 && !updatedProjects.some((p) => p.id === activeProjectId)) {
        realtimeSync.ensureProject(activeProjectId);
      }
    });
    return () => unsub();
  }, [activeProjectId]);

  // Keep activeProjectId in sync on browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const proj = params.get('project') || 'general';
      if (proj !== activeProjectId) {
        setActiveProjectId(proj);
        setIsTrashActive(false);
        setSelectedTaskId(null);
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeProjectId]);

  // 2. Subscribe to Tasks of Active Project in Real-Time
  useEffect(() => {
    if (!activeProjectId) return;
    const unsub = realtimeSync.subscribeToTasks(activeProjectId, (updatedTasks) => {
      setTasks(updatedTasks);
    });
    return () => unsub();
  }, [activeProjectId]);

  // Handle Project Selection & URL sync
  const handleSelectProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    setIsTrashActive(false);
    setSelectedTaskId(null);
    setIsMobileSidebarOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('project', projectId);
    window.history.pushState({}, '', url.toString());
  }, []);

  // Projects CRUD
  const handleCreateProject = useCallback((name: string) => {
    const id = name.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-') || 'proj-' + Date.now();
    const newProj: Project = {
      id,
      name,
      createdAt: Date.now(),
    };
    realtimeSync.createProject(newProj);
    handleSelectProject(id);
  }, [handleSelectProject]);

  const handleDeleteProject = useCallback((projectId: string) => {
    const now = Date.now();
    // If the active project is being deleted, soft-delete its tasks in current state
    if (activeProjectId === projectId) {
      setTasks((prev) =>
        prev.map((t) => ({ ...t, isDeleted: true, deletedAt: now, updatedAt: now }))
      );
    }
    // realtimeSync handles project deletion and soft-deleting associated project tasks into Trash
    realtimeSync.deleteProject(projectId);
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projectId);
      if (activeProjectId === projectId && remaining.length > 0) {
        handleSelectProject(remaining[0].id);
      }
      return remaining;
    });
  }, [activeProjectId, handleSelectProject]);

  // Tasks CRUD with Optimistic UI updates (100% single-user, zero mock assignees)
  const handleAddTask = useCallback((
    title: string,
    tags: string[],
    priority: Priority,
    status: TaskStatus = 'todo',
    dueDate?: string | null,
    description?: string,
    assignee?: string
  ) => {
    const now = Date.now();
    const newTask: Task = {
      id: 'task_' + now + '_' + Math.random().toString(36).substring(2, 6),
      projectId: activeProjectId,
      title,
      description,
      status,
      priority,
      tags,
      dueDate: dueDate || null,
      assignee: assignee || undefined,
      subtasks: [],
      order: now,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    // 0ms instant optimistic UI
    setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)]);
    realtimeSync.createTask(newTask);
  }, [activeProjectId]);

  const handleToggleStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    const now = Date.now();
    // 0ms instant optimistic UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updatedAt: now } : t))
    );
    realtimeSync.updateTask(activeProjectId, taskId, { status: newStatus, updatedAt: now });
  }, [activeProjectId]);

  const handleUpdateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    const now = Date.now();
    // 0ms instant optimistic UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: now } : t))
    );
    realtimeSync.updateTask(activeProjectId, taskId, { ...updates, updatedAt: now });
  }, [activeProjectId]);

  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);

  // 3. Subscribe to Global Trash across all clients in Real-Time
  useEffect(() => {
    const unsub = realtimeSync.subscribeToTrash((trash) => {
      setDeletedTasks(trash);
    });
    return () => unsub();
  }, []);

  // 4. Subscribe to Team Members in Real-Time
  useEffect(() => {
    const unsub = realtimeSync.subscribeToTeamMembers((members) => {
      setTeamMembers(members);
    });
    return () => unsub();
  }, []);

  // Soft delete task (moves to trash in Firestore)
  const handleDeleteTask = useCallback((taskId: string) => {
    if (selectedTaskId === taskId) setSelectedTaskId(null);
    const now = Date.now();
    // Instant optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isDeleted: true, deletedAt: now, updatedAt: now } : t))
    );
    realtimeSync.softDeleteTask(activeProjectId, taskId);
  }, [activeProjectId, selectedTaskId]);

  // Restore task from trash
  const handleRestoreTask = useCallback((taskId: string, projectId: string) => {
    realtimeSync.ensureProject(projectId);
    realtimeSync.restoreTask(projectId, taskId);
  }, []);

  // Permanently delete task from trash
  const handlePermanentDeleteTask = useCallback((taskId: string, projectId: string) => {
    realtimeSync.permanentlyDeleteTask(projectId, taskId);
  }, []);

  // All deleted tasks across all projects from real-time Firestore
  const allDeletedTasks = deletedTasks;

  // Empty trash permanently
  const handleEmptyTrash = useCallback(() => {
    realtimeSync.emptyTrash();
  }, []);

  // Drag and Drop reordering & moving across sections
  const handleMoveTaskToSection = useCallback((
    taskId: string,
    targetStatus: TaskStatus,
    targetTaskId?: string
  ) => {
    setTasks((prev) => {
      const taskToMove = prev.find((t) => t.id === taskId);
      if (!taskToMove) return prev;

      const updatedTask: Task = {
        ...taskToMove,
        status: targetStatus,
        updatedAt: Date.now(),
      };

      const others = prev.filter((t) => t.id !== taskId);
      let reordered: Task[];

      if (targetTaskId && targetTaskId !== taskId) {
        const targetIndex = others.findIndex((t) => t.id === targetTaskId);
        if (targetIndex !== -1) {
          others.splice(targetIndex, 0, updatedTask);
          reordered = others;
        } else {
          reordered = [updatedTask, ...others];
        }
      } else {
        reordered = [updatedTask, ...others];
      }

      const finalTasks = reordered.map((t, index) => ({
        ...t,
        order: Date.now() - index * 1000,
      }));

      // Background sync to Firestore and local storage
      realtimeSync.reorderTasks(activeProjectId, finalTasks);

      return finalTasks;
    });
  }, [activeProjectId]);

  // Active Project object
  const activeProject = useMemo(() => {
    return (
      projects.find((p) => p.id === activeProjectId) || {
        id: activeProjectId,
        name: activeProjectId.charAt(0).toUpperCase() + activeProjectId.slice(1).replace(/[-_]/g, ' '),
        createdAt: Date.now(),
      }
    );
  }, [projects, activeProjectId]);

  // Active non-deleted tasks
  const activeTasks = useMemo(() => tasks.filter((t) => !t.isDeleted), [tasks]);

  // Selected Task for Slide-Over Detail Panel
  const selectedTask = useMemo(() => {
    return activeTasks.find((t) => t.id === selectedTaskId) || null;
  }, [activeTasks, selectedTaskId]);

  // Statistics
  const completedCount = useMemo(() => activeTasks.filter((t) => t.status === 'done').length, [activeTasks]);

  // Filtered & Sorted active tasks
  const filteredTasks = useMemo(() => {
    const list = activeTasks.filter((t) => {
      // Tag filter
      if (selectedTag && !t.tags.includes(selectedTag)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = t.title.toLowerCase().includes(q);
        const inDesc = t.description?.toLowerCase().includes(q);
        const inTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inTags) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortOption === 'priority') {
        const pOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      if (sortOption === 'due_date') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      }
      return (b.order ?? b.createdAt) - (a.order ?? a.createdAt);
    });

    return list;
  }, [activeTasks, selectedTag, searchQuery, sortOption]);

  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'todo'), [filteredTasks]);
  const inProgressTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'in_progress'),
    [filteredTasks]
  );
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'done'), [filteredTasks]);

  const handleSelectTask = useCallback((task: Task) => {
    setSelectedTaskId(task.id);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
  }, []);

  const handleClearTag = useCallback(() => {
    setSelectedTag(null);
  }, []);

  const handleOpenNewTaskModal = useCallback(() => {
    setIsNewTaskModalOpen(true);
  }, []);

  const handleCloseNewTaskModal = useCallback(() => {
    setIsNewTaskModalOpen(false);
  }, []);

  const handleOpenFirebaseModal = useCallback(() => {
    setIsFirebaseModalOpen(true);
  }, []);

  const handleCloseFirebaseModal = useCallback(() => {
    setIsFirebaseModalOpen(false);
  }, []);

  const handleCloseDetailPanel = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  return (
    <div className="flex h-screen w-full bg-app text-zinc-100 font-sans overflow-hidden">
      {/* 1. Left Navigation Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        isTrashActive={isTrashActive}
        deletedCount={allDeletedTasks.length}
        teamCount={teamMembers.length}
        onSelectProject={handleSelectProject}
        onSelectTrash={() => setIsTrashActive(true)}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onOpenFirebaseModal={handleOpenFirebaseModal}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Bar Header with Project Controls, Hamburger & View Toggle */}
        <TopBar
          project={activeProject}
          totalCount={isTrashActive ? allDeletedTasks.length : activeTasks.length}
          completedCount={completedCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          selectedTag={selectedTag}
          onClearTag={handleClearTag}
          onQuickNewTask={handleOpenNewTaskModal}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          isTrashActive={isTrashActive}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Views: Trash View vs Board View vs List View */}
        <main className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-4 sm:py-8">
          {isTrashActive ? (
            /* Trash / Recovery View */
            <TrashView
              deletedTasks={allDeletedTasks}
              projects={projects}
              onRestore={handleRestoreTask}
              onPermanentDelete={handlePermanentDeleteTask}
              onEmptyTrash={handleEmptyTrash}
            />
          ) : activeTasks.length === 0 ? (
            /* Structured Empty State */
            <div className="max-w-4xl mx-auto py-24 text-center border border-dashed border-border rounded-2xl bg-card/20 px-4">
              <p className="text-sm font-medium text-zinc-300 mb-1">
                {t('emptyProjectTitle')}
              </p>
              <p className="text-xs text-zinc-500 font-mono mb-4">
                {t('emptyProjectSubtitle')}
              </p>
              <button
                onClick={handleOpenNewTaskModal}
                className="px-3.5 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-subtle inline-flex items-center gap-1.5"
              >
                {t('createTaskBtn')}
              </button>
            </div>
          ) : viewMode === 'board' ? (
            /* 3-Column Kanban Board View */
            <div className="max-w-7xl mx-auto">
              <KanbanBoard
                todoTasks={todoTasks}
                inProgressTasks={inProgressTasks}
                doneTasks={doneTasks}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
                onSelectTask={handleSelectTask}
                onTagClick={handleTagClick}
                onQuickAdd={handleAddTask}
                onMoveTaskToSection={handleMoveTaskToSection}
              />
            </div>
          ) : (
            /* Vertical List View */
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Section 1: To Do */}
              <TaskSection
                status="todo"
                title={t('todo')}
                tasks={todoTasks}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
                onSelectTask={handleSelectTask}
                onTagClick={handleTagClick}
                onQuickAdd={handleAddTask}
                onMoveTaskToSection={handleMoveTaskToSection}
              />

              {/* Section 2: In Progress */}
              <TaskSection
                status="in_progress"
                title={t('inProgress')}
                tasks={inProgressTasks}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
                onSelectTask={handleSelectTask}
                onTagClick={handleTagClick}
                onQuickAdd={handleAddTask}
                onMoveTaskToSection={handleMoveTaskToSection}
              />

              {/* Section 3: Done */}
              <TaskSection
                status="done"
                title={t('done')}
                tasks={doneTasks}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
                onSelectTask={handleSelectTask}
                onTagClick={handleTagClick}
                onQuickAdd={handleAddTask}
                onMoveTaskToSection={handleMoveTaskToSection}
              />
            </div>
          )}
        </main>
      </div>

      {/* Task Detail Slide-over Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={handleCloseDetailPanel}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        teamMembers={teamMembers}
      />

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={handleCloseNewTaskModal}
        onAddTask={handleAddTask}
        teamMembers={teamMembers}
      />

      {/* Firebase Diagnostics & Cloud Config Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={handleCloseFirebaseModal}
      />

      {/* Team Management Modal */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teamMembers={teamMembers}
        onAddMember={(name) => realtimeSync.addTeamMember(name)}
        onDeleteMember={(id) => realtimeSync.deleteTeamMember(id)}
      />
    </div>
  );
};

export default App;
