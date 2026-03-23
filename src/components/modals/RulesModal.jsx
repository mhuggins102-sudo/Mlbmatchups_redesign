import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  {
    title: 'How Much?',
    content: [
      'Two players are shown with a stat category. Pick who you think has the higher stat, then estimate the difference using the slider.',
      '',
      'Scoring:',
      '  Bullseye (exact): 1000 pts',
      '  Close (within tolerance): 400-800 pts',
      '  Correct direction: 100-400 pts',
      '  Wrong direction: 0 pts',
      '  Bonus multiplier for difficulty',
    ],
  },
  {
    title: 'Showdown',
    content: [
      'Two players are shown with 10 stat categories. For each category, pick which player has the better stat.',
      '',
      'Scoring:',
      '  Each correct pick: 50 pts',
      '  All 10 correct: 100 pt bonus',
      '  Max per round: 600 pts',
    ],
  },
  {
    title: "Pick 'Em",
    content: [
      'A stat and threshold are shown. From a grid of players, pick those who meet or beat the threshold.',
      '',
      'Scoring:',
      '  Correct pick: 75 pts',
      '  Incorrect pick: ends the round',
      '  Chain bonus: consecutive correct picks multiply score',
      '  Skip: move to next round (no penalty)',
    ],
  },
  {
    title: 'Top 10',
    content: [
      'Guess the top 10 players for a given stat. Type a player name and see if they appear in the ranking.',
      '',
      'Scoring:',
      '  #1: 200 pts, #2: 160 pts, #3: 130 pts',
      '  #4: 110 pts, #5: 90 pts, #6: 80 pts',
      '  #7: 70 pts, #8: 60 pts, #9-10: 50 pts each',
      '  10 guesses per round',
    ],
  },
  {
    title: 'Player Filtering',
    content: [
      'Pool: Choose All Players, Batters only, or Pitchers only.',
      '',
      'Tier (Eligibility):',
      '  Veteran: 8+ seasons played',
      '  All Star: 1+ All Star selections',
      '  Hall of Fame: inducted into the HOF',
      '  Custom: define your own stat filters',
      '',
      'Era:',
      '  Modern Era: 1970s onward',
      '  All Eras: every decade',
      '  Select Decade: choose a specific decade',
    ],
  },
  {
    title: 'Special Features',
    content: [
      'Reroll: Once per game, reroll the current round matchup.',
      '',
      'Bomb: Once per game, double the points for a round. Must be activated before submitting.',
      '',
      'Challenge: After a game, share a challenge code. Others play the exact same matchups and compare scores.',
      '',
      'Daily Challenge: A new seeded challenge every day with fixed settings. Compete on the daily leaderboard.',
    ],
  },
];

function ChevronIcon({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function RulesModal({ isOpen, onClose }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!isOpen) return null;

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

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
          <h2 className="text-lg font-bold text-white">How to Play</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: '65vh' }}>
          {sections.map((section, i) => (
            <div key={i} className="rounded-lg overflow-hidden" style={{ background: 'rgba(30,41,59,0.4)' }}>
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
              >
                <span>{section.title}</span>
                <ChevronIcon open={openIndex === i} />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3">
                      {section.content.map((line, j) =>
                        line === '' ? (
                          <div key={j} className="h-2" />
                        ) : (
                          <p key={j} className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                            {line}
                          </p>
                        )
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
