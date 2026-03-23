import { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useGameStore from './stores/gameStore';
import usePlayerStore from './stores/playerStore';
import Header from './components/layout/Header';
import LoadingScreen from './components/layout/LoadingScreen';
import StartScreen from './components/home/StartScreen';
import GameScreen from './components/game/GameScreen';
import GameOverScreen from './components/results/GameOverScreen';

// Dynamic imports for data loading
const loadEngine = async () => {
  const [{ loadAllData }, { buildAgg, buildPlayerNameIndex }] = await Promise.all([
    import('./engine/dataLoader'),
    import('./engine/statsAggregator'),
  ]);
  return { loadAllData, buildAgg, buildPlayerNameIndex };
};

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);
  const setData = usePlayerStore((s) => s.setData);
  const setPlayerNameIndex = usePlayerStore((s) => s.setPlayerNameIndex);
  const setLoadProgress = usePlayerStore((s) => s.setLoadProgress);
  const showToast = useGameStore((s) => s.showToast);

  const initData = useCallback(async () => {
    try {
      const { loadAllData, buildAgg, buildPlayerNameIndex } = await loadEngine();
      const data = await loadAllData((progress) => setLoadProgress(progress));
      buildAgg(data.players, data.batSeasons, data.pitSeasons, data.warBatMap, data.warPitMap);
      const nameIndex = buildPlayerNameIndex(data.players);
      setData({
        ...data,
        warLoaded: { bat: data.warBatMap.size > 0, pit: data.warPitMap.size > 0 },
      });
      setPlayerNameIndex(nameIndex);
      setScreen('start');
    } catch (err) {
      console.error('Failed to load data:', err);
      showToast('Error loading stats. Please refresh.', 'bg-red-500');
      setScreen('start');
    }
  }, [setData, setPlayerNameIndex, setScreen, setLoadProgress, showToast]);

  useEffect(() => {
    initData();
  }, [initData]);

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {screen !== 'loading' && <Header />}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {screen === 'loading' && (
            <motion.div key="loading" {...pageVariants} transition={{ duration: 0.2 }}>
              <LoadingScreen />
            </motion.div>
          )}
          {screen === 'start' && (
            <motion.div key="start" {...pageVariants} transition={{ duration: 0.3 }}>
              <StartScreen />
            </motion.div>
          )}
          {screen === 'game' && (
            <motion.div key="game" {...pageVariants} transition={{ duration: 0.3 }} className="h-full">
              <GameScreen />
            </motion.div>
          )}
          {screen === 'gameover' && (
            <motion.div key="gameover" {...pageVariants} transition={{ duration: 0.3 }}>
              <GameOverScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Toast />
    </div>
  );
}

function Toast() {
  const toast = useGameStore((s) => s.toast);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`toast text-white ${toast.color}`}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
