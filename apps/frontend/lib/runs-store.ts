"use client";

import { create } from "zustand";

export interface TestResult {
  id: string;
  testFile: string;
  testName: string;
  testTitle: string;
  status: "passed" | "failed" | "skipped" | "flaky";
  durationMs: number;
  retryCount: number;
  healingAttempted: boolean;
  healingSucceeded: boolean;
  errorMessage?: string;
  traceUrl?: string;
  screenshotUrl?: string;
  videoUrl?: string;
}

export interface TestRun {
  id: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  flakyTests: number;
  durationMs?: number;
  workerCount: number;
  shardStrategy: string;
  branch?: string;
  commitSha?: string;
  project?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TestRunDetails extends TestRun {
  results: TestResult[];
}

interface RunsState {
  runs: TestRun[];
  currentRun: TestRunDetails | null;
  selectedRunId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setRuns: (runs: TestRun[]) => void;
  setCurrentRun: (run: TestRunDetails | null) => void;
  setSelectedRunId: (runId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  loadRuns: () => Promise<void>;
  loadRunDetails: (runId: string) => Promise<void>;
  startOrchestration: (data: {
    testFiles: string[];
    workerCount?: number;
    project?: string;
    branch?: string;
    commitSha?: string;
  }) => Promise<any>;
  cancelRun: (runId: string) => Promise<void>;
}

export const useRunsStore = create<RunsState>((set, get) => ({
  runs: [],
  currentRun: null,
  selectedRunId: null,
  isLoading: false,
  error: null,

  setRuns: (runs) => set({ runs }),
  setCurrentRun: (run) => set({ currentRun: run }),
  setSelectedRunId: (runId) => set({ selectedRunId: runId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  loadRuns: async () => {
    set({ isLoading: true, error: null });
    try {
      const { apiClient } = await import("./api-client");
      const response = await apiClient.getTestRuns();
      set({ runs: response.runs || [], isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || "Failed to load test runs", 
        isLoading: false 
      });
    }
  },

  loadRunDetails: async (runId: string) => {
    set({ isLoading: true, error: null, selectedRunId: runId });
    try {
      const { apiClient } = await import("./api-client");
      const response = await apiClient.getTestRun(runId);
      set({ 
        currentRun: { ...response.run, results: response.results || [] },
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || "Failed to load run details", 
        isLoading: false 
      });
    }
  },

  startOrchestration: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { apiClient } = await import("./api-client");
      const response = await apiClient.startOrchestration(data);
      set({ isLoading: false });
      // Refresh runs list
      await get().loadRuns();
      return response;
    } catch (error: any) {
      set({ 
        error: error.message || "Failed to start orchestration", 
        isLoading: false 
      });
      throw error;
    }
  },

  cancelRun: async (runId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { apiClient } = await import("./api-client");
      await apiClient.cancelOrchestration(runId);
      set({ isLoading: false });
      // Refresh runs list
      await get().loadRuns();
    } catch (error: any) {
      set({ 
        error: error.message || "Failed to cancel run", 
        isLoading: false 
      });
    }
  },
}));
