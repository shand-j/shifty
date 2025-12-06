import { Link } from 'react-router-dom';
import { Plus, Video, Play, Pause, Square } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  tester: string;
  status: 'idle' | 'recording' | 'paused';
  duration: number;
}

const MOCK_SESSIONS: Session[] = [
  { id: '1', title: 'Mobile checkout flow', tester: 'Alice', status: 'recording', duration: 1245 },
  { id: '2', title: 'Admin panel exploration', tester: 'Bob', status: 'paused', duration: 892 },
  { id: '3', title: 'Onboarding flow', tester: 'Carol', status: 'idle', duration: 0 },
];

const formatDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function SessionsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manual Sessions</h1>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
          <Plus className="w-4 h-4" />
          New Session
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_SESSIONS.map((session) => (
          <Link
            key={session.id}
            to={`/sessions/${session.id}`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${
                  session.status === 'recording'
                    ? 'bg-red-100 text-red-500'
                    : session.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-500'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {session.status === 'recording' ? (
                  <Video className="w-5 h-5" />
                ) : session.status === 'paused' ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{session.title}</h3>
                <p className="text-sm text-gray-500">{session.tester}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span
                className={`capitalize ${
                  session.status === 'recording'
                    ? 'text-red-500'
                    : session.status === 'paused'
                      ? 'text-yellow-500'
                      : 'text-gray-500'
                }`}
              >
                {session.status}
              </span>
              <span className="text-gray-500">{formatDuration(session.duration)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
