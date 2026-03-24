import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, GraphEntry, QueryRecord, ComparisonData, PlotlyGraphData } from '@/lib/types';
import { v4 } from './uuid';

interface AppState {
  // Session
  sessionId: string;
  messages: Message[];
  graphs: GraphEntry[];
  queries: QueryRecord[];
  sessionStartTime: number;

  // UI state
  sidebarOpen: boolean;
  activePanel: 'chat' | 'graph' | 'comparison';
  activeGraphId: string | null;
  isLoading: boolean;

  // Comparison mode
  comparison: ComparisonData | null;

  // Notebook
  notebookContent: string;

  // Actions
  addMessage: (message: Message) => void;
  addGraph: (graph: GraphEntry) => void;
  addQuery: (query: QueryRecord) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setActivePanel: (panel: 'chat' | 'graph' | 'comparison') => void;
  setActiveGraphId: (id: string | null) => void;
  setComparison: (data: ComparisonData | null) => void;
  setNotebookContent: (content: string) => void;
  clearSession: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      sessionId: v4(),
      messages: [],
      graphs: [],
      queries: [],
      sessionStartTime: Date.now(),
      sidebarOpen: true,
      activePanel: 'chat',
      activeGraphId: null,
      isLoading: false,
      comparison: null,
      notebookContent: '# Math Notebook\n\nStart writing your notes here...\n',

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      addGraph: (graph) =>
        set((state) => ({
          graphs: [...state.graphs, graph],
          activeGraphId: graph.id,
          activePanel: 'graph',
        })),

      addQuery: (query) =>
        set((state) => ({ queries: [...state.queries, query] })),

      setLoading: (loading) => set({ isLoading: loading }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setActivePanel: (panel) => set({ activePanel: panel }),

      setActiveGraphId: (id) => set({ activeGraphId: id }),

      setComparison: (data) =>
        set({ comparison: data, activePanel: data ? 'comparison' : 'chat' }),

      setNotebookContent: (content) => set({ notebookContent: content }),

      clearSession: () =>
        set({
          sessionId: v4(),
          messages: [],
          graphs: [],
          queries: [],
          sessionStartTime: Date.now(),
          activePanel: 'chat',
          activeGraphId: null,
          comparison: null,
        }),
    }),
    {
      name: 'ai-math-agent-storage',
      partialize: (state) => ({
        messages: state.messages,
        graphs: state.graphs,
        queries: state.queries,
        sessionStartTime: state.sessionStartTime,
        notebookContent: state.notebookContent,
        sessionId: state.sessionId,
      }),
    }
  )
);
