import { useAuthStore, Persona } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { Moon, Sun, User, Bell, Shield, Key } from 'lucide-react';

const PERSONAS: { value: Persona; label: string }[] = [
  { value: 'po', label: 'Product Owner' },
  { value: 'dev', label: 'Developer' },
  { value: 'qa', label: 'QA Engineer' },
  { value: 'designer', label: 'Designer' },
  { value: 'manager', label: 'Engineering Manager' },
  { value: 'gtm', label: 'GTM / Sales' },
];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { dark, toggle } = useThemeStore();

  const handlePersonaChange = (persona: Persona) => {
    if (user) {
      setUser({ ...user, persona });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={user?.name ?? ''}
                readOnly
                className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Persona</label>
              <select
                value={user?.persona ?? 'dev'}
                onChange={(e) => handlePersonaChange(e.target.value as Persona)}
                className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              >
                {PERSONAS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            {dark ? <Moon className="w-5 h-5 text-gray-500" /> : <Sun className="w-5 h-5 text-gray-500" />}
            <h2 className="font-semibold">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <span>Dark Mode</span>
            <button
              onClick={toggle}
              className={`w-12 h-6 rounded-full transition-colors ${
                dark ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  dark ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Email notifications</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-500 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span>Healing alerts</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-500 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span>Pipeline failures</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-500 rounded" />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold">Security</h2>
          </div>
          <div className="space-y-3">
            <button className="flex items-center gap-2 text-brand-500 hover:underline">
              <Key className="w-4 h-4" />
              Change Password
            </button>
            <button className="flex items-center gap-2 text-brand-500 hover:underline">
              <Shield className="w-4 h-4" />
              Enable Two-Factor Auth
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
