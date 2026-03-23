import { create } from 'zustand';

const usePlayerStore = create((set, get) => ({
  players: new Map(),
  batSeasons: new Map(),
  pitSeasons: new Map(),
  warBatMap: new Map(),
  warPitMap: new Map(),
  warLoaded: { bat: false, pit: false },
  playerNameIndex: [],
  decadeStatsCache: new Map(),
  loading: true,
  loadProgress: 0,

  setLoading: (loading) => set({ loading }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),

  setData: (data) => set({
    players: data.players,
    batSeasons: data.batSeasons,
    pitSeasons: data.pitSeasons,
    warBatMap: data.warBatMap,
    warPitMap: data.warPitMap,
    warLoaded: data.warLoaded || { bat: true, pit: true },
    loading: false,
  }),

  setPlayerNameIndex: (index) => set({ playerNameIndex: index }),

  getDecadeStats: (decade) => {
    return get().decadeStatsCache.get(decade);
  },

  setDecadeStats: (decade, stats) => {
    const cache = new Map(get().decadeStatsCache);
    cache.set(decade, stats);
    set({ decadeStatsCache: cache });
  },
}));

export default usePlayerStore;
