import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wand2, FileText, Upload } from 'lucide-react';

type InputMode = 'text' | 'file' | 'figma';

export default function TestGeneratePage() {
  const [mode, setMode] = useState<InputMode>('text');
  const [input, setInput] = useState('');

  const handleGenerate = () => {
    // TODO: call test-generator service
    console.log('Generating tests for:', mode, input);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/tests"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tests
      </Link>

      <h1 className="text-2xl font-bold mb-6">Generate Tests</h1>

      {/* Input Mode Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'text' as const, icon: FileText, label: 'Requirements' },
          { key: 'file' as const, icon: Upload, label: 'Upload File' },
          { key: 'figma' as const, icon: Wand2, label: 'Figma URL' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              mode === key
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-4">
        {mode === 'text' && (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your user story, acceptance criteria, or requirements..."
            className="w-full h-48 p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700"
          />
        )}
        {mode === 'file' && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Drag & drop or click to upload</p>
            <p className="text-sm text-gray-400">Supports .feature, .md, .txt</p>
          </div>
        )}
        {mode === 'figma' && (
          <input
            type="url"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://www.figma.com/file/..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700"
          />
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!input.trim()}
        className="w-full py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wand2 className="w-4 h-4 inline mr-2" />
        Generate Test Suite
      </button>
    </div>
  );
}
