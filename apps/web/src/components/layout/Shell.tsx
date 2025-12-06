import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, Persona } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import {
  LayoutDashboard,
  TestTube2,
  Wrench,
  PlayCircle,
  GitBranch,
  BarChart3,
  Gamepad2,
  Settings,
  Sun,
  Moon,
  LogOut,
  Search,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tests', icon: TestTube2, label: 'Tests' },
  { to: '/healing', icon: Wrench, label: 'Healing' },
  { to: '/sessions', icon: PlayCircle, label: 'Sessions' },
  { to: '/pipelines', icon: GitBranch, label: 'Pipelines' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/arcade', icon: Gamepad2, label: 'Arcade' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function personaOrder(persona: Persona): number[] {
  const orders: Record<Persona, number[]> = {
    qa: [3, 2, 1, 4, 5, 0, 6, 7],
    dev: [1, 4, 2, 0, 3, 5, 6, 7],
    po: [0, 5, 3, 1, 4, 2, 6, 7],
    designer: [0, 1, 3, 5, 2, 4, 6, 7],
    manager: [5, 0, 4, 1, 2, 3, 6, 7],
    gtm: [5, 0, 4, 3, 1, 2, 6, 7],
  };
  return orders[persona] ?? [0, 1, 2, 3, 4, 5, 6, 7];
}

export default function Shell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const orderedNav = personaOrder(user?.persona ?? 'dev').map((i) => NAV_ITEMS[i]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={clsx(
          'flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && <span className="font-bold text-lg text-brand-600">Shifty</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className={clsx('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {orderedNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-2 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search (Cmd+K)"
              className="w-full bg-transparent text-sm focus:outline-none placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-medium">
                {user?.name?.charAt(0) ?? 'U'}
              </div>
              {user && <span className="text-sm font-medium">{user.name}</span>}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
