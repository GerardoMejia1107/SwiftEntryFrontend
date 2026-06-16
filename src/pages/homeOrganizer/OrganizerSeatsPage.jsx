import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrganizerSeatsPage.css';

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROWS = 10;
const COLS = 16;
const COLS_BLOCK = 8;
const ZOOM_STEP = 0.2;
const ZOOM_MIN = 1.5;
const ZOOM_MAX = 2.0;

const MOCK_EVENT = {
  type: 'LIVE CONCERT',
  name: 'Neon Horizon World Tour',
  venue: 'Grand Sphere Arena',
  date: 'Oct 24, 2024 · 8:00 PM',
};

const MOCK_LOCALITIES = [
  { id: 1, name: 'VIP',      color: '#8B5CF6' },
  { id: 2, name: 'Premium',  color: '#F59E0B' },
  { id: 3, name: 'General',  color: '#3B82F6' },
  { id: 4, name: 'Standing', color: '#10B981' },
];

function buildInitialGrid() {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({ id: `${r}-${c}`, localityId: null }))
  );
}

// ── Icons ──────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ResetIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
);

const EraseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20H7L3 16l11-11 6 6-3.5 3.5" /><path d="M6.5 17.5l10-10" />
  </svg>
);

export default function OrganizerSeatsPage() {
  const navigate = useNavigate();

  const [grid, setGrid] = useState(buildInitialGrid);
  const [activeLocalityId, setActiveLocalityId] = useState(MOCK_LOCALITIES[0].id);
  const [eraseMode, setEraseMode] = useState(false);
  const [zoom, setZoom] = useState(1.8);

  const seatLabel = (r, c) => `${ROW_LABELS[r]}${c + 1}`;

  const localityById = useMemo(
    () => Object.fromEntries(MOCK_LOCALITIES.map(l => [l.id, l])),
    []
  );

  const seatCounts = useMemo(() => {
    const counts = Object.fromEntries(MOCK_LOCALITIES.map(l => [l.id, 0]));
    grid.forEach(row =>
      row.forEach(seat => {
        if (seat.localityId !== null) counts[seat.localityId]++;
      })
    );
    return counts;
  }, [grid]);

  const totalAssigned = useMemo(
    () => Object.values(seatCounts).reduce((a, b) => a + b, 0),
    [seatCounts]
  );

  const handleSeatClick = useCallback((r, c) => {
    setGrid(prev => {
      const seat = prev[r][c];
      let newLocalityId;
      if (eraseMode) {
        newLocalityId = null;
      } else {
        newLocalityId = seat.localityId === activeLocalityId ? null : activeLocalityId;
      }
      return prev.map((row, ri) =>
        ri !== r ? row : row.map((s, ci) => (ci !== c ? s : { ...s, localityId: newLocalityId }))
      );
    });
  }, [activeLocalityId, eraseMode]);

  const handleClearAll = () => setGrid(buildInitialGrid());

  const zoomIn    = () => setZoom(z => Math.min(ZOOM_MAX, parseFloat((z + ZOOM_STEP).toFixed(1))));
  const zoomOut   = () => setZoom(z => Math.max(ZOOM_MIN, parseFloat((z - ZOOM_STEP).toFixed(1))));
  const zoomReset = () => setZoom(1.8);

  const leftSeats  = grid.flatMap((row, r) => row.slice(0, COLS_BLOCK).map((seat, c) => ({ seat, r, c })));
  const rightSeats = grid.flatMap((row, r) => row.slice(COLS_BLOCK).map((seat, c) => ({ seat, r, c: c + COLS_BLOCK })));

  return (
    <div className="oss-page">

      {/* ── Sidebar ── */}
      <aside className="oss-sidebar">
        <div className="oss-sidebar-header">
          <button
            type="button"
            className="oss-back-btn"
            onClick={() => navigate('/home-organizer/events')}
            aria-label="Back to events"
          >
            <BackIcon />
          </button>
          <span className="oss-header-title">Organize Seats</span>
        </div>

        <div className="oss-sidebar-body">

          {/* Event info */}
          <div className="oss-event-info">
            <span className="oss-event-type">{MOCK_EVENT.type}</span>
            <h2 className="oss-event-name">{MOCK_EVENT.name}</h2>
            <div className="oss-event-meta"><PinIcon />{MOCK_EVENT.venue}</div>
            <div className="oss-event-meta"><CalIcon />{MOCK_EVENT.date}</div>
          </div>

          {/* Localities */}
          <div className="oss-localities-section">
            <p className="oss-section-title">Localities</p>
            <p className="oss-section-hint">Select a locality, then click seats on the map to assign them.</p>

            <div className="oss-locality-list">
              {MOCK_LOCALITIES.map(loc => (
                <button
                  key={loc.id}
                  type="button"
                  className={`oss-locality-item ${activeLocalityId === loc.id && !eraseMode ? 'oss-locality-item--active' : ''}`}
                  onClick={() => { setActiveLocalityId(loc.id); setEraseMode(false); }}
                >
                  <span className="oss-locality-swatch" style={{ backgroundColor: loc.color }} />
                  <span className="oss-locality-name">{loc.name}</span>
                  <span className="oss-locality-count">{seatCounts[loc.id]}</span>
                </button>
              ))}

              <button
                type="button"
                className={`oss-locality-item oss-locality-item--erase ${eraseMode ? 'oss-locality-item--active' : ''}`}
                onClick={() => setEraseMode(e => !e)}
              >
                <span className="oss-locality-swatch oss-locality-swatch--erase"><EraseIcon /></span>
                <span className="oss-locality-name">Erase</span>
              </button>
            </div>
          </div>

          {/* Assignment summary */}
          <div className="oss-summary-section">
            <div className="oss-summary-header">
              <p className="oss-section-title">Summary</p>
              <span className="oss-total-badge">{totalAssigned} / {ROWS * COLS}</span>
            </div>

            <div className="oss-summary-list">
              {MOCK_LOCALITIES.map(loc => (
                <div key={loc.id} className="oss-summary-row">
                  <span className="oss-summary-dot" style={{ backgroundColor: loc.color }} />
                  <span className="oss-summary-name">{loc.name}</span>
                  <span className="oss-summary-seats">{seatCounts[loc.id]} seats</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="oss-sidebar-footer">
          <button type="button" className="oss-clear-btn" onClick={handleClearAll}>
            Clear all
          </button>
          <button type="button" className="oss-save-btn" disabled>
            Save Layout
          </button>
        </div>
      </aside>

      {/* ── Map area ── */}
      <main className="oss-map-area">

        <div className="oss-stage-wrap">
          <div className="oss-stage-bar" />
          <span className="oss-stage-label">STAGE FRONT</span>
        </div>

        <div className="oss-zoom-controls">
          <button className="oss-zoom-btn" onClick={zoomIn}  aria-label="Zoom in">+</button>
          <button className="oss-zoom-btn" onClick={zoomOut} aria-label="Zoom out">−</button>
          <button className="oss-zoom-btn" onClick={zoomReset} aria-label="Reset zoom"><ResetIcon /></button>
        </div>

        <div className="oss-grid-viewport">
          <div className="oss-grid-scaler" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>

            {/* Column number header */}
            <div className="oss-col-header">
              <span className="oss-col-header-spacer" />
              <div className="oss-col-nums">
                {Array.from({ length: COLS_BLOCK }, (_, i) => (
                  <span key={i} className="oss-col-num">{i + 1}</span>
                ))}
              </div>
              <span className="oss-aisle-header" />
              <div className="oss-col-nums">
                {Array.from({ length: COLS_BLOCK }, (_, i) => (
                  <span key={i} className="oss-col-num">{i + COLS_BLOCK + 1}</span>
                ))}
              </div>
              <span className="oss-col-header-spacer" />
            </div>

            {/* Main grid */}
            <div className="oss-matrix">

              <div className="oss-row-labels">
                {ROW_LABELS.map(l => <span key={l} className="oss-row-label">{l}</span>)}
              </div>

              <div className="oss-block">
                {leftSeats.map(({ seat, r, c }) => {
                  const loc = seat.localityId !== null ? localityById[seat.localityId] : null;
                  return (
                    <button
                      key={seat.id}
                      className={`oss-seat ${loc ? 'oss-seat--assigned' : 'oss-seat--unassigned'}`}
                      style={loc ? { backgroundColor: loc.color } : undefined}
                      onClick={() => handleSeatClick(r, c)}
                      title={`${seatLabel(r, c)}${loc ? ` — ${loc.name}` : ''}`}
                      aria-label={`Seat ${seatLabel(r, c)}`}
                    />
                  );
                })}
              </div>

              <div className="oss-aisle">
                <span className="oss-aisle-label">AISLE</span>
              </div>

              <div className="oss-block">
                {rightSeats.map(({ seat, r, c }) => {
                  const loc = seat.localityId !== null ? localityById[seat.localityId] : null;
                  return (
                    <button
                      key={seat.id}
                      className={`oss-seat ${loc ? 'oss-seat--assigned' : 'oss-seat--unassigned'}`}
                      style={loc ? { backgroundColor: loc.color } : undefined}
                      onClick={() => handleSeatClick(r, c)}
                      title={`${seatLabel(r, c)}${loc ? ` — ${loc.name}` : ''}`}
                      aria-label={`Seat ${seatLabel(r, c)}`}
                    />
                  );
                })}
              </div>

              <div className="oss-row-labels">
                {ROW_LABELS.map(l => <span key={l} className="oss-row-label">{l}</span>)}
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
