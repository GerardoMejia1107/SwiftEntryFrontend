import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { getSeatMap } from '../../api/seats';
import { getLocalitiesByEvent } from '../../api/localities';
import './SeatSelectionPage.css';

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROWS = 10;
const COLS = 16;
const COLS_BLOCK = 8;
const ZOOM_STEP = 0.2;
const ZOOM_MIN = 1.5;
const ZOOM_MAX = 2.0;
const MAX_SEATS = 5;
const PALETTE = ['#8B5CF6', '#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

function buildEmptyGrid() {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      id: `${r}-${c}`,
      localityId: null,
      localitySeatId: null,
      status: null,
      selected: false,
    }))
  );
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
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

const SofaIcon = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3H2V9z" /><path d="M2 12v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4" /><path d="M6 18v2M18 18v2" /><path d="M2 12h2a2 2 0 0 1 2 2v2H2v-4zM22 12h-2a2 2 0 0 0-2 2v2h4v-4z" />
  </svg>
);

const TicketIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
  </svg>
);

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function SeatSelectionPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event ?? null;

  useEffect(() => {
    if (!event) navigate('/home-consumer/events', { replace: true });
  }, [event, navigate]);

  const [grid, setGrid] = useState(buildEmptyGrid);
  const [zoom, setZoom] = useState(1.8);
  const [tooltip, setTooltip] = useState(null);

  // ── Remote data ────────────────────────────────────────────
  const { data: rawLocalities, loading: localitiesLoading, error: localitiesError } = useQuery(
    () => eventId ? getLocalitiesByEvent(Number(eventId)) : Promise.resolve([]),
    [eventId]
  );

  const { data: seatMapData, loading: seatMapLoading, error: seatMapError } = useQuery(
    () => eventId ? getSeatMap(Number(eventId)) : Promise.resolve([]),
    [eventId]
  );

  const localities = useMemo(
    () => (rawLocalities ?? []).map(loc => ({ ...loc, color: PALETTE[loc.id % PALETTE.length] })),
    [rawLocalities]
  );

  const localityById = useMemo(
    () => Object.fromEntries(localities.map(l => [l.id, l])),
    [localities]
  );

  // Sync grid from backend seat map
  useEffect(() => {
    if (!seatMapData) return;
    const lookup = {};
    seatMapData.forEach(s => { lookup[`${s.row}${s.col}`] = s; });

    setGrid(
      Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const row = ROW_LABELS[r];
          const col = String(c + 1);
          const data = lookup[`${row}${col}`] ?? {};
          return {
            id: `${r}-${c}`,
            localityId: data.localityId ?? null,
            localitySeatId: data.localitySeatId ?? null,
            status: data.status ?? null,
            selected: false,
          };
        })
      )
    );
  }, [seatMapData]);

  // ── Derived ────────────────────────────────────────────────
  const seatLabel = (r, c) => `${ROW_LABELS[r]}${c + 1}`;

  const selectedSeats = useMemo(() => {
    const seats = [];
    grid.forEach((row, r) =>
      row.forEach((seat, c) => {
        if (!seat.selected) return;
        const loc = localityById[seat.localityId];
        seats.push({
          key: seat.id,
          label: seatLabel(r, c),
          localityName: loc?.name ?? '',
          localityColor: loc?.color ?? '#ccc',
          price: Number(loc?.price ?? 0),
          localitySeatId: seat.localitySeatId,
        });
      })
    );
    return seats;
  }, [grid, localityById]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCount = selectedSeats.length;
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const isLoading = localitiesLoading || seatMapLoading;
  const loadError = localitiesError ?? seatMapError ?? null;

  // ── Interactions ───────────────────────────────────────────
  const handleSeatClick = useCallback((r, c) => {
    setGrid(prev => {
      const seat = prev[r][c];
      if (!seat.localityId || seat.status !== 'AVAILABLE') return prev;
      if (!seat.selected && selectedCount >= MAX_SEATS) return prev;
      return prev.map((row, ri) =>
        ri !== r ? row : row.map((s, ci) =>
          ci !== c ? s : { ...s, selected: !s.selected }
        )
      );
    });
  }, [selectedCount]);

  const handleDeselect = useCallback((localitySeatId) => {
    setGrid(prev =>
      prev.map(row =>
        row.map(seat =>
          seat.localitySeatId === localitySeatId ? { ...seat, selected: false } : seat
        )
      )
    );
  }, []);

  const handleMouseEnter = useCallback((e, seat, r, c) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const loc = seat.localityId != null ? localityById[seat.localityId] : null;
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      label: seatLabel(r, c),
      localityName: loc?.name ?? null,
      status: seat.selected ? 'SELECTED' : (seat.status ?? null),
    });
  }, [localityById]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const zoomIn    = () => setZoom(z => Math.min(ZOOM_MAX, parseFloat((z + ZOOM_STEP).toFixed(1))));
  const zoomOut   = () => setZoom(z => Math.max(ZOOM_MIN, parseFloat((z - ZOOM_STEP).toFixed(1))));
  const zoomReset = () => setZoom(1.8);

  const leftSeats  = grid.flatMap((row, r) => row.slice(0, COLS_BLOCK).map((seat, c) => ({ seat, r, c })));
  const rightSeats = grid.flatMap((row, r) => row.slice(COLS_BLOCK).map((seat, c) => ({ seat, r, c: c + COLS_BLOCK })));

  const getSeatClass = (seat) => {
    if (!seat.localityId) return 'ss-seat ss-seat--unassigned';
    if (seat.selected)    return 'ss-seat ss-seat--selected';
    if (seat.status === 'RESERVED') return 'ss-seat ss-seat--reserved';
    if (seat.status === 'OCCUPIED') return 'ss-seat ss-seat--occupied';
    // available but at limit — dim it
    if (selectedCount >= MAX_SEATS) return 'ss-seat ss-seat--available ss-seat--dimmed';
    return 'ss-seat ss-seat--available';
  };

  const getSeatStyle = (seat) => {
    if (seat.selected) return { backgroundColor: 'var(--brand-primary)' };
    if (seat.localityId && seat.status === 'AVAILABLE') {
      const loc = localityById[seat.localityId];
      return loc ? { backgroundColor: loc.color } : undefined;
    }
    return undefined;
  };

  const isSeatDisabled = (seat) => {
    if (!seat.localityId) return true;
    if (seat.status !== 'AVAILABLE') return true;
    if (!seat.selected && selectedCount >= MAX_SEATS) return true;
    return false;
  };

  const STATUS_TOOLTIP = { SELECTED: 'Selected', AVAILABLE: 'Available', RESERVED: 'Reserved', OCCUPIED: 'Occupied' };

  if (!event) return null;

  return (
    <div className="ss-page">

      {/* ── Hover tooltip ── */}
      {tooltip && (
        <div className="ss-tooltip" style={{ left: tooltip.x, top: tooltip.y }} role="tooltip">
          <span className="ss-tooltip-seat">{tooltip.label}</span>
          {tooltip.localityName && <span className="ss-tooltip-locality">{tooltip.localityName}</span>}
          <span className={`ss-tooltip-status ss-tooltip-status--${(tooltip.status ?? 'unassigned').toLowerCase()}`}>
            {STATUS_TOOLTIP[tooltip.status] ?? 'Unassigned'}
          </span>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="ss-sidebar">
        <div className="ss-sidebar-header">
          <button type="button" className="ss-back-btn" onClick={() => navigate('/home-consumer/events')} aria-label="Back">
            <BackIcon />
          </button>
          <span className="ss-header-title">Seat Selection</span>
        </div>

        <div className="ss-sidebar-body">

          {/* Event info */}
          <div className="ss-event-info">
            {event.category && <span className="ss-event-type">{event.category}</span>}
            <h2 className="ss-event-name">{event.name}</h2>
            {event.venueName && <div className="ss-event-meta"><PinIcon />{event.venueName}</div>}
            {event.startDate && <div className="ss-event-meta"><CalIcon />{formatDate(event.startDate)}</div>}
          </div>

          {/* Localities legend */}
          {!isLoading && !loadError && localities.length > 0 && (
            <div className="ss-localities-legend">
              <p className="ss-section-title">Localities</p>
              <div className="ss-legend-list">
                {localities.map(loc => (
                  <div key={loc.id} className="ss-legend-item">
                    <span className="ss-legend-swatch" style={{ backgroundColor: loc.color }} />
                    <span className="ss-legend-name">{loc.name}</span>
                    {loc.price != null && (
                      <span className="ss-legend-price">${Number(loc.price).toFixed(2)}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Compact seat key */}
              <div className="ss-key-row">
                <span className="ss-key-item"><span className="ss-swatch ss-swatch--selected" />Selected</span>
                <span className="ss-key-item"><span className="ss-swatch ss-swatch--reserved" />Reserved</span>
                <span className="ss-key-item"><span className="ss-swatch ss-swatch--occupied" />Occupied</span>
              </div>
            </div>
          )}

          {/* Selected seats */}
          <div className="ss-selected-section">
            <div className="ss-selected-header">
              <p className="ss-section-title">Selected Seats</p>
              <span className={`ss-count-badge ${selectedCount >= MAX_SEATS ? 'ss-count-badge--full' : ''}`}>
                {selectedCount}/{MAX_SEATS}
              </span>
            </div>

            {selectedCount >= MAX_SEATS && (
              <p className="ss-limit-notice">Maximum of {MAX_SEATS} seats reached.</p>
            )}

            {selectedSeats.length === 0 ? (
              <div className="ss-empty-seats">
                <span className="ss-sofa-icon"><SofaIcon /></span>
                <p className="ss-hint">Click available seats on the map to add them here.</p>
              </div>
            ) : (
              <div className="ss-selected-list">
                {selectedSeats.map(s => (
                  <div key={s.key} className="ss-selected-item">
                    <span className="ss-selected-label">
                      <TicketIcon />
                      <span>
                        Seat {s.label}
                        <span className="ss-selected-locality" style={{ color: s.localityColor }}>
                          {s.localityName}
                        </span>
                      </span>
                    </span>
                    <div className="ss-selected-right">
                      <span className="ss-selected-price">${s.price.toFixed(2)}</span>
                      <button
                        type="button"
                        className="ss-deselect-btn"
                        onClick={() => handleDeselect(s.localitySeatId)}
                        aria-label={`Remove seat ${s.label}`}
                      >
                        <XIcon />
                      </button>
                    </div>
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
          <p className="ss-tax-note">Incl. taxes &amp; fees</p>
          <button
            className="ss-checkout-btn"
            disabled={selectedSeats.length === 0}
            onClick={() => { /* reservation logic TBD */ }}
          >
            Reserve {selectedCount > 0 ? `(${selectedCount})` : ''}
          </button>
        </div>
      </aside>

      {/* ── Map area ── */}
      <main className="ss-map-area">

        <div className="ss-stage-wrap">
          <div className="ss-stage-bar" />
          <span className="ss-stage-label">STAGE FRONT</span>
        </div>

        <div className="ss-zoom-controls">
          <button className="ss-zoom-btn" onClick={zoomIn}  aria-label="Zoom in">+</button>
          <button className="ss-zoom-btn" onClick={zoomOut} aria-label="Zoom out">−</button>
          <button className="ss-zoom-btn" onClick={zoomReset} aria-label="Reset zoom"><ResetIcon /></button>
        </div>

        {isLoading && (
          <div className="ss-map-state">
            <span className="ss-map-spinner" />
            <span>Loading seat map…</span>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="ss-map-state ss-map-state--error">Failed to load seat map.</div>
        )}

        {!isLoading && !loadError && (
          <div className="ss-grid-viewport">
            <div className="ss-grid-scaler" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>

              {/* Column number header */}
              <div className="ss-col-header">
                <span className="ss-col-header-spacer" />
                <div className="ss-col-nums">
                  {Array.from({ length: COLS_BLOCK }, (_, i) => (
                    <span key={i} className="ss-col-num">{i + 1}</span>
                  ))}
                </div>
                <span className="ss-aisle-header" />
                <div className="ss-col-nums">
                  {Array.from({ length: COLS_BLOCK }, (_, i) => (
                    <span key={i} className="ss-col-num">{i + COLS_BLOCK + 1}</span>
                  ))}
                </div>
                <span className="ss-col-header-spacer" />
              </div>

              {/* Main grid */}
              <div className="ss-matrix">

                <div className="ss-row-labels">
                  {ROW_LABELS.map(l => <span key={l} className="ss-row-label">{l}</span>)}
                </div>

                <div className="ss-block">
                  {leftSeats.map(({ seat, r, c }) => (
                    <button
                      key={seat.id}
                      className={getSeatClass(seat)}
                      style={getSeatStyle(seat)}
                      onClick={() => handleSeatClick(r, c)}
                      onMouseEnter={(e) => handleMouseEnter(e, seat, r, c)}
                      onMouseLeave={handleMouseLeave}
                      disabled={isSeatDisabled(seat)}
                      aria-label={`Seat ${seatLabel(r, c)}`}
                    />
                  ))}
                </div>

                <div className="ss-aisle">
                  <span className="ss-aisle-label">AISLE</span>
                </div>

                <div className="ss-block">
                  {rightSeats.map(({ seat, r, c }) => (
                    <button
                      key={seat.id}
                      className={getSeatClass(seat)}
                      style={getSeatStyle(seat)}
                      onClick={() => handleSeatClick(r, c)}
                      onMouseEnter={(e) => handleMouseEnter(e, seat, r, c)}
                      onMouseLeave={handleMouseLeave}
                      disabled={isSeatDisabled(seat)}
                      aria-label={`Seat ${seatLabel(r, c)}`}
                    />
                  ))}
                </div>

                <div className="ss-row-labels">
                  {ROW_LABELS.map(l => <span key={l} className="ss-row-label">{l}</span>)}
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
