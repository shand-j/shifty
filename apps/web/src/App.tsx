import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/auth';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ManualSessions } from './pages/ManualSessions';
import { HITLArcade } from './pages/HITLArcade';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/manual-sessions"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ManualSessions />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/hitl-arcade"
            element={
              <PrivateRoute>
                <MainLayout>
                  <HITLArcade />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/test-generation"
            element={
              <PrivateRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Test Generation
                    </h2>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
