import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface Stage {
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  duration: string;
}

const MOCK_STAGES: Stage[] = [
  { name: 'Build', status: 'success', duration: '45s' },
  { name: 'Unit Tests', status: 'success', duration: '1m 20s' },
  { name: 'Integration Tests', status: 'running', duration: '2m 15s' },
  { name: 'E2E Tests', status: 'pending', duration: '-' },
  { name: 'Deploy', status: 'pending', duration: '-' },
];

const StatusIcon = ({ status }: { status: Stage['status'] }) => {
  if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-500" />;
  if (status === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
  if (status === 'running') return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
  return <Clock className="w-5 h-5 text-gray-400" />;
};

export default function PipelineDetailPage() {
  const { pipelineId } = useParams<{ pipelineId: string }>();

  return (
    <div>
      <Link
        to="/pipelines"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Pipelines
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pipeline: {pipelineId}</h1>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
          <RefreshCw className="w-4 h-4" />
          Restart
        </button>
      </div>

      {/* Pipeline Stages */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">Stages</h2>
        <div className="flex items-center gap-4">
          {MOCK_STAGES.map((stage, idx) => (
            <div key={stage.name} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`p-3 rounded-lg ${
                    stage.status === 'success'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : stage.status === 'failed'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : stage.status === 'running'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <StatusIcon status={stage.status} />
                </div>
                <span className="mt-2 text-sm font-medium">{stage.name}</span>
                <span className="text-xs text-gray-500">{stage.duration}</span>
              </div>
              {idx < MOCK_STAGES.length - 1 && (
                <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logs Placeholder */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">Logs</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm h-64 overflow-y-auto">
          {`[12:34:56] Starting build...
[12:34:58] Installing dependencies...
[12:35:15] Dependencies installed.
[12:35:16] Compiling TypeScript...
[12:35:42] Build complete.
[12:35:43] Running unit tests...`}
        </pre>
      </div>
    </div>
  );
}
