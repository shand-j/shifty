import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth';
import { useSessionStore } from '../stores/session';
import { apiClient } from '../services/api';
import { Plus, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export function ManualSessions() {
  const { user } = useAuthStore();
  const { setActiveSession } = useSessionStore();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['manual-sessions', user?.tenantId],
    queryFn: () => apiClient.getManualSessions(user!.tenantId),
    enabled: !!user?.tenantId,
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiClient.createManualSession(user!.tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-sessions'] });
      setShowCreateModal(false);
      setNewSessionName('');
      setNewSessionDescription('');
    },
  });

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      createSessionMutation.mutate({
        name: newSessionName,
        description: newSessionDescription,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.completed;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const sessionList = sessions?.data?.sessions || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manual Testing Sessions</h1>
          <p className="mt-2 text-gray-600">
            Create and manage exploratory testing sessions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Session
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sessionList.map((session: any) => (
          <div
            key={session.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveSession(session)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                  {session.name}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                    session.status
                  )}`}
                >
                  {getStatusIcon(session.status)}
                  {session.status}
                </span>
              </div>

              {session.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {session.description}
                </p>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Steps</span>
                  <span className="font-medium text-gray-900">
                    {session.steps?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Started</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(session.startedAt)}
                  </span>
                </div>
                {session.completedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Completed</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(session.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t px-6 py-3 bg-gray-50">
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View Details →
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {sessionList.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <Play className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No manual sessions yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first manual testing session
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
                Create Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => setShowCreateModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Create Manual Session
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Name
                  </label>
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="e.g., Login Flow Testing"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                    placeholder="Describe what you'll be testing..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={!newSessionName.trim() || createSessionMutation.isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
