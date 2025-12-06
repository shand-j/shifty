import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';

export default function TestsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tests</h1>
        <Link
          to="/tests/generate"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          Generate Tests
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tests..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Test List Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
        <div className="p-8 text-center text-gray-500">
          <p>No tests yet. Generate your first test suite!</p>
        </div>
      </div>
    </div>
  );
}
