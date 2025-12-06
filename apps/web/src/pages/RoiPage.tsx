import { DollarSign, Clock, TrendingUp, Users } from 'lucide-react';

interface RoiMetric {
  label: string;
  value: string;
  subtext: string;
  icon: typeof DollarSign;
  color: string;
}

const MOCK_ROI: RoiMetric[] = [
  { label: 'Cost Avoided', value: '$127,450', subtext: 'Last 30 days', icon: DollarSign, color: 'text-green-500' },
  { label: 'Hours Saved', value: '2,340 hrs', subtext: 'Manual testing reduction', icon: Clock, color: 'text-blue-500' },
  { label: 'Defects Prevented', value: '89', subtext: 'Before production', icon: TrendingUp, color: 'text-purple-500' },
  { label: 'Team Efficiency', value: '+34%', subtext: 'Developer velocity', icon: Users, color: 'text-orange-500' },
];

export default function RoiPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ROI Dashboard</h1>

      {/* ROI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {MOCK_ROI.map((m) => (
          <div
            key={m.label}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-500">{m.label}</span>
            </div>
            <div className="text-3xl font-bold">{m.value}</div>
            <div className="text-sm text-gray-500">{m.subtext}</div>
          </div>
        ))}
      </div>

      {/* DORA Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">DORA Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-4 border rounded-lg dark:border-gray-700">
            <div className="text-2xl font-bold text-green-500">12/day</div>
            <div className="text-sm text-gray-500">Deployment Frequency</div>
          </div>
          <div className="text-center p-4 border rounded-lg dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-500">45 min</div>
            <div className="text-sm text-gray-500">Lead Time for Changes</div>
          </div>
          <div className="text-center p-4 border rounded-lg dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-500">0.8%</div>
            <div className="text-sm text-gray-500">Change Failure Rate</div>
          </div>
          <div className="text-center p-4 border rounded-lg dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-500">28 min</div>
            <div className="text-sm text-gray-500">MTTR</div>
          </div>
        </div>
      </div>

      {/* ROI Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">Cost Savings Over Time</h2>
        <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
          ROI trend chart placeholder
        </div>
      </div>
    </div>
  );
}
