import './BottomCards.css';

const MedalIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="6" />
    <path d="M9 14.5L7 22l5-3 5 3-2-7.5" />
    <path d="M12 6.5l.9 1.8 2 .3-1.45 1.4.35 2L12 11.8l-1.8.95.35-2L9.1 8.6l2-.3z" fill="currentColor" stroke="none" />
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const RocketIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

export default function BottomCards() {
  return (
    <section className="bottom-cards">
      {/* Elite Status */}
      <div className="bcard bcard--elite">
        <div className="bcard-elite-top">
          <div>
            <h3 className="bcard-elite-title">Elite Status</h3>
            <p className="bcard-elite-sub">
              You're in the top 2% of organizers this month.
            </p>
          </div>
          <span className="bcard-elite-medal"><MedalIcon /></span>
        </div>
        <div className="bcard-elite-rank">
          <span className="bcard-elite-rank-label">Global Rank</span>
          <span className="bcard-elite-rank-value">#142</span>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bcard bcard--milestones">
        <div className="bcard-milestones-head">
          <h3 className="bcard-milestones-title">Upcoming Milestones</h3>
          <span className="bcard-milestones-info"><InfoIcon /></span>
        </div>

        <div className="bcard-progress">
          <div className="bcard-progress-bar" style={{ width: '85%' }} />
          <span className="bcard-progress-pct">85%</span>
        </div>

        <p className="bcard-milestones-text">
          Sell 50k total tickets to unlock "Platinum Venue" status and lower
          transaction fees.
        </p>

        <button type="button" className="bcard-milestones-btn">Details</button>
      </div>

      {/* Campaign Boost */}
      <div className="bcard bcard--boost">
        <span className="bcard-boost-icon"><RocketIcon /></span>
        <h3 className="bcard-boost-title">Campaign Boost</h3>
        <p className="bcard-boost-text">
          Maximize your visibility for the upcoming weekend rush.
        </p>
        <button type="button" className="bcard-boost-btn">Enable Now</button>
      </div>
    </section>
  );
}
