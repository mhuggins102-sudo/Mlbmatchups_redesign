import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchInput({ onSelect, filterFn, disabled }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter results when query changes
  useEffect(() => {
    if (!filterFn || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const matches = filterFn(query).slice(0, 8);
    setResults(matches);
    setIsOpen(matches.length > 0);
    setHighlightIdx(-1);
  }, [query, filterFn]);

  const selectPlayer = useCallback((player) => {
    if (disabled) return;
    onSelect(player);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setHighlightIdx(-1);
    if (inputRef.current) inputRef.current.focus();
  }, [onSelect, disabled]);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter') e.preventDefault();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < results.length) {
        selectPlayer(results[highlightIdx]);
      } else if (results.length > 0) {
        selectPlayer(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [isOpen, results, highlightIdx, selectPlayer]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightIdx]) {
        items[highlightIdx].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIdx]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        onBlur={() => { setTimeout(() => setIsOpen(false), 200); }}
        disabled={disabled}
        placeholder="Type a player name..."
        style={{
          width: '100%',
          padding: '0.65rem 0.85rem',
          borderRadius: '0.6rem',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)',
          color: 'inherit',
          fontSize: '0.9rem',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              background: 'rgba(30,30,40,0.98)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0.5rem',
              marginTop: '0.25rem',
              maxHeight: '260px',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {results.map((player, i) => (
              <div
                key={player.id}
                onMouseDown={(e) => { e.preventDefault(); selectPlayer(player); }}
                onMouseEnter={() => setHighlightIdx(i)}
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  background: i === highlightIdx ? 'rgba(59,130,246,0.2)' : 'transparent',
                  borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  {player.name}
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.5 }}>
                  {player.minYear}–{player.maxYear}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
