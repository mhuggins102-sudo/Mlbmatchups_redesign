import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // Screen state
  screen: 'loading', // 'loading' | 'start' | 'game' | 'gameover'
  setScreen: (screen) => set({ screen }),

  // Game settings
  gameMode: 'howMuch', // 'howMuch' | 'sideBySide' | 'pickEm' | 'top10'
  playerPool: 'all', // 'all' | 'batters' | 'pitchers'
  eligibility: 'standard', // 'standard' | 'allStar' | 'hof' | 'custom'
  customFilters: [],
  eraMode: 'modern', // 'allEras' | 'modern' | 'select'
  selectedDecade: null,

  setGameMode: (mode) => set({ gameMode: mode }),
  setPlayerPool: (pool) => set({ playerPool: pool }),
  setEligibility: (elig) => set({ eligibility: elig }),
  setCustomFilters: (filters) => set({ customFilters: filters }),
  setEraMode: (mode) => set({ eraMode: mode }),
  setSelectedDecade: (decade) => set({ selectedDecade: decade }),

  // Preferences
  useWholeNumbers: false,
  useAnimations: localStorage.getItem('useAnimations') !== 'false',
  deadZoneEnabled: localStorage.getItem('deadZoneEnabled') !== 'false',
  darkMode: localStorage.getItem('darkMode') !== 'disabled',

  toggleWholeNumbers: () => set((s) => ({ useWholeNumbers: !s.useWholeNumbers })),
  toggleAnimations: () => {
    const next = !get().useAnimations;
    localStorage.setItem('useAnimations', next);
    set({ useAnimations: next });
  },
  toggleDeadZone: () => {
    const next = !get().deadZoneEnabled;
    localStorage.setItem('deadZoneEnabled', next);
    set({ deadZoneEnabled: next });
  },
  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorage.setItem('darkMode', next ? 'enabled' : 'disabled');
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    set({ darkMode: next });
  },

  // Game progress
  score: 0,
  round: 1,
  roundResults: [],
  roundScores: [],
  matchHistory: [],
  categoryHistory: {},
  usedPlayerIDs: new Set(),
  hasUsedReroll: false,
  hasUsedBomb: false,
  bombArmed: false,
  bombReplacesLeft: 0,

  // How Much state
  currentRound: null, // { catKey, playerA, playerB, trueDiff }
  versusPick: null,
  sliderState: { min: 0, max: 0, rangeMax: 100, step: 1, minLimit: 0, visualMin: 0 },
  roundSubmitted: false,
  lastRoundScore: 0,
  lastRoundFeedback: '',

  // Showdown state
  sbsPicks: new Array(10).fill(null),

  // Pick Em state
  pickEmState: {
    threshold: 0,
    correctIDs: new Set(),
    picksMade: 0,
    totalRoundPts: 0,
    lastVal: null,
    chainActive: true,
    chainCount: 0,
    roundOver: false,
    gridPlayers: [],
    catKey: null,
    subRole: 'all',
    playerStates: {}, // id -> 'selected'|'correct'|'incorrect'|'skipped'
  },

  // Top 10 state
  top10State: {
    answer: [],
    guessesLeft: 10,
    revealedPositions: new Set(),
    hitCount: 0,
    question: null,
    roundOver: false,
    guessedPlayerIDs: new Set(),
  },

  // Challenge state
  challengeQueue: [],
  currentChallengeId: null,
  challengerScore: null,
  challengerRoundScores: null,
  challengerName: null,
  isPlayingChallenge: false,
  isDailyChallenge: false,
  savedToMainLB: false,

  // Toast
  toast: null,
  showToast: (message, color = 'bg-blue-600') => {
    set({ toast: { message, color } });
    setTimeout(() => set({ toast: null }), 3000);
  },

  // Actions
  addScore: (pts) => set((s) => ({ score: s.score + pts })),

  setVersusPick: (pick) => set({ versusPick: pick }),
  setSliderState: (state) => set({ sliderState: state }),
  updateSliderState: (partial) => set((s) => ({ sliderState: { ...s.sliderState, ...partial } })),

  setSbsPick: (index, pick) => set((s) => {
    const newPicks = [...s.sbsPicks];
    newPicks[index] = pick;
    return { sbsPicks: newPicks };
  }),

  setPickEmState: (state) => set({ pickEmState: state }),
  updatePickEmState: (partial) => set((s) => ({ pickEmState: { ...s.pickEmState, ...partial } })),

  setTop10State: (state) => set({ top10State: state }),
  updateTop10State: (partial) => set((s) => ({ top10State: { ...s.top10State, ...partial } })),

  setCurrentRound: (round) => set({ currentRound: round, roundSubmitted: false, versusPick: null }),
  setRoundSubmitted: (submitted) => set({ roundSubmitted: submitted }),

  nextRound: () => set((s) => ({
    round: s.round + 1,
    roundSubmitted: false,
    versusPick: null,
    sbsPicks: new Array(10).fill(null),
    bombArmed: false,
    bombReplacesLeft: 0,
    currentRound: null,
  })),

  startNewGame: () => set((s) => ({
    screen: 'game',
    score: 0,
    round: 1,
    roundResults: [],
    roundScores: [],
    matchHistory: [],
    categoryHistory: {},
    usedPlayerIDs: new Set(),
    hasUsedReroll: false,
    hasUsedBomb: false,
    bombArmed: false,
    bombReplacesLeft: 0,
    currentRound: null,
    versusPick: null,
    roundSubmitted: false,
    sbsPicks: new Array(10).fill(null),
    lastRoundScore: 0,
    lastRoundFeedback: '',
    pickEmState: {
      threshold: 0, correctIDs: new Set(), picksMade: 0,
      totalRoundPts: 0, lastVal: null, chainActive: true, chainCount: 0,
      roundOver: false, gridPlayers: [], catKey: null, subRole: 'all', playerStates: {},
    },
    top10State: {
      answer: [], guessesLeft: 10, revealedPositions: new Set(),
      hitCount: 0, question: null, roundOver: false, guessedPlayerIDs: new Set(),
    },
    challengeQueue: s.challengeQueue,
    isPlayingChallenge: s.challengeQueue.length > 0,
  })),

  goHome: () => set({
    screen: 'start',
    challengeQueue: [],
    currentChallengeId: null,
    challengerScore: null,
    challengerRoundScores: null,
    challengerName: null,
    isPlayingChallenge: false,
    isDailyChallenge: false,
  }),

  endGame: () => set({ screen: 'gameover' }),

  pushRoundResult: (emoji, score) => set((s) => ({
    roundResults: [...s.roundResults, emoji],
    roundScores: [...s.roundScores, score],
  })),

  pushMatchHistory: (entry) => set((s) => ({
    matchHistory: [...s.matchHistory, entry],
  })),

  markRerollUsed: () => set({ hasUsedReroll: true }),
  markBombUsed: () => set({ hasUsedBomb: true }),
  armBomb: () => set({ bombArmed: true, bombReplacesLeft: 0 }),

  addUsedPlayerID: (id) => set((s) => {
    const next = new Set(s.usedPlayerIDs);
    next.add(id);
    return { usedPlayerIDs: next };
  }),

  updateCategoryHistory: (catKey) => set((s) => ({
    categoryHistory: { ...s.categoryHistory, [catKey]: (s.categoryHistory[catKey] || 0) + 1 },
  })),

  // Challenge loading
  loadChallenge: (data) => set({
    gameMode: data.config.mode,
    playerPool: data.config.pool === 'allStars' ? 'all' : (data.config.pool || 'all'),
    eligibility: data.config.elig || (data.config.pool === 'allStars' ? 'allStar' : 'standard'),
    customFilters: data.config.customFilters || [],
    eraMode: data.config.era,
    selectedDecade: data.config.decade,
    challengeQueue: data.matchups,
    currentChallengeId: data.id,
    challengerScore: data.config.score != null ? data.config.score : null,
    challengerRoundScores: data.config.roundScores || null,
    challengerName: data.config.challengerName || null,
  }),
}));

export default useGameStore;
