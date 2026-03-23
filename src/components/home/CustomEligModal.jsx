import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../stores/gameStore';
import { CUSTOM_STAT_OPTIONS, CUSTOM_PRESETS } from '../../engine/categories';

const TABS = ['Presets', 'Customize'];
const PRESET_SUBTABS = ['Hitter', 'Pitcher'];

function PresetCard({ preset, onApply }) {
  return (
    <button
      onClick={() => onApply(preset.filters)}
      className="w-full text-left p-3 rounded-lg hover:border-blue-500/30 transition-all"
      style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.3)' }}
    >
      <div className="text-sm font-semibold text-slate-200">{preset.name}</div>
      <div className="text-xs text-slate-400 mt-0.5">{preset.desc}</div>
      <div className="text-[10px] text-slate-500 mt-1 font-semibold">
        {preset.filters.map((f) => {
          const opt = CUSTOM_STAT_OPTIONS.find((o) => o.key === f.stat);
          return `${opt?.label || f.stat} ${f.dir === 'max' ? '\u2264' : '\u2265'} ${f.value}`;
        }).join(', ')}
      </div>
    </button>
  );
}

function FilterRow({ filter, index, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      {/* Stat dropdown */}
      <select
        value={filter.stat}
        onChange={(e) => onChange(index, { ...filter, stat: e.target.value })}
        className="flex-1 px-2 py-1.5 rounded-lg bg-surface-dark border border-slate-700/50 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
      >
        <option value="">Select stat...</option>
        <optgroup label="Batters">
          {CUSTOM_STAT_OPTIONS.filter((o) => o.type === 'hitter').map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </optgroup>
        <optgroup label="Pitchers">
          {CUSTOM_STAT_OPTIONS.filter((o) => o.type === 'pitcher').map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </optgroup>
        <optgroup label="All Players">
          {CUSTOM_STAT_OPTIONS.filter((o) => o.type === 'both').map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </optgroup>
      </select>

      {/* Direction toggle */}
      <button
        onClick={() => onChange(index, { ...filter, dir: filter.dir === 'min' ? 'max' : 'min' })}
        className="px-2 py-1.5 rounded-lg bg-surface-dark border border-slate-700/50 text-xs font-bold text-slate-200 hover:border-blue-500/50 transition-colors min-w-[2rem] text-center"
      >
        {filter.dir === 'min' ? '\u2265' : '\u2264'}
      </button>

      {/* Value input */}
      <input
        type="number"
        value={filter.value}
        onChange={(e) => onChange(index, { ...filter, value: parseFloat(e.target.value) || 0 })}
        className="w-20 px-2 py-1.5 rounded-lg bg-surface-dark border border-slate-700/50 text-xs text-slate-200 focus:outline-none focus:border-blue-500 tabular-nums"
        step="any"
      />

      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        className="text-slate-500 hover:text-red-400 transition-colors text-sm leading-none px-1"
      >
        &times;
      </button>
    </div>
  );
}

export default function CustomEligModal({ isOpen, onClose }) {
  const customFilters = useGameStore((s) => s.customFilters);
  const setCustomFilters = useGameStore((s) => s.setCustomFilters);
  const setEligibility = useGameStore((s) => s.setEligibility);
  const showToast = useGameStore((s) => s.showToast);

  const [tab, setTab] = useState('Presets');
  const [presetSubtab, setPresetSubtab] = useState('Hitter');
  const [filters, setFilters] = useState(() =>
    customFilters.length > 0
      ? customFilters.map((f) => ({ ...f }))
      : [{ stat: '', dir: 'min', value: 0 }]
  );

  const handleFilterChange = (index, updated) => {
    const next = [...filters];
    next[index] = updated;
    // Auto-set direction when stat is selected
    if (updated.stat && updated.stat !== filters[index]?.stat) {
      const opt = CUSTOM_STAT_OPTIONS.find((o) => o.key === updated.stat);
      if (opt) next[index].dir = opt.dir;
    }
    setFilters(next);
  };

  const handleRemoveFilter = (index) => {
    const next = filters.filter((_, i) => i !== index);
    if (next.length === 0) next.push({ stat: '', dir: 'min', value: 0 });
    setFilters(next);
  };

  const handleAddFilter = () => {
    setFilters([...filters, { stat: '', dir: 'min', value: 0 }]);
  };

  const handleApplyPreset = (presetFilters) => {
    const mapped = presetFilters.map((f) => ({
      stat: f.stat,
      dir: f.dir,
      value: f.value,
    }));
    setCustomFilters(mapped);
    setEligibility('custom');
    onClose();
  };

  const handleApplyCustom = () => {
    const valid = filters.filter((f) => f.stat);
    if (valid.length === 0) {
      showToast('Add at least one filter', 'bg-red-600');
      return;
    }
    setCustomFilters(valid);
    setEligibility('custom');
    onClose();
  };

  const filteredPresets = CUSTOM_PRESETS.filter(
    (p) => p.type === presetSubtab.toLowerCase()
  );

  if (!isOpen) return null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white">Custom Eligibility</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-raised/50 rounded-xl p-1 mx-4 mt-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`segment-btn flex-1 ${tab === t ? 'active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '55vh' }}>
          {tab === 'Presets' ? (
            <>
              {/* Preset subtabs */}
              <div className="flex bg-surface-raised/50 rounded-xl p-1 mb-3">
                {PRESET_SUBTABS.map((st) => (
                  <button
                    key={st}
                    onClick={() => setPresetSubtab(st)}
                    className={`segment-btn flex-1 ${presetSubtab === st ? 'active' : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Preset cards */}
              <div className="space-y-2">
                {filteredPresets.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-xs">No presets for this type</div>
                ) : (
                  filteredPresets.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      onApply={handleApplyPreset}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Custom filter rows */}
              <div className="space-y-2 mb-3">
                {filters.map((filter, i) => (
                  <FilterRow
                    key={i}
                    filter={filter}
                    index={i}
                    onChange={handleFilterChange}
                    onRemove={handleRemoveFilter}
                  />
                ))}
              </div>

              {/* Add filter */}
              <button
                onClick={handleAddFilter}
                className="w-full py-2 rounded-lg border border-dashed border-slate-600 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-400 transition-colors mb-4"
              >
                + Add Filter
              </button>

              {/* Apply button */}
              <button
                onClick={handleApplyCustom}
                disabled={!filters.some((f) => f.stat)}
                className="btn-primary text-sm !py-2.5"
              >
                Apply
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
