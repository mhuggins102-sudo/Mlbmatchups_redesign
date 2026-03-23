import { useEffect, useRef } from 'react';
import useGameStore from '../../stores/gameStore';

export default function SettingsPopover({ onClose }) {
  const darkMode = useGameStore((s) => s.darkMode);
  const useWholeNumbers = useGameStore((s) => s.useWholeNumbers);
  const useAnimations = useGameStore((s) => s.useAnimations);
  const deadZoneEnabled = useGameStore((s) => s.deadZoneEnabled);
  const toggleDarkMode = useGameStore((s) => s.toggleDarkMode);
  const toggleWholeNumbers = useGameStore((s) => s.toggleWholeNumbers);
  const toggleAnimations = useGameStore((s) => s.toggleAnimations);
  const toggleDeadZone = useGameStore((s) => s.toggleDeadZone);

  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const clearScreenName = () => {
    localStorage.removeItem('screenName');
    useGameStore.getState().showToast('Screen name cleared');
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-56 glass-card p-3 z-50"
    >
      <div className="flex flex-col gap-2">
        <ToggleRow
          icon={
            darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )
          }
          label="Theme"
          active={darkMode}
          onToggle={toggleDarkMode}
        />
        <ToggleRow
          icon={
            <span className="text-xs font-bold" style={{ lineHeight: 1 }}>
              {useWholeNumbers ? '123' : '.12'}
            </span>
          }
          label="Number Format"
          active={useWholeNumbers}
          onToggle={toggleWholeNumbers}
        />
        <ToggleRow
          icon={
            <span className="text-xs font-bold" style={{ lineHeight: 1 }}>
              {useAnimations ? 'ON' : 'OFF'}
            </span>
          }
          label="Animations"
          active={useAnimations}
          onToggle={toggleAnimations}
        />
        <ToggleRow
          icon={
            <span className="text-xs font-bold" style={{ lineHeight: 1 }}>
              {deadZoneEnabled ? 'ON' : 'OFF'}
            </span>
          }
          label="Dead Zone"
          active={deadZoneEnabled}
          onToggle={toggleDeadZone}
        />
        <button
          onClick={clearScreenName}
          className="w-full text-left text-sm text-slate-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          Clear Screen Name
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ icon, label, active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <span className="w-5 h-5 flex items-center justify-center text-slate-400">
          {icon}
        </span>
        {label}
      </div>
      <div
        className={`w-9 h-5 rounded-full relative transition-colors ${
          active ? 'bg-blue-500' : 'bg-slate-600'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            active ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}
