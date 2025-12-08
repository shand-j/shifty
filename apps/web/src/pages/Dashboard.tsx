import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth';
import { apiClient } from '../services/api';
import { Activity, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuthStore();

  const { data: qualityInsights, isLoading } = useQuery({
    queryKey: ['quality-insights', user?.tenantId],
    queryFn: () => apiClient.getQualityInsights(user!.tenantId),
    enabled: !!user?.tenantId,
  });

  // Use quality insights for future enhancements
  console.debug('Quality insights:', qualityInsights);

  const stats = [
    {
      name: 'Active Sessions',
      value: '12',
      change: '+2.5%',
      icon: Activity,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'Tests Passed',
      value: '847',
      change: '+12.3%',
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'Tests Failed',
      value: '23',
      change: '-5.4%',
      icon: XCircle,
      color: 'text-red-600 bg-red-100',
    },
    {
      name: 'Avg. Session Time',
      value: '24m',
      change: '-8.1%',
      icon: Clock,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your testing platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 text-left hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Start Manual Session</p>
                <p className="text-sm text-gray-500">Begin exploratory testing</p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 text-left hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Generate Tests</p>
                <p className="text-sm text-gray-500">AI-powered test creation</p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 text-left hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View HITL Missions</p>
                <p className="text-sm text-gray-500">Complete micro-tasks</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Manual session completed
                    </p>
                    <p className="text-sm text-gray-500">Login flow test - 15 steps</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
