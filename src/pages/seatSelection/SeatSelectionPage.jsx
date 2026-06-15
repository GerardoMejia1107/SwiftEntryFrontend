import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SeatSelectionPage.css';

// ── Constants ──────────────────────────────────────────────
const STATUS = {
  AVAILABLE: 'available',
  SELECTED:  'selected',
  SOLD_OUT:  'sold_out',
  RESERVED:  'reserved',
};

const ROW_LABELS = ['A','B','C','D','E','F','G','H','I','J','K'];
const TICKET_PRICE = 45.00;
const ZOOM_STEP = 0.2;
const ZOOM_MIN  = 0.5;
const ZOOM_MAX  = 2.0;

// null = gap/aisle  'A'=available  'S'=sold_out  'R'=reserved
const INITIAL_LAYOUT = [
  ['A','A','A','A','A','A','S','S','A','R','R','A',  'A','A','A','A','A','A','A','A'], // A
  ['A','A','A','A','A','A','A',null,null,'A','A','A','A','A','A','A','A','A','A','A'], // B
  ['A','A','A','A','A','A','A','A',null,null,'A','A','A','A','A','A','A','R','R','A'], // C
  ['A','A','A','A','A','A','A','A',null,null,'A','A','A','A','S','S','A','A','A','A'], // D
  ['A','A','A','A','A','A','A','A',null,null,'A','S','S','A','A','A','A','A','A','A'], // E
  ['A','A','A',null,null,'A','A','A','A','A','A','A','A','A','A','A','A','A','A','A'], // F
  ['A','A','A',null,null,'A','A','A','A','S','S','A','A','A','A','A','A','A','A','A'], // G
  ['A','A','A','A','S','S','A','A',null,'A','A','A','A','A','A','A','A','A','A','A'], // H
  ['A','A','A','A','A','A','A','A',null,null,'A','A','A','A','A','A','A','A','A','A'], // I
  ['S','S','S','A','A','A','A','A',null,null,'A','A','A','A','A','A','A','A','A','A'], // J
  ['S','S','S','S','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A'], // K
];

function buildInitialGrid() {
  return INITIAL_LAYOUT.map((row, rIdx) =>
    row.map((cell, cIdx) => {
      if (cell === null) return null;
      const statusMap = { A: STATUS.AVAILABLE, S: STATUS.SOLD_OUT, R: STATUS.RESERVED };
      return { id: `${rIdx}-${cIdx}`, status: statusMap[cell] };
    })
  );
}

// ── Icons ──────────────────────────────────────────────────
const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const SofaIcon = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3H2V9z"/><path d="M2 12v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4"/><path d="M6 18v2M18 18v2"/><path d="M2 12h2a2 2 0 0 1 2 2v2H2v-4zM22 12h-2a2 2 0 0 0-2 2v2h4v-4z"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
  </svg>
);

const TicketIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
  </svg>
);

// ── Mock event data (replace with real API data later) ──────
const MOCK_EVENT = {
  type: 'LIVE CONCERT',
  name: 'Neon Horizon World Tour',
  venue: 'Grand Sphere Arena',
  date: 'Oct 24, 2024 · 8:00 PM',
};

// ── Main component ──────────────────────────────────────────
export default function SeatSelectionPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [grid, setGrid]   = useState(buildInitialGrid);
  const [zoom, setZoom]   = useState(1);

  const selectedSeats = useMemo(() => {
    const seats = [];
    grid.forEach((row, rIdx) =>
      row.forEach((seat, cIdx) => {
        if (seat?.status === STATUS.SELECTED)
          seats.push({ label: `${ROW_LABELS[rIdx]}${cIdx + 1}`, rIdx, cIdx });
      })
    );
    return seats;
  }, [grid]);

  const subtotal = selectedSeats.length * TICKET_PRICE;

  const handleSeatClick = useCallback((rIdx, cIdx) => {
    setGrid(prev => {
      const seat = prev[rIdx][cIdx];
      if (!seat || seat.status === STATUS.SOLD_OUT || seat.status === STATUS.RESERVED) return prev;
      const next = seat.status === STATUS.AVAILABLE ? STATUS.SELECTED : STATUS.AVAILABLE;
      return prev.map((row, r) =>
        r !== rIdx ? row : row.map((s, c) => (c !== cIdx ? s : { ...s, status: next }))
      );
    });
  }, []);

  const zoomIn    = () => setZoom(z => Math.min(ZOOM_MAX, parseFloat((z + ZOOM_STEP).toFixed(1))));
  const zoomOut   = () => setZoom(z => Math.max(ZOOM_MIN, parseFloat((z - ZOOM_STEP).toFixed(1))));
  const zoomReset = () => setZoom(1);

  return (
    <div className="ss-page">

      {/* ── Sidebar ── */}
      <aside className="ss-sidebar">
        <div className="ss-sidebar-body">

          {/* Event info */}
          <div className="ss-event-info">
            <span className="ss-event-type">{MOCK_EVENT.type}</span>
            <h2 className="ss-event-name">{MOCK_EVENT.name}</h2>
            <div className="ss-event-meta">
              <PinIcon />{MOCK_EVENT.venue}
            </div>
            <div className="ss-event-meta">
              <CalIcon />{MOCK_EVENT.date}
            </div>
          </div>

          {/* Seat key */}
          <div className="ss-key">
            <p className="ss-section-title">Seat Key</p>
            <div className="ss-key-grid">
              <div className="ss-key-item">
                <span className="ss-swatch ss-swatch--available" />
                Available
              </div>
              <div className="ss-key-item">
                <span className="ss-swatch ss-swatch--selected" />
                Selected
              </div>
              <div className="ss-key-item">
                <span className="ss-swatch ss-swatch--sold_out" />
                Sold Out
              </div>
              <div className="ss-key-item">
                <span className="ss-swatch ss-swatch--reserved" />
                Reserved
              </div>
            </div>
          </div>

          {/* Selected seats */}
          <div className="ss-selected-section">
            <div className="ss-selected-header">
              <p className="ss-section-title">Selected Seats</p>
              <span className="ss-count-badge">{selectedSeats.length}</span>
            </div>

            {selectedSeats.length === 0 ? (
              <div className="ss-empty-seats">
                <span className="ss-sofa-icon"><SofaIcon /></span>
                <p className="ss-hint">Select seats from the map to continue</p>
              </div>
            ) : (
              <div className="ss-selected-list">
                {selectedSeats.map(s => (
                  <div key={s.label} className="ss-selected-item">
                    <span className="ss-selected-label">
                      <TicketIcon /> Seat {s.label}
                    </span>
                    <span className="ss-selected-price">${TICKET_PRICE.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="ss-sidebar-footer">
          <div className="ss-subtotal-row">
            <span className="ss-subtotal-label">Subtotal</span>
            <span className="ss-subtotal-amount">${subtotal.toFixed(2)}</span>
          </div>
          <p className="ss-tax-note">Incl. taxes</p>
          <button
            className="ss-checkout-btn"
            disabled={selectedSeats.length === 0}
            onClick={() => {/* navigate to checkout */}}
          >
            Review &amp; Checkout
          </button>
        </div>
      </aside>

      {/* ── Map area ── */}
      <main className="ss-map-area">

        {/* Stage */}
        <div className="ss-stage-wrap">
          <div className="ss-stage-bar" />
          <span className="ss-stage-label">STAGE FRONT</span>
        </div>

        {/* Zoom controls */}
        <div className="ss-zoom-controls">
          <button className="ss-zoom-btn" onClick={zoomIn}  aria-label="Zoom in">+</button>
          <button className="ss-zoom-btn" onClick={zoomOut} aria-label="Zoom out">−</button>
          <button className="ss-zoom-btn" onClick={zoomReset} aria-label="Reset zoom"><ResetIcon /></button>
        </div>

        {/* Seat grid */}
        <div className="ss-grid-viewport">
          <div className="ss-grid-scaler" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="ss-row">
                <span className="ss-row-label">{ROW_LABELS[rIdx]}</span>
                {row.map((seat, cIdx) =>
                  seat === null
                    ? <span key={cIdx} className="ss-gap" />
                    : (
                      <button
                        key={cIdx}
                        className={`ss-seat ss-seat--${seat.status}`}
                        onClick={() => handleSeatClick(rIdx, cIdx)}
                        disabled={seat.status === STATUS.SOLD_OUT || seat.status === STATUS.RESERVED}
                        title={`${ROW_LABELS[rIdx]}${cIdx + 1} — ${seat.status.replace('_', ' ')}`}
                        aria-label={`Seat ${ROW_LABELS[rIdx]}${cIdx + 1}`}
                      />
                    )
                )}
                <span className="ss-row-label">{ROW_LABELS[rIdx]}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
