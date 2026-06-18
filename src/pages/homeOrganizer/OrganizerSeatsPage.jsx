import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { getLocalitiesByEvent } from '../../api/localities';
import { getSeatMap, assignSeats, unassignSeat } from '../../api/seats';
import './OrganizerSeatsPage.css';

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROWS = 10;
const COLS = 16;
const COLS_BLOCK = 8;
const ZOOM_STEP = 0.2;
const ZOOM_MIN = 1.5;
const ZOOM_MAX = 2.0;
const PALETTE = ['#8B5CF6', '#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

const STATUS_LABEL = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  OCCUPIED: 'Occupied',
};

function buildEmptyGrid() {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      id: `${r}-${c}`,
      localityId: null,
      localitySeatId: null,
      status: null,
    }))
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-SV', {
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

const EraseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20H7L3 16l11-11 6 6-3.5 3.5" /><path d="M6.5 17.5l10-10" />
  </svg>
);

export default function OrganizerSeatsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event ?? null;

  // Redirect if no event was passed through navigation state
  useEffect(() => {
    if (!event) navigate('/home-organizer/events', { replace: true });
  }, [event, navigate]);

  const [grid, setGrid] = useState(buildEmptyGrid);
  const [activeLocalityId, setActiveLocalityId] = useState(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [zoom, setZoom] = useState(1.8);
  const [tooltip, setTooltip] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Tracks the locality assignments as last committed to the backend
  const originalAssignmentsRef = useRef({});
  // Snapshot of the full grid as it was last committed — used by Clear All
  const committedGridRef = useRef(buildEmptyGrid());

  // ── Remote data ────────────────────────────────────────────
  const { data: rawLocalities, loading: localitiesLoading, error: localitiesError } = useQuery(
    () => event ? getLocalitiesByEvent(event.id) : Promise.resolve([]),
    [event?.id]
  );

  const { data: seatMapData, loading: seatMapLoading, error: seatMapError, refetch: refetchSeatMap } = useQuery(
    () => event ? getSeatMap(event.id) : Promise.resolve([]),
    [event?.id]
  );

  const { mutate: doAssign } = useMutation(assignSeats);
  const { mutate: doUnassign } = useMutation(unassignSeat);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Stable colour keyed by locality id — same id always maps to same palette slot
  const localities = useMemo(
    () => (rawLocalities ?? []).map(loc => ({ ...loc, color: PALETTE[loc.id % PALETTE.length] })),
    [rawLocalities]
  );

  // Default the active locality to the first one once loaded
  useEffect(() => {
    if (localities.length > 0 && activeLocalityId === null) {
      setActiveLocalityId(localities[0].id);
    }
  }, [localities, activeLocalityId]);

  // Sync local grid from backend seat map whenever it loads
  useEffect(() => {
    if (!seatMapData) return;
    const lookup = {};
    seatMapData.forEach(s => { lookup[`${s.row}${s.col}`] = s; });

    const original = {};
    const newGrid = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => {
        const row = ROW_LABELS[r];
        const col = String(c + 1);
        const data = lookup[`${row}${col}`] ?? {};
        const localityId = data.localityId ?? null;
        const localitySeatId = data.localitySeatId ?? null;
        original[`${r}-${c}`] = { localityId, localitySeatId };
        return { id: `${r}-${c}`, localityId, localitySeatId, status: data.status ?? null };
      })
    );

    originalAssignmentsRef.current = original;
    committedGridRef.current = newGrid;
    setGrid(newGrid);
  }, [seatMapData]);

  // ── Derived values ─────────────────────────────────────────
  const localityById = useMemo(
    () => Object.fromEntries(localities.map(l => [l.id, l])),
    [localities]
  );

  const seatLabel = (r, c) => `${ROW_LABELS[r]}${c + 1}`;

  const seatCounts = useMemo(() => {
    const counts = Object.fromEntries(localities.map(l => [l.id, 0]));
    grid.forEach(row =>
      row.forEach(seat => {
        if (seat.localityId !== null && counts[seat.localityId] !== undefined) {
          counts[seat.localityId]++;
        }
      })
    );
    return counts;
  }, [grid, localities]);

  const totalAssigned = useMemo(
    () => Object.values(seatCounts).reduce((a, b) => a + b, 0),
    [seatCounts]
  );

  // Compute pending changes against the last committed backend state.
  // Handles assign (null→id), unassign (id→null), and move (idA→idB).
  const { pendingAssignments, pendingUnassignments } = useMemo(() => {
    const assignments = {};   // localityId → ["A1", ...]
    const unassignments = []; // localitySeatId[]

    grid.forEach((row, r) =>
      row.forEach((seat, c) => {
        const orig = originalAssignmentsRef.current[`${r}-${c}`]
          ?? { localityId: null, localitySeatId: null };

        if (seat.localityId === orig.localityId) return; // unchanged

        if (orig.localityId !== null && orig.localitySeatId !== null) {
          unassignments.push(orig.localitySeatId);
        }
        if (seat.localityId !== null) {
          if (!assignments[seat.localityId]) assignments[seat.localityId] = [];
          assignments[seat.localityId].push(`${ROW_LABELS[r]}${c + 1}`);
        }
      })
    );

    return { pendingAssignments: assignments, pendingUnassignments: unassignments };
  }, [grid]);

  const hasChanges =
    Object.keys(pendingAssignments).length > 0 || pendingUnassignments.length > 0;

  // Poll every 15 s to show reservations in real-time.
  // Paused while the organizer has unsaved changes to avoid overwriting local edits.
  useEffect(() => {
    if (!event?.id || hasChanges) return;
    const id = setInterval(refetchSeatMap, 15_000);
    return () => clearInterval(id);
  }, [event?.id, hasChanges, refetchSeatMap]);

  // ── Interactions ───────────────────────────────────────────
  const handleSeatClick = useCallback((r, c) => {
    setGrid(prev => {
      const seat = prev[r][c];
      if (seat.status === 'RESERVED' || seat.status === 'OCCUPIED') return prev;
      const newLocalityId = eraseMode
        ? null
        : seat.localityId === activeLocalityId ? null : activeLocalityId;
      return prev.map((row, ri) =>
        ri !== r ? row : row.map((s, ci) =>
          ci !== c ? s : { ...s, localityId: newLocalityId, status: newLocalityId ? 'AVAILABLE' : null }
        )
      );
    });
  }, [activeLocalityId, eraseMode]);

  const handleMouseEnter = useCallback((e, seat, r, c) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      label: seatLabel(r, c),
      status: seat.status,
      localityName: seat.localityId != null ? (localityById[seat.localityId]?.name ?? null) : null,
    });
  }, [localityById]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const handleClearAll = () => setGrid(committedGridRef.current);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    setSaving(true);
    setSaveError(null);
    try {
      for (const localitySeatId of pendingUnassignments) {
        await doUnassign(localitySeatId);
      }
      for (const [localityId, seats] of Object.entries(pendingAssignments)) {
        await doAssign({ localityId: Number(localityId), seats });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      refetchSeatMap();
    } catch (err) {
      setSaveError(err.response?.data?.message ?? err.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  }, [hasChanges, pendingUnassignments, pendingAssignments, doUnassign, doAssign, refetchSeatMap]);

  const zoomIn    = () => setZoom(z => Math.min(ZOOM_MAX, parseFloat((z + ZOOM_STEP).toFixed(1))));
  const zoomOut   = () => setZoom(z => Math.max(ZOOM_MIN, parseFloat((z - ZOOM_STEP).toFixed(1))));
  const zoomReset = () => setZoom(1.8);

  const leftSeats  = grid.flatMap((row, r) => row.slice(0, COLS_BLOCK).map((seat, c) => ({ seat, r, c })));
  const rightSeats = grid.flatMap((row, r) => row.slice(COLS_BLOCK).map((seat, c) => ({ seat, r, c: c + COLS_BLOCK })));

  // Only show the loading spinner on the first fetch; subsequent polls are silent.
  const isInitialLoading = localitiesLoading || (seatMapLoading && !seatMapData);
  const loadError = localitiesError ?? seatMapError ?? null;

  if (!event) return null;

  return (
    <div className="oss-page">

      {/* ── Floating seat tooltip ── */}
      {tooltip && (
        <div
          className="oss-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
          aria-live="polite"
        >
          <span className="oss-tooltip-seat">{tooltip.label}</span>
          {tooltip.localityName && (
            <span className="oss-tooltip-locality">{tooltip.localityName}</span>
          )}
          <span className={`oss-tooltip-status oss-tooltip-status--${(tooltip.status ?? 'unassigned').toLowerCase()}`}>
            {STATUS_LABEL[tooltip.status] ?? 'Unassigned'}
          </span>
        </div>
      )}

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
            <span className="oss-event-type">{event.category ?? 'EVENT'}</span>
            <h2 className="oss-event-name">{event.name}</h2>
            {event.venueName && (
              <div className="oss-event-meta"><PinIcon />{event.venueName}</div>
            )}
            <div className="oss-event-meta"><CalIcon />{formatDate(event.startDate)}</div>
          </div>

          {/* Localities */}
          <div className="oss-localities-section">
            <p className="oss-section-title">Localities</p>
            <p className="oss-section-hint">Select a locality, then click seats on the map to assign them.</p>

            {isInitialLoading && <span className="oss-localities-loading">Loading…</span>}
            {loadError && <span className="oss-localities-error">{loadError}</span>}

            {!isInitialLoading && !loadError && (
              <div className="oss-locality-list">
                {localities.map(loc => (
                  <button
                    key={loc.id}
                    type="button"
                    className={`oss-locality-item ${activeLocalityId === loc.id && !eraseMode ? 'oss-locality-item--active' : ''}`}
                    onClick={() => { setActiveLocalityId(loc.id); setEraseMode(false); }}
                  >
                    <span className="oss-locality-swatch" style={{ backgroundColor: loc.color }} />
                    <span className="oss-locality-name">{loc.name}</span>
                    <span className="oss-locality-count">{seatCounts[loc.id] ?? 0}</span>
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
            )}
          </div>

          {/* Summary */}
          <div className="oss-summary-section">
            <div className="oss-summary-header">
              <p className="oss-section-title">Summary</p>
              <span className="oss-total-badge">{totalAssigned} / {ROWS * COLS}</span>
            </div>

            <div className="oss-summary-list">
              {localities.map(loc => (
                <div key={loc.id} className="oss-summary-row">
                  <span className="oss-summary-dot" style={{ backgroundColor: loc.color }} />
                  <span className="oss-summary-name">{loc.name}</span>
                  <span className="oss-summary-seats">{seatCounts[loc.id] ?? 0} seats</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="oss-sidebar-footer">
          {saveError && <p className="oss-save-error">{saveError}</p>}
          <button type="button" className="oss-clear-btn" onClick={handleClearAll} disabled={saving}>
            Clear all
          </button>
          <button
            type="button"
            className={`oss-save-btn ${saveSuccess ? 'oss-save-btn--success' : ''}`}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save Layout'}
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

        {isInitialLoading && (
          <div className="oss-map-loading">
            <span className="oss-map-spinner" />
            <span>Loading seat map…</span>
          </div>
        )}

        {!isInitialLoading && loadError && (
          <div className="oss-map-error">Failed to load seat map: {loadError}</div>
        )}

        {!isInitialLoading && !loadError && (
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
                    const loc = seat.localityId != null ? localityById[seat.localityId] : null;
                    const locked = seat.status === 'RESERVED' || seat.status === 'OCCUPIED';
                    const statusCls = locked ? ` oss-seat--${seat.status.toLowerCase()}` : '';
                    return (
                      <button
                        key={seat.id}
                        className={`oss-seat ${loc ? 'oss-seat--assigned' : 'oss-seat--unassigned'}${statusCls}`}
                        style={loc ? { backgroundColor: loc.color } : undefined}
                        onClick={() => handleSeatClick(r, c)}
                        onMouseEnter={(e) => handleMouseEnter(e, seat, r, c)}
                        onMouseLeave={handleMouseLeave}
                        disabled={locked}
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
                    const loc = seat.localityId != null ? localityById[seat.localityId] : null;
                    const locked = seat.status === 'RESERVED' || seat.status === 'OCCUPIED';
                    const statusCls = locked ? ` oss-seat--${seat.status.toLowerCase()}` : '';
                    return (
                      <button
                        key={seat.id}
                        className={`oss-seat ${loc ? 'oss-seat--assigned' : 'oss-seat--unassigned'}${statusCls}`}
                        style={loc ? { backgroundColor: loc.color } : undefined}
                        onClick={() => handleSeatClick(r, c)}
                        onMouseEnter={(e) => handleMouseEnter(e, seat, r, c)}
                        onMouseLeave={handleMouseLeave}
                        disabled={locked}
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
        )}

      </main>
    </div>
  );
}
