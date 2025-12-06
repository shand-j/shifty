import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import Shell from '@/components/layout/Shell';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import TestsPage from '@/pages/TestsPage';
import TestDetailPage from '@/pages/TestDetailPage';
import TestGeneratePage from '@/pages/TestGeneratePage';
import HealingPage from '@/pages/HealingPage';
import SessionsPage from '@/pages/SessionsPage';
import SessionWorkspacePage from '@/pages/SessionWorkspacePage';
import PipelinesPage from '@/pages/PipelinesPage';
import PipelineDetailPage from '@/pages/PipelineDetailPage';
import InsightsPage from '@/pages/InsightsPage';
import RoiPage from '@/pages/RoiPage';
import ArcadePage from '@/pages/ArcadePage';
import SettingsPage from '@/pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Shell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tests" element={<TestsPage />} />
        <Route path="tests/:id" element={<TestDetailPage />} />
        <Route path="tests/generate" element={<TestGeneratePage />} />
        <Route path="healing" element={<HealingPage />} />
        <Route path="healing/:id" element={<HealingPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="sessions/:id" element={<SessionWorkspacePage />} />
        <Route path="pipelines" element={<PipelinesPage />} />
        <Route path="pipelines/:id" element={<PipelineDetailPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="insights/roi" element={<RoiPage />} />
        <Route path="arcade" element={<ArcadePage />} />
        <Route path="settings/*" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
