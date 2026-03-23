import React, { useRef, useCallback } from 'react';
import useGameStore from '../../../stores/gameStore';

function clamp(val, lo, hi) {
  return Math.min(hi, Math.max(lo, val));
}

export default function DualSlider({ disabled, bullseyeSize, answerValue }) {
  const sliderState = useGameStore((s) => s.sliderState);
  const updateSliderState = useGameStore((s) => s.updateSliderState);
  const deadZoneEnabled = useGameStore((s) => s.deadZoneEnabled);

  const { min, max, rangeMax, step, minLimit } = sliderState;
  const trackRef = useRef(null);
  const draggingRef = useRef(null); // 'min' | 'max' | null

  const toPercent = useCallback((val) => {
    return rangeMax > 0 ? (val / rangeMax) * 100 : 0;
  }, [rangeMax]);

  const fromPixel = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const raw = ratio * rangeMax;
    return Math.round(raw / step) * step;
  }, [rangeMax, step]);

  const handlePointerDown = useCallback((thumb) => (e) => {
    if (disabled) return;
    e.preventDefault();
    draggingRef.current = thumb;

    const onMove = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const val = fromPixel(clientX);
      if (draggingRef.current === 'min') {
        updateSliderState({ min: clamp(val, 0, max) });
      } else {
        updateSliderState({ max: clamp(val, min, rangeMax) });
      }
    };

    const onUp = () => {
      draggingRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }, [disabled, fromPixel, min, max, rangeMax, updateSliderState]);

  const adjustMin = (delta) => {
    if (disabled) return;
    updateSliderState({ min: clamp(min + delta * step, 0, max) });
  };

  const adjustMax = (delta) => {
    if (disabled) return;
    updateSliderState({ max: clamp(max + delta * step, min, rangeMax) });
  };

  const minPct = toPercent(min);
  const maxPct = toPercent(max);
  const deadZonePct = toPercent(minLimit);

  // Bullseye zone: centered on midpoint of user range
  const bw = bullseyeSize || 0;
  const mid = (min + max) / 2;
  const bullLeft = toPercent(Math.max(0, mid - bw / 2));
  const bullRight = toPercent(Math.min(rangeMax, mid + bw / 2));
  const showBullseye = bw > 0 && !disabled;

  // Answer pin after submission
  const answerPct = answerValue != null ? toPercent(clamp(answerValue, 0, rangeMax)) : null;

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {/* Value displays */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button className="btn-stepper" onClick={() => adjustMin(-1)} disabled={disabled}>−</button>
          <span style={{ fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
            {typeof min === 'number' && step < 1 ? min.toFixed(step < 0.01 ? 3 : 2) : Math.round(min)}
          </span>
          <button className="btn-stepper" onClick={() => adjustMin(1)} disabled={disabled}>+</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button className="btn-stepper" onClick={() => adjustMax(-1)} disabled={disabled}>−</button>
          <span style={{ fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
            {typeof max === 'number' && step < 1 ? max.toFixed(step < 0.01 ? 3 : 2) : Math.round(max)}
          </span>
          <button className="btn-stepper" onClick={() => adjustMax(1)} disabled={disabled}>+</button>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="slider-track"
        style={{
          position: 'relative',
          height: '8px',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.1)',
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        {/* Dead zone */}
        {deadZoneEnabled && deadZonePct > 0 && (
          <div
            className="slider-deadzone"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${deadZonePct}%`,
              background: 'rgba(239,68,68,0.25)',
              borderRadius: '4px 0 0 4px',
            }}
          />
        )}

        {/* Fill bar */}
        <div
          className="slider-fill"
          style={{
            position: 'absolute',
            left: `${minPct}%`,
            width: `${maxPct - minPct}%`,
            top: 0,
            height: '100%',
            background: 'rgba(59,130,246,0.5)',
            borderRadius: '4px',
          }}
        />

        {/* Bullseye zone */}
        {showBullseye && (
          <div
            className="slider-bullseye"
            style={{
              position: 'absolute',
              left: `${bullLeft}%`,
              width: `${bullRight - bullLeft}%`,
              top: 0,
              height: '100%',
              background: 'rgba(245, 158, 11, 0.6)',
              borderRadius: '4px',
              zIndex: 1,
            }}
          />
        )}

        {/* Answer pin after submit */}
        {answerPct != null && (
          <div
            className="slider-answer-pin"
            style={{
              position: 'absolute',
              left: `${answerPct}%`,
              top: '-4px',
              width: '3px',
              height: 'calc(100% + 8px)',
              background: '#10b981',
              borderRadius: '2px',
              transform: 'translateX(-50%)',
              zIndex: 40,
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
            }}
          />
        )}

        {/* Min thumb */}
        <div
          className="slider-thumb"
          onMouseDown={handlePointerDown('min')}
          onTouchStart={handlePointerDown('min')}
          style={{
            position: 'absolute',
            left: `${minPct}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#3b82f6',
            border: '2px solid #fff',
            cursor: disabled ? 'default' : 'grab',
            zIndex: 2,
          }}
        />

        {/* Max thumb */}
        <div
          className="slider-thumb"
          onMouseDown={handlePointerDown('max')}
          onTouchStart={handlePointerDown('max')}
          style={{
            position: 'absolute',
            left: `${maxPct}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#3b82f6',
            border: '2px solid #fff',
            cursor: disabled ? 'default' : 'grab',
            zIndex: 2,
          }}
        />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.7rem', opacity: 0.5 }}>
        {bw > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b', display: 'inline-block' }} />
            Bullseye
          </div>
        )}
        {deadZoneEnabled && deadZonePct > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(239,68,68,0.5)', display: 'inline-block' }} />
            Dead Zone
          </div>
        )}
      </div>
    </div>
  );
}
