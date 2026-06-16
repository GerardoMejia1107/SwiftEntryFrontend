import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SessionExpiredModal.css';

const TOTAL = 3;
const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function SessionExpiredModal() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(TOTAL);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      logout();
      setCount(TOTAL);
      setVisible(true);
    };
    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, [logout]);

  useEffect(() => {
    if (!visible) return;
    if (count === 0) {
      setVisible(false);
      navigate('/login', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [visible, count, navigate]);

  const goNow = () => {
    setVisible(false);
    navigate('/login', { replace: true });
  };

  if (!visible) return null;

  const dashoffset = CIRCUMFERENCE * (count / TOTAL);

  return (
    <div className="sxp-overlay">
      <div className="sxp-modal">
        <div className="sxp-icon-wrap">
          <LockIcon />
        </div>

        <h2 className="sxp-title">Session Expired</h2>
        <p className="sxp-subtitle">
          Your session has expired. You&apos;ll be redirected to login automatically.
        </p>

        <div className="sxp-ring-wrap">
          <svg className="sxp-ring" viewBox="0 0 96 96" width="96" height="96">
            <circle
              className="sxp-ring-track"
              cx="48" cy="48" r={RADIUS}
              fill="none"
              strokeWidth="5"
            />
            <circle
              className="sxp-ring-progress"
              cx="48" cy="48" r={RADIUS}
              fill="none"
              strokeWidth="5"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
            />
          </svg>
          <span key={count} className="sxp-count">{count}</span>
        </div>

        <p className="sxp-hint">Redirecting to login…</p>

        <button type="button" className="sxp-btn" onClick={goNow}>
          Go to Login now →
        </button>
      </div>
    </div>
  );
}
