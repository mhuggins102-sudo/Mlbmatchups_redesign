export default function GameModeCard({ mode, icon, title, subtitle, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(mode)}
      className={`mode-card ${selected ? 'selected' : ''}`}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-2xl text-slate-300">{icon}</span>
        <div>
          <p className="font-bold text-sm text-white">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}
