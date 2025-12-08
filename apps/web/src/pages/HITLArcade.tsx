import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth';
import { apiClient } from '../services/api';
import { Trophy, Star, Target, Clock, CheckCircle } from 'lucide-react';

export function HITLArcade() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['hitl-profile', user?.id],
    queryFn: () => apiClient.getHITLProfile(user!.id),
    enabled: !!user?.id,
  });

  const { data: missions } = useQuery({
    queryKey: ['hitl-missions', user?.tenantId, user?.id],
    queryFn: () => apiClient.getAvailableMissions(user!.tenantId, user!.id),
    enabled: !!user?.tenantId && !!user?.id,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['hitl-leaderboard', user?.tenantId],
    queryFn: () => apiClient.getLeaderboard(user!.tenantId),
    enabled: !!user?.tenantId,
  });

  const assignMissionMutation = useMutation({
    mutationFn: (missionId: string) => apiClient.assignMission(missionId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hitl-missions'] });
    },
  });

  const userProfile = profile?.data?.profile || {};
  const availableMissions = missions?.data?.missions || [];
  const leaderboardData = leaderboard?.data?.leaderboard || [];

  const getMissionTypeColor = (type: string) => {
    const colors = {
      validation: 'bg-blue-100 text-blue-800',
      labeling: 'bg-green-100 text-green-800',
      review: 'bg-purple-100 text-purple-800',
      testing: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HITL Arcade</h1>
        <p className="mt-2 text-gray-600">
          Complete missions, earn XP, and contribute to AI training datasets
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <Trophy className="h-8 w-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">Total XP</span>
          </div>
          <p className="mt-4 text-4xl font-bold">{userProfile.xp || 0}</p>
          <p className="mt-1 text-sm opacity-80">
            Level {userProfile.level || 1}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Completed</span>
          </div>
          <p className="mt-4 text-4xl font-bold text-gray-900">
            {userProfile.missionsCompleted || 0}
          </p>
          <p className="mt-1 text-sm text-gray-500">Missions</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <Star className="h-8 w-8 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">Accuracy</span>
          </div>
          <p className="mt-4 text-4xl font-bold text-gray-900">
            {userProfile.accuracy ? `${(userProfile.accuracy * 100).toFixed(1)}%` : 'N/A'}
          </p>
          <p className="mt-1 text-sm text-gray-500">Success Rate</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <Trophy className="h-8 w-8 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Rank</span>
          </div>
          <p className="mt-4 text-4xl font-bold text-gray-900">
            #{leaderboardData.findIndex((u: any) => u.userId === user?.id) + 1 || '-'}
          </p>
          <p className="mt-1 text-sm text-gray-500">This Week</p>
        </div>
      </div>

      {/* Available Missions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Available Missions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {availableMissions.map((mission: any) => (
              <div
                key={mission.id}
                className="border rounded-lg p-4 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {mission.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getMissionTypeColor(
                          mission.type
                        )}`}
                      >
                        {mission.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{mission.description}</p>

                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{mission.estimatedTime}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>+{mission.xpReward} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>Difficulty: {mission.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => assignMissionMutation.mutate(mission.id)}
                    disabled={assignMissionMutation.isPending}
                    className="ml-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}

            {availableMissions.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No missions available at the moment. Check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Leaderboard (This Week)</h2>
        </div>
        <div className="divide-y">
          {leaderboardData.slice(0, 10).map((entry: any, index: number) => (
            <div
              key={entry.userId}
              className={`px-6 py-4 flex items-center justify-between ${
                entry.userId === user?.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : index === 1
                      ? 'bg-gray-200 text-gray-800'
                      : index === 2
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {entry.userName || 'Anonymous'}
                    {entry.userId === user?.id && (
                      <span className="ml-2 text-sm text-indigo-600">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {entry.missionsCompleted} missions completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{entry.xp} XP</p>
                <p className="text-sm text-gray-500">Level {entry.level}</p>
              </div>
            </div>
          ))}

          {leaderboardData.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-600">
              No leaderboard data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
