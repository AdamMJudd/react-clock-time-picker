import { useState, useRef, useEffect } from 'react';
import './ClockTimePicker.css';

/* ==========================================================================
   SVG clock geometry constants
   ========================================================================== */
const CX = 120;   // SVG centre x
const CY = 120;   // SVG centre y
const R = 102;    // outer clock radius
const INNER_R = 26; // dead zone / hub radius
const LABEL_R = 80; // radius for hour number labels
const TICK_R = 94;  // inner edge of tick marks

/* ==========================================================================
   Geometry helpers
   ========================================================================== */

/** Convert clock-angle degrees (0 = 12 o'clock, clockwise) to { x, y }. */
function polarXY(r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/** Build an annular-wedge SVG path between startDeg and endDeg (15° slot). */
function wedgePath(startDeg, endDeg) {
  const p1 = polarXY(INNER_R, startDeg);
  const p2 = polarXY(R, startDeg);
  const p3 = polarXY(R, endDeg);
  const p4 = polarXY(INNER_R, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return (
    `M${p1.x.toFixed(2)},${p1.y.toFixed(2)} ` +
    `L${p2.x.toFixed(2)},${p2.y.toFixed(2)} ` +
    `A${R},${R} 0 ${large},1 ${p3.x.toFixed(2)},${p3.y.toFixed(2)} ` +
    `L${p4.x.toFixed(2)},${p4.y.toFixed(2)} ` +
    `A${INNER_R},${INNER_R} 0 ${large},0 ${p1.x.toFixed(2)},${p1.y.toFixed(2)}Z`
  );
}

/* ==========================================================================
   Time helpers
   ========================================================================== */

/**
 * Given a slot (0-47, each 7.5°) and isAM, return "HH:MM" 24-h string.
 * Slot 0 = 12:00, slot 4 = 1:00, … slot 44 = 11:00
 */
function slotToTime(slot, isAM) {
  const hourIndex = Math.floor(slot / 4); // 0-11  (0 → hour 12, 1 → hour 1 …)
  const minute    = (slot % 4) * 15;      // 0, 15, 30, 45
  const hour12    = hourIndex === 0 ? 12 : hourIndex;
  let   hour24;
  if (isAM) {
    hour24 = hour12 === 12 ? 0 : hour12;
  } else {
    hour24 = hour12 === 12 ? 12 : hour12 + 12;
  }
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Convert a 24-h "HH:MM" string to a 12-h display string, e.g. "09:30" → "9:30". */
function formatTo12h(timeStr) {
  if (!timeStr) return '';
  const m = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return timeStr;
  const h12 = parseInt(m[1], 10) % 12 || 12;
  return `${h12}:${m[2]}`;
}

/** Parse "HH:MM" into { slot, isAM } for pre-highlighting the selected time. */
function parseTimeToSlot(timeStr) {
  if (!timeStr) return null;
  const m = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h  = parseInt(m[1], 10);
  const mn = parseInt(m[2], 10);
  if (h > 23 || mn > 59) return null;
  const isAM     = h < 12;
  const hour12   = h % 12 || 12; // convert 0→12, 13→1, etc.
  const hourIdx  = hour12 === 12 ? 0 : hour12; // 0-11
  const minSlot  = Math.round(mn / 15) % 4;
  return { slot: hourIdx * 4 + minSlot, isAM };
}

/* ==========================================================================
   12 hour-label positions
   ========================================================================== */
const HOUR_LABELS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/* ==========================================================================
   Component
   ========================================================================== */
/**
 * ClockTimePicker
 *
 * Props:
 *   value          - current time string, e.g. "09:30" (24-h HH:MM)
 *   onChange       - callback(newValue: string)
 *   label          - display label shown inside the popover header
 *   id             - optional id forwarded to the text input
 *   className      - optional custom class for the outer wrapper container
 *   inputClassName - optional custom class for the text input
 *   buttonClassName- optional custom class for the clock toggle button
 *   placeholder    - optional placeholder text for the input
 *   disabled       - optional flag to disable the picker input and button
 */
export default function ClockTimePicker({
  value,
  onChange,
  label = 'Select Time',
  id,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  placeholder = 'e.g. 09:00',
  disabled = false
}) {
  const [open,     setOpen]     = useState(false);
  const [hover,    setHover]    = useState(null);   // { slot, isAM } | null
  const [flipped,  setFlipped]  = useState(false);
  const [flipping, setFlipping] = useState(false);  // CSS animation flag

  const svgRef     = useRef(null);
  const wrapperRef = useRef(null);

  /* Close popover on outside click ---------------------------------------- */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* -------------------------------------------------------------------------
     Map a mouse/touch event to { slot, isAM } using SVG coordinate system
  --------------------------------------------------------------------------- */
  function getSlotFromEvent(e) {
    const svg  = svgRef.current;
    if (!svg) return null;

    const rect  = svg.getBoundingClientRect();
    const sx    = 240 / rect.width;   // scale factor
    const sy    = 240 / rect.height;
    const mx    = (e.clientX - rect.left)  * sx;
    const my    = (e.clientY - rect.top)   * sy;
    const dx    = mx - CX;
    const dy    = my - CY;
    const dist  = Math.sqrt(dx * dx + dy * dy);

    if (dist < INNER_R || dist > R + 8) return null;

    // Angle from 12 o'clock, clockwise, range 0-360
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0)   angle += 360;
    if (angle >= 360) angle -= 360;

    // Snap to 15-min slot (7.5° each)
    const slot      = Math.round(angle / 7.5) % 48;
    const hourIndex = Math.floor(slot / 4); // 0-11 where 0 = the "12" position

    // AM/PM: left side (dx<0) = AM normally, right = PM; flip swaps this.
    // Exception: hour-12 (slot 0-3, hourIndex===0) sits on the top of the
    // divider so dx≈0. We always pin it to the RIGHT side so that:
    //   • Normal  (AM left):  12 right → PM → "12:00" (noon)
    //   • Flipped (PM left):  12 right → AM → "00:00" (midnight)
    const isLeft = dx < 0 && hourIndex !== 0;
    const isAM   = flipped ? !isLeft : isLeft;

    return { slot, isAM };
  }

  /* -------------------------------------------------------------------------
     SVG event handlers
  --------------------------------------------------------------------------- */
  function handleMouseMove(e) {
    if (disabled) return;
    const info = getSlotFromEvent(e);
    setHover(info);
  }
  function handleMouseLeave()  { setHover(null); }

  function handleSVGClick(e) {
    if (disabled) return;
    const info = getSlotFromEvent(e);
    if (!info) return;
    onChange(slotToTime(info.slot, info.isAM));
    setOpen(false);
  }

  /* -------------------------------------------------------------------------
     Flip button — smooth colour transition via state
  --------------------------------------------------------------------------- */
  function handleFlip() {
    if (disabled) return;
    setFlipping(true);
    setTimeout(() => {
      setFlipped(f => !f);
      setFlipping(false);
    }, 220);
  }

  /* -------------------------------------------------------------------------
     Derived display values
  --------------------------------------------------------------------------- */
  const selected     = parseTimeToSlot(value);
  const displaySlot  = hover ?? selected;
  const previewTime  = displaySlot ? slotToTime(displaySlot.slot, displaySlot.isAM) : (value || '');
  const periodIsAM   = displaySlot ? displaySlot.isAM : true;

  const hoverStart   = hover ? hover.slot * 7.5 : null;
  const hoverEnd     = hover ? (hover.slot + 1) * 7.5 : null;
  const selStart     = selected ? selected.slot * 7.5 : null;
  const selEnd       = selected ? (selected.slot + 1) * 7.5 : null;

  // Draw the hand from center toward the midpoint of the active slot
  const activeSlot   = hover ?? selected;
  const handAngle    = activeSlot ? (activeSlot.slot + 0.5) * 7.5 : null;
  const handEnd      = handAngle !== null ? polarXY(R * 0.72, handAngle) : null;

  /* -------------------------------------------------------------------------
     Render
  --------------------------------------------------------------------------- */
  return (
    <div className={`ctp-wrapper ${className}`} ref={wrapperRef}>
      {/* Visible text input + clock icon button */}
      <div className="ctp-input-row">
        <input
          id={id}
          className={`ctp-text-input ${inputClassName}`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => !disabled && setOpen(true)}
          autoComplete="off"
          disabled={disabled}
        />
        <button
          type="button"
          className={`ctp-clock-btn ${buttonClassName}`}
          onClick={() => !disabled && setOpen(o => !o)}
          title="Open clock picker"
          aria-label="Open clock picker"
          disabled={disabled}
        >
          🕐
        </button>
      </div>

      {/* Popover ------------------------------------------------------------ */}
      {open && !disabled && (
        <div className="ctp-popover" role="dialog" aria-label={`${label} clock picker`}>

          {/* Header */}
          <div className="ctp-header">
            <span className="ctp-label">{label}</span>
            {previewTime && (
              <div className="ctp-preview-block">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="ctp-preview">{formatTo12h(previewTime)}</span>
                  <span className={`ctp-period-indicator ${periodIsAM ? 'ctp-period-am' : 'ctp-period-pm'}`}>
                    {periodIsAM ? 'AM' : 'PM'}
                  </span>
                </div>
                <span className="ctp-preview-24h">{previewTime}</span>
              </div>
            )}
          </div>

          {/* SVG Clock face */}
          <div className={`ctp-svg-wrapper${flipping ? ' flipping' : ''}`}>
            <svg
              ref={svgRef}
              viewBox="0 0 240 240"
              className="ctp-svg"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleSVGClick}
            >
              {/* Background disc */}
              <circle cx={CX} cy={CY} r={R} className="ctp-circle-bg" />

              {/* AM half — left semicircle (sweep=0 = counterclockwise arc) */}
              <path
                className={`ctp-half ${flipped ? 'ctp-half-pm' : 'ctp-half-am'}`}
                d={`M${CX},${CY - R} A${R},${R} 0 0,0 ${CX},${CY + R} L${CX},${CY}Z`}
              />

              {/* PM half — right semicircle (sweep=1 = clockwise arc) */}
              <path
                className={`ctp-half ${flipped ? 'ctp-half-am' : 'ctp-half-pm'}`}
                d={`M${CX},${CY - R} A${R},${R} 0 0,1 ${CX},${CY + R} L${CX},${CY}Z`}
              />

              {/* Selected slot wedge (shown when a value is already set) */}
              {selected && selStart !== null && (
                <path
                  d={wedgePath(selStart, selEnd)}
                  className="ctp-selected-wedge"
                />
              )}

              {/* Hover slot wedge (shown while hovering — overlays selected) */}
              {hover && hoverStart !== null && (
                <path
                  d={wedgePath(hoverStart, hoverEnd)}
                  className="ctp-hover-wedge"
                />
              )}

              {/* Clock outline */}
              <circle cx={CX} cy={CY} r={R} className="ctp-circle-outline" />

              {/* Minute tick marks (48 ticks at 7.5° intervals) */}
              {Array.from({ length: 48 }, (_, i) => {
                const a    = i * 7.5;
                const outer = polarXY(R - 1, a);
                const inner = polarXY(TICK_R, a);
                const isHour = i % 4 === 0;
                return (
                  <line
                    key={i}
                    x1={inner.x} y1={inner.y}
                    x2={outer.x} y2={outer.y}
                    className="ctp-tick"
                    strokeWidth={isHour ? 2 : 1}
                    opacity={isHour ? 0.5 : 0.25}
                  />
                );
              })}

              {/* Vertical divider between AM / PM */}
              <line
                x1={CX} y1={CY - R}
                x2={CX} y2={CY + R}
                className="ctp-divider"
              />

              {/* AM / PM period labels — swap content when flipped */}
              <text x={CX - 34} y={CY + 4} className="ctp-period-text" dominantBaseline="middle" textAnchor="middle">{flipped ? 'PM' : 'AM'}</text>
              <text x={CX + 34} y={CY + 4} className="ctp-period-text" dominantBaseline="middle" textAnchor="middle">{flipped ? 'AM' : 'PM'}</text>

              {/* Hour number labels */}
              {HOUR_LABELS.map((h, i) => {
                const { x, y } = polarXY(LABEL_R, i * 30);
                return (
                  <text
                    key={h}
                    x={x} y={y}
                    className="ctp-hour-label"
                    dominantBaseline="middle"
                    textAnchor="middle"
                  >
                    {h}
                  </text>
                );
              })}

              {/* Time-hand indicator */}
              {handEnd && (
                <line
                  x1={CX} y1={CY}
                  x2={handEnd.x} y2={handEnd.y}
                  className="ctp-hand"
                />
              )}

              {/* Centre hub */}
              <circle cx={CX} cy={CY} r={INNER_R} className="ctp-inner-circle" />
              <circle cx={CX} cy={CY} r={4} fill="var(--ctp-primary-color, #38bdf8)" />
            </svg>
          </div>

          {/* Footer buttons */}
          <div className="ctp-footer">
            <button type="button" className="ctp-flip-btn" onClick={handleFlip}>
              ⇄ Flip AM/PM
            </button>
            <button type="button" className="ctp-close-btn" onClick={() => setOpen(false)}>
              ✕ Close
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
