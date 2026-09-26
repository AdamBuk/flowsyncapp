import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type Language = 'en' | 'cz';

export interface Translations {
  // Sidebar
  workspace: string;
  projectsAndLists: string;
  newProjectPlaceholder: string;
  liveSync: string;
  firestoreCloud: string;
  languageLabel: string;
  trash: string;
  team: string;
  manageTeam: string;
  teamDescription: string;
  addMemberPlaceholder: string;
  addMemberBtn: string;
  noMembersYet: string;

  // Top Bar & Views
  completedFraction: string;
  zeroTasks: string;
  allAssignees: string;
  unassigned: string;
  searchPlaceholder: string;
  sortCreated: string;
  sortDueDate: string;
  sortPriority: string;
  sortTitle: string;
  share: string;
  copied: string;
  newTask: string;
  listView: string;
  boardView: string;

  // Sections
  todo: string;
  inProgress: string;
  done: string;
  add: string;
  addPlaceholder: string;
  noTasksInSection: string;
  emptyProjectTitle: string;
  emptyProjectSubtitle: string;
  createTaskBtn: string;

  // Task & Priorities
  urgent: string;
  high: string;
  medium: string;
  low: string;
  today: string;
  overdue: string;

  // Detail Panel
  descriptionTitle: string;
  descriptionPlaceholder: string;
  renderedPreview: string;
  subtasks: string;
  subtasksCompletedFraction: string;
  addSubtaskPlaceholder: string;
  assignee: string;
  dueDate: string;
  status: string;
  priority: string;
  deleteTask: string;
  close: string;
  cancel: string;
  save: string;
  createdOn: string;

  // Modals
  createNewTaskTitle: string;
  taskTitleLabel: string;
  taskTitlePlaceholder: string;
  descriptionOptional: string;
  taskDescPlaceholder: string;
  deleteProjectConfirm: string;
  deleteTaskConfirm: string;

  // Trash & Recovery
  restore: string;
  deletePermanently: string;
  deletePermanentlyConfirm: string;
  emptyTrash: string;
  emptyTrashConfirm: string;
  emptyTrashTitle: string;
  emptyTrashSubtitle: string;
  projectBadge: string;
  deletedOn: string;

  // Firebase Modal
  firebaseModalTitle: string;
  localSyncLabel: string;
  localSyncActive: string;
  firestoreSyncLabel: string;
  firestoreConnected: string;
  firestoreNotConfigured: string;
  firebaseDescription: string;
  firebaseProjectIdLabel: string;
  firebaseApiKeyLabel: string;
  disconnectFirestore: string;
  connectFirestore: string;
  saved: string;
}

const translations: Record<Language, Translations> = {
  en: {
    workspace: 'Core Workspace',
    projectsAndLists: 'Projects & Lists',
    newProjectPlaceholder: 'Project name...',
    liveSync: 'Live Sync',
    firestoreCloud: 'Firestore Cloud',
    languageLabel: 'Language',
    trash: 'Trash',
    team: 'Team',
    manageTeam: 'Manage Team',
    teamDescription: 'Add or remove team members. Synced across all devices in real-time.',
    addMemberPlaceholder: 'Enter team member name...',
    addMemberBtn: 'Add',
    noMembersYet: 'No team members added yet',

    completedFraction: '{completed}/{total} completed',
    zeroTasks: '0 tasks',
    allAssignees: 'All Assignees',
    unassigned: 'Unassigned',
    searchPlaceholder: 'Search tasks...',
    sortCreated: 'Created',
    sortDueDate: 'Due Date',
    sortPriority: 'Priority',
    sortTitle: 'Alphabetical',
    share: 'Share',
    copied: 'Copied',
    newTask: 'New Task',
    listView: 'List View',
    boardView: 'Board View',

    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
    add: 'Add',
    addPlaceholder: 'Add task to {section}... (type #tag)',
    noTasksInSection: 'No tasks in {section}',
    emptyProjectTitle: 'No tasks in this project yet',
    emptyProjectSubtitle: 'Add your first task or share this project URL with collaborators.',
    createTaskBtn: 'Create Task',

    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    today: 'Today',
    overdue: 'Overdue',

    descriptionTitle: 'Description & Notes',
    descriptionPlaceholder: 'Add detailed instructions, links, or notes (URLs become clickable)...',
    renderedPreview: 'Rendered Preview',
    subtasks: 'Subtasks',
    subtasksCompletedFraction: '{completed}/{total} completed',
    addSubtaskPlaceholder: 'Add subtask checklist item... (press Enter)',
    assignee: 'Assignee',
    dueDate: 'Due Date',
    status: 'Status',
    priority: 'Priority',
    deleteTask: 'Delete Task',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    createdOn: 'Created',

    createNewTaskTitle: 'Create New Task',
    taskTitleLabel: 'Task Title * (use #tags for labels)',
    taskTitlePlaceholder: 'e.g. Launch real-time sync #backend #prod',
    descriptionOptional: 'Description (optional)',
    taskDescPlaceholder: 'Add extra context, links, or notes...',
    deleteProjectConfirm: 'Are you sure you want to delete project "{name}"?',
    deleteTaskConfirm: 'Are you sure you want to move this task to trash?',

    restore: 'Restore',
    deletePermanently: 'Delete Permanently',
    deletePermanentlyConfirm: 'Are you sure you want to permanently delete this task? This cannot be undone.',
    emptyTrash: 'Empty Trash',
    emptyTrashConfirm: 'Are you sure you want to permanently delete all items in trash?',
    emptyTrashTitle: 'Trash is empty',
    emptyTrashSubtitle: 'Deleted tasks will appear here. You can restore them anytime.',
    projectBadge: 'Project: {name}',
    deletedOn: 'Deleted {date}',

    firebaseModalTitle: 'Firebase & Real-Time Sync Status',
    localSyncLabel: 'Local Multi-Tab / Multi-Window Sync:',
    localSyncActive: 'Active (Zero-Setup)',
    firestoreSyncLabel: 'Firebase Firestore Cloud Sync:',
    firestoreConnected: 'Connected to Cloud',
    firestoreNotConfigured: 'Not Configured (Optional)',
    firebaseDescription: 'The app includes an instant real-time sync engine that synchronizes across browser tabs/windows out-of-the-box. To sync across entirely separate machines worldwide, connect your Firebase project credentials below:',
    firebaseProjectIdLabel: 'Firebase Project ID',
    firebaseApiKeyLabel: 'Web API Key',
    disconnectFirestore: 'Disconnect Firestore',
    connectFirestore: 'Connect Firestore',
    saved: 'Saved!',
  },
  cz: {
    workspace: 'Hlavní Pracoviště',
    projectsAndLists: 'Projekty a Seznamy',
    newProjectPlaceholder: 'Název projektu...',
    liveSync: 'Živá synchronizace',
    firestoreCloud: 'Firestore Cloud',
    languageLabel: 'Jazyk',
    trash: 'Koš',
    team: 'Tým',
    manageTeam: 'Správa týmu',
    teamDescription: 'Přidávejte nebo odebírejte členy týmu. Synchronizováno v reálném čase.',
    addMemberPlaceholder: 'Zadejte jméno člena týmu...',
    addMemberBtn: 'Přidat',
    noMembersYet: 'Zatím nebyli přidáni žádní členové týmu',

    completedFraction: '{completed}/{total} dokončeno',
    zeroTasks: '0 úkolů',
    allAssignees: 'Všichni řešitelé',
    unassigned: 'Nepřiřazeno',
    searchPlaceholder: 'Hledat úkoly...',
    sortCreated: 'Vytvořeno',
    sortDueDate: 'Termín',
    sortPriority: 'Priorita',
    sortTitle: 'Abecedně',
    share: 'Sdílet',
    copied: 'Zkopírováno',
    newTask: 'Nový úkol',
    listView: 'Seznam',
    boardView: 'Nástěnka',

    todo: 'K řešení',
    inProgress: 'V realizaci',
    done: 'Hotovo',
    add: 'Přidat',
    addPlaceholder: 'Přidat úkol do {section}... (napište #tag)',
    noTasksInSection: 'Žádné úkoly v sekci {section}',
    emptyProjectTitle: 'V tomto projektu zatím nejsou žádné úkoly',
    emptyProjectSubtitle: 'Přidejte svůj první úkol nebo sdílejte odkaz s kolegy pro spolupráci.',
    createTaskBtn: 'Vytvořit úkol',

    urgent: 'Kritická',
    high: 'Vysoká',
    medium: 'Střední',
    low: 'Nízká',
    today: 'Dnes',
    overdue: 'Po termínu',

    descriptionTitle: 'Popis a poznámky',
    descriptionPlaceholder: 'Podrobné instrukce, odkazy nebo poznámky (URL odkazy budou klikací)...',
    renderedPreview: 'Náhled odkazů',
    subtasks: 'Podúkoly',
    subtasksCompletedFraction: '{completed}/{total} splněno',
    addSubtaskPlaceholder: 'Přidat položku checklistu... (stiskněte Enter)',
    assignee: 'Řešitel',
    dueDate: 'Termín splnění',
    status: 'Stav',
    priority: 'Priorita',
    deleteTask: 'Smazat úkol',
    close: 'Zavřít',
    cancel: 'Zrušit',
    save: 'Uložit',
    createdOn: 'Vytvořeno',

    createNewTaskTitle: 'Vytvořit nový úkol',
    taskTitleLabel: 'Název úkolu * (použijte #tag pro štítky)',
    taskTitlePlaceholder: 'např. Spustit synchronizaci #backend #prod',
    descriptionOptional: 'Popis (volitelně)',
    taskDescPlaceholder: 'Přidejte podrobnosti, odkazy nebo poznámky...',
    deleteProjectConfirm: 'Opravdu chcete smazat projekt "{name}"?',
    deleteTaskConfirm: 'Opravdu chcete tento úkol přesunout do koše?',

    restore: 'Obnovit',
    deletePermanently: 'Trvale smazat',
    deletePermanentlyConfirm: 'Opravdu chcete tento úkol trvale smazat? Tuto akci nelze vrátit.',
    emptyTrash: 'Vysypat koš',
    emptyTrashConfirm: 'Opravdu chcete trvale smazat všechny položky v koši?',
    emptyTrashTitle: 'Koš je prázdný',
    emptyTrashSubtitle: 'Zde se zobrazí smazané úkoly. Můžete je kdykoli obnovit.',
    projectBadge: 'Projekt: {name}',
    deletedOn: 'Smazáno {date}',

    firebaseModalTitle: 'Stav Firebase a živé synchronizace',
    localSyncLabel: 'Lokální synchronizace mezi panely a okny:',
    localSyncActive: 'Aktivní (bez nutnosti nastavení)',
    firestoreSyncLabel: 'Cloudová synchronizace Firebase Firestore:',
    firestoreConnected: 'Připojeno ke cloudu',
    firestoreNotConfigured: 'Nenakonfigurováno (volitelné)',
    firebaseDescription: 'Aplikace obsahuje okamžitou synchronizaci mezi panely a okny prohlížeče. Pro synchronizaci mezi různými zařízeními po celém světě zadejte své údaje projektu Firebase:',
    firebaseProjectIdLabel: 'ID projektu Firebase',
    firebaseApiKeyLabel: 'Web API klíč',
    disconnectFirestore: 'Odpojit Firestore',
    connectFirestore: 'Připojit Firestore',
    saved: 'Uloženo!',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_LANG_KEY = 'flow_app_language_v1';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'cz' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch {}
  }, []);

  const t = useCallback(
    (key: keyof Translations, params?: Record<string, string | number>): string => {
      const dict = translations[language] || translations.en;
      let str = dict[key] || translations.en[key] || (key as string);
      if (params) {
        Object.entries(params).forEach(([paramKey, val]) => {
          str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }
      return str;
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
};
