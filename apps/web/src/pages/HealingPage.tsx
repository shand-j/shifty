import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface HealingItem {
  id: string;
  testName: string;
  oldSelector: string;
  newSelector: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
}

const MOCK_ITEMS: HealingItem[] = [
  {
    id: '1',
    testName: 'Login flow test',
    oldSelector: '#login-btn',
    newSelector: 'button[data-testid="login-submit"]',
    confidence: 0.95,
    status: 'pending',
  },
  {
    id: '2',
    testName: 'Checkout test',
    oldSelector: '.checkout-button',
    newSelector: 'button:contains("Checkout")',
    confidence: 0.82,
    status: 'pending',
  },
];

export default function HealingPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Healing Queue</h1>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            {MOCK_ITEMS.filter((i) => i.status === 'pending').length} pending
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_ITEMS.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{item.testName}</h3>
                <p className="text-sm text-gray-500">
                  Confidence: {(item.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:text-brand-500 hover:bg-gray-100 rounded-lg">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-green-500 hover:bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-500 w-16">Old:</span>
                <code className="bg-red-50 text-red-700 px-2 py-1 rounded">
                  {item.oldSelector}
                </code>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-16">New:</span>
                <code className="bg-green-50 text-green-700 px-2 py-1 rounded">
                  {item.newSelector}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
