import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../stores/gameStore';
import { CUSTOM_STAT_OPTIONS, CUSTOM_PRESETS } from '../../engine/categories';

export default function CustomEligModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('presets');
  const [subTab, setSubTab] = useState('hitter');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [filters, setFilters] = useState([{ stat: '', value: '', dir: 'min' }]);
  const setCustomFilters = useGameStore((s) => s.setCustomFilters);
  const setPlayerPool = useGameStore((s) => s.setPlayerPool);
  const showToast = useGameStore((s) => s.showToast);

  const applyPreset = () => {
    if (!selectedPreset) { showToast('Select a preset first.', 'bg-red-500'); return; }
    const preset = CUSTOM_PRESETS.find((p) => p.id === selectedPreset);
    if (preset) {
      setCustomFilters(preset.filters.slice());
      setPlayerPool(preset.type === 'hitter' ? 'batters' : 'pitchers');
      showToast(`Preset applied: ${preset.name}`, 'bg-blue-600');
    }
    onClose();
  };

  const applyCustom = () => {
    const valid = filters.filter((f) => f.stat && f.value !== '');
    if (valid.length === 0) { showToast('Add at least one filter.', 'bg-red-500'); return; }
    setCustomFilters(valid.map((f) => ({ stat: f.stat, value: parseFloat(f.value), dir: f.dir })));
    showToast(`${valid.length} filter${valid.length > 1 ? 's' : ''} applied!`, 'bg-blue-600');
    onClose();
  };

  const addFilter = () => setFilters([...filters, { stat: '', value: '', dir: 'min' }]);
  const removeFilter = (i) => setFilters(filters.filter((_, idx) => idx !== i));
  const updateFilter = (i, key, val) => {
    const next = [...filters];
    next[i] = { ...next[i], [key]: val };
    if (key === 'stat') {
      const opt = CUSTOM_STAT_OPTIONS.find((o) => o.key === val);
      if (opt) next[i].dir = opt.dir;
    }
    setFilters(next);
  };

  if (!isOpen) return null;

  const presets = CUSTOM_PRESETS.filter((p) => p.type === subTab);

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="modal-card p-0" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h2 className="text-lg font-extrabold text-slate-100">Custom Eligibility</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8">&times;</button>
          </div>

          <div className="flex border-b border-slate-700/50">
            <button onClick={() => setTab('presets')} className={`flex-1 py-2.5 text-sm font-semibold transition ${tab === 'presets' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}>Presets</button>
            <button onClick={() => setTab('customize')} className={`flex-1 py-2.5 text-sm font-semibold transition ${tab === 'customize' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}>Customize</button>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {tab === 'presets' && (
              <>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => { setSubTab('hitter'); setSelectedPreset(null); }} className={`segment-btn ${subTab === 'hitter' ? 'active' : ''}`}>Hitters</button>
                  <button onClick={() => { setSubTab('pitcher'); setSelectedPreset(null); }} className={`segment-btn ${subTab === 'pitcher' ? 'active' : ''}`}>Pitchers</button>
                </div>
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id === selectedPreset ? null : preset.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedPreset === preset.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'}`}
                    >
                      <div className="font-extrabold text-sm text-slate-200">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                        {preset.filters.map((f) => {
                          const opt = CUSTOM_STAT_OPTIONS.find((o) => o.key === f.stat);
                          return `${opt?.label || f.stat} ${f.dir === 'max' ? '≤' : '≥'} ${f.value}`;
                        }).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={applyPreset} className="btn-primary mt-4 text-sm py-2.5">Apply Preset</button>
              </>
            )}

            {tab === 'customize' && (
              <>
                <div className="space-y-2">
                  {filters.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={f.stat} onChange={(e) => updateFilter(i, 'stat', e.target.value)} className="flex-1 min-w-0 h-10 bg-slate-800 border border-slate-700 rounded-lg px-2 text-xs font-semibold text-slate-300 truncate">
                        <option value="">Select stat...</option>
                        <optgroup label="Batters">
                          {CUSTOM_STAT_OPTIONS.filter((o) => o.type === 'hitter').map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                        </optgroup>
                        <optgroup label="Pitchers">
                          {CUSTOM_STAT_OPTIONS.filter((o) => o.type === 'pitcher').map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                        </optgroup>
                        <optgroup label="All Players">
                          {CUSTOM_STAT_OPTIONS.filter((o) => o.type === 'both').map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                        </optgroup>
                      </select>
                      <button onClick={() => updateFilter(i, 'dir', f.dir === 'min' ? 'max' : 'min')} className="w-10 h-10 flex items-center justify-center bg-slate-700 border border-slate-600 rounded-lg text-lg font-bold text-slate-200 hover:bg-blue-900/30 hover:text-blue-400 transition flex-shrink-0">
                        {f.dir === 'max' ? '≤' : '≥'}
                      </button>
                      <input type="number" step="any" placeholder="Value" value={f.value} onChange={(e) => updateFilter(i, 'value', e.target.value)} className="w-20 h-10 bg-slate-800 border border-slate-700 rounded-lg px-2 text-sm font-bold text-center text-slate-200" />
                      <button onClick={() => removeFilter(i)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition text-lg font-bold flex-shrink-0">&times;</button>
                    </div>
                  ))}
                </div>
                <button onClick={addFilter} className="mt-2 text-xs font-bold text-blue-400 hover:text-blue-300">+ Add Filter</button>
                <button onClick={applyCustom} className="btn-primary mt-4 text-sm py-2.5">Apply Filters</button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
