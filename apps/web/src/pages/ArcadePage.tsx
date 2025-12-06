import { Gamepad2, Trophy, Star, Users } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  type: 'label' | 'review' | 'verify';
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Label login flow selectors', type: 'label', points: 50, difficulty: 'easy' },
  { id: '2', title: 'Review checkout healing suggestion', type: 'review', points: 100, difficulty: 'medium' },
  { id: '3', title: 'Verify flaky test root cause', type: 'verify', points: 200, difficulty: 'hard' },
];

const DifficultyBadge = ({ difficulty }: { difficulty: Task['difficulty'] }) => {
  const colors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
};

export default function ArcadePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-brand-500" />
          HITL Arcade
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
            <Star className="w-4 h-4" />
            <span className="font-bold">1,250</span>
            <span className="text-sm">points</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold">#12</div>
          <div className="text-sm text-gray-500">Leaderboard Rank</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
          <Star className="w-6 h-6 mx-auto mb-2 text-brand-500" />
          <div className="text-2xl font-bold">47</div>
          <div className="text-sm text-gray-500">Tasks Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">98%</div>
          <div className="text-sm text-gray-500">Accuracy Rate</div>
        </div>
      </div>

      {/* Task Queue */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="font-semibold">Available Tasks</h2>
        </div>
        <div className="divide-y dark:divide-gray-700">
          {MOCK_TASKS.map((task) => (
            <div
              key={task.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div>
                <h3 className="font-medium">{task.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 capitalize">{task.type}</span>
                  <DifficultyBadge difficulty={task.difficulty} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-brand-500">+{task.points}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
                <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
