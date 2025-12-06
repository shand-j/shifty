import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Video, Pause, Square, MessageSquare, Bug, FileText } from 'lucide-react';

export default function SessionWorkspacePage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Link to="/sessions" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold">Session: {sessionId}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <Pause className="w-4 h-4" />
          </button>
          <button className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
        {/* Video/Screenshot Area */}
        <div className="col-span-2 bg-black rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Live preview will appear here</p>
        </div>

        {/* Session Tools */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Bug className="w-4 h-4 text-red-500" />
                Log Bug
              </button>
              <button className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                Add Note
              </button>
              <button className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <FileText className="w-4 h-4 text-green-500" />
                Snippet
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h3 className="font-semibold mb-3">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-400">00:00</span>
                <span>Session started</span>
              </div>
              <div className="text-gray-400 italic">No events yet...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
