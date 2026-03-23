import usePlayerStore from '../../stores/playerStore';

export default function LoadingScreen() {
  const loadProgress = usePlayerStore((s) => s.loadProgress);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface-dark z-50">
      {/* Spinning baseball */}
      <div className="mb-6">
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          className="animate-spin"
          style={{ animationDuration: '2s' }}
        >
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="40 20"
            strokeLinecap="round"
          />
          <circle
            cx="28"
            cy="28"
            r="16"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
            strokeDasharray="12 8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="text-slate-300 text-sm font-medium mb-4">Loading stats...</p>

      {/* Progress bar */}
      <div className="w-48 h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${loadProgress}%` }}
        />
      </div>
      <p className="text-slate-500 text-xs mt-2">{Math.round(loadProgress)}%</p>
    </div>
  );
}
