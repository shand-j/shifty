import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Edit, Trash2 } from 'lucide-react';

export default function TestDetailPage() {
  const { testId } = useParams<{ testId: string }>();

  return (
    <div>
      <Link
        to="/tests"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tests
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Test: {testId}</h1>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            <Play className="w-4 h-4" />
            Run
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Test Code */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2">Test Code</h2>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
            <code>{`// Test code will appear here
test('example test', async () => {
  // ...
});`}</code>
          </pre>
        </div>

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h2 className="font-semibold mb-4">Metadata</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium">Passing</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Last Run</dt>
              <dd className="font-medium">—</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Coverage</dt>
              <dd className="font-medium">—</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
