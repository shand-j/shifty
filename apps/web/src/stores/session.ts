import { create } from 'zustand';

export interface ManualSession {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  startedAt: string;
  completedAt?: string;
  steps: SessionStep[];
}

export interface SessionStep {
  id: string;
  sessionId: string;
  sequence: number;
  action: string;
  expected: string;
  actual: string;
  status: 'pass' | 'fail' | 'pending';
  screenshotUrl?: string;
  evidence?: string[];
  createdAt: string;
}

interface SessionState {
  sessions: ManualSession[];
  activeSession: ManualSession | null;
  setSessions: (sessions: ManualSession[]) => void;
  setActiveSession: (session: ManualSession | null) => void;
  addStep: (step: SessionStep) => void;
  updateStep: (stepId: string, updates: Partial<SessionStep>) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  activeSession: null,
  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (activeSession) => set({ activeSession }),
  addStep: (step) =>
    set((state) => ({
      activeSession: state.activeSession
        ? { ...state.activeSession, steps: [...state.activeSession.steps, step] }
        : null,
    })),
  updateStep: (stepId, updates) =>
    set((state) => ({
      activeSession: state.activeSession
        ? {
            ...state.activeSession,
            steps: state.activeSession.steps.map((step) =>
              step.id === stepId ? { ...step, ...updates } : step
            ),
          }
        : null,
    })),
}));
