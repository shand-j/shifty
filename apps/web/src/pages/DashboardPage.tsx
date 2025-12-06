import { useAuthStore, Persona } from '@/stores/auth';

// Placeholder widgets by persona
const PERSONA_WIDGETS: Record<Persona, { title: string; description: string }[]> = {
  po: [
    { title: 'Release Readiness', description: 'Pass rate & risk score' },
    { title: 'Quality Constraints', description: 'Risky changes in sprint' },
    { title: 'Manual Session Queue', description: 'Pending sessions' },
    { title: 'Customer Feedback', description: 'Production errors by feature' },
  ],
  dev: [
    { title: 'My PRs Quality', description: 'Test results per PR' },
    { title: 'Fast Feedback', description: 'Latest CI run' },
    { title: 'Test Generation', description: 'Generate tests from requirements' },
    { title: 'Flakiness Radar', description: 'Top flaky tests' },
  ],
  qa: [
    { title: 'Active Sessions', description: 'Live manual sessions' },
    { title: 'Healing Queue', description: 'Selectors awaiting review' },
    { title: 'Quality Scorecard', description: 'Pass rate & coverage' },
    { title: 'Degradation Alerts', description: 'Predicted regressions' },
  ],
  designer: [
    { title: 'Design-to-Test', description: 'Figma → test plans' },
    { title: 'Accessibility Audit', description: 'axe/lighthouse scores' },
    { title: 'UX Outcomes', description: 'Journey completion rates' },
  ],
  manager: [
    { title: 'ROI Summary', description: 'Time saved & cost avoided' },
    { title: 'DORA Metrics', description: 'Deploy freq, lead time, MTTR' },
    { title: 'SPACE Health', description: 'Team satisfaction & efficiency' },
    { title: 'Leaderboard', description: 'Top contributors' },
  ],
  gtm: [
    { title: 'Upcoming Releases', description: 'Quality confidence %' },
    { title: 'Customer Issues', description: 'Incidents by product area' },
    { title: 'Feature Flags', description: 'Rollout status' },
  ],
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const persona: Persona = user?.persona ?? 'dev';
  const widgets = PERSONA_WIDGETS[persona];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-500 mb-4">
        Welcome back, {user?.name ?? 'User'}! Your persona: <strong className="capitalize">{persona}</strong>
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {widgets.map((w) => (
          <div
            key={w.title}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">{w.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{w.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
