import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, GitBranch } from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  branch: string;
  status: 'success' | 'failed' | 'running';
  duration: string;
  timestamp: string;
}

const MOCK_PIPELINES: Pipeline[] = [
  { id: '1', name: 'main', branch: 'main', status: 'success', duration: '4m 32s', timestamp: '5 min ago' },
  { id: '2', name: 'feature/auth', branch: 'feature/auth', status: 'running', duration: '2m 15s', timestamp: '10 min ago' },
  { id: '3', name: 'fix/login-bug', branch: 'fix/login-bug', status: 'failed', duration: '1m 45s', timestamp: '1 hour ago' },
];

const StatusIcon = ({ status }: { status: Pipeline['status'] }) => {
  if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-500" />;
  if (status === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
  return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
};

export default function PipelinesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">CI/CD Pipelines</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Branch</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Duration</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {MOCK_PIPELINES.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3">
                  <StatusIcon status={p.status} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/pipelines/${p.id}`}
                    className="flex items-center gap-2 text-brand-500 hover:underline"
                  >
                    <GitBranch className="w-4 h-4" />
                    {p.branch}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.duration}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
