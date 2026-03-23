import { useEffect, useRef } from 'react';
import useGameStore from '../../stores/gameStore';

const decades = [
  '2020s', '2010s', '2000s',
  '1990s', '1980s', '1970s',
  '1960s', '1950s', '1940s',
  '1930s',
];

export default function EraSelector({ isOpen, onClose }) {
  const eraMode = useGameStore((s) => s.eraMode);
  const selectedDecade = useGameStore((s) => s.selectedDecade);
  const setEraMode = useGameStore((s) => s.setEraMode);
  const setSelectedDecade = useGameStore((s) => s.setSelectedDecade);

  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectPreset = (mode) => {
    setEraMode(mode);
    setSelectedDecade(null);
    onClose();
  };

  const selectDecade = (decade) => {
    setEraMode('select');
    setSelectedDecade(decade);
    onClose();
  };

  const isPresetActive = (mode) => eraMode === mode && !selectedDecade;
  const isDecadeActive = (decade) => eraMode === 'select' && selectedDecade === decade;

  return (
    <div ref={ref} className="glass-card p-4 mt-2 w-full">
      {/* Preset options */}
      <div className="flex flex-col gap-1.5 mb-3">
        <button
          onClick={() => selectPreset('allEras')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isPresetActive('allEras')
              ? 'bg-blue-500/15 text-blue-400'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          All Eras
        </button>
        <button
          onClick={() => selectPreset('modern')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isPresetActive('modern')
              ? 'bg-blue-500/15 text-blue-400'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          Modern Era (1970s+)
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/50 mb-3" />

      {/* Decade grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {decades.map((decade) => (
          <button
            key={decade}
            onClick={() => selectDecade(decade)}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
              isDecadeActive(decade)
                ? 'bg-blue-500/15 text-blue-400'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {decade}
          </button>
        ))}
      </div>
    </div>
  );
}
