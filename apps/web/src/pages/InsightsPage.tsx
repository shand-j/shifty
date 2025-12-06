import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  change: string;
}

const MOCK_METRICS: Metric[] = [
  { label: 'Test Pass Rate', value: '94.2%', trend: 'up', change: '+2.1%' },
  { label: 'Avg Execution Time', value: '4m 32s', trend: 'down', change: '-12%' },
  { label: 'Flaky Test Count', value: '7', trend: 'down', change: '-3' },
  { label: 'Code Coverage', value: '78.5%', trend: 'up', change: '+1.2%' },
];

export default function InsightsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quality Insights</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {MOCK_METRICS.map((m) => (
          <div
            key={m.label}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{m.label}</span>
              {m.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : m.trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Activity className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="text-2xl font-bold">{m.value}</div>
            <div
              className={`text-sm ${
                m.trend === 'up' ? 'text-green-500' : m.trend === 'down' ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {m.change} from last week
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Pass Rate Trend</h2>
          <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
            Chart placeholder
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Test Execution Heatmap</h2>
          <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
            Heatmap placeholder
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <div>
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">Degradation Alert</h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-300">
              3 tests have shown increased flakiness in the last 48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
