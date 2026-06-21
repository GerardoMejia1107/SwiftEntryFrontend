import { useState, useEffect } from 'react';
import { useTransferTicket } from '../../../hooks/usePayments';
import './TicketTransferModal.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapError(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes('no account') || (lower.includes('not found') && lower.includes('email'))) {
    return 'The entered email is not registered on the platform.';
  }
  if (lower.includes('yourself') || lower.includes('same email') || lower.includes('auto-transfer')) {
    return 'You cannot transfer a ticket to yourself.';
  }
  if (lower.includes('not in state') || lower.includes('issued')) {
    return 'This ticket cannot be transferred in its current state.';
  }
  return raw;
}

export default function TicketTransferModal({ ticket, onClose, onSuccess }) {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [fieldError, setFieldError]       = useState('');
  const { transferTicket, loading, error, reset } = useTransferTicket();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleChange = (e) => {
    setReceiverEmail(e.target.value);
    if (fieldError) setFieldError('');
    if (error) reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiverEmail.trim()) {
      setFieldError('Receiver email is required.');
      return;
    }
    if (!EMAIL_RE.test(receiverEmail.trim())) {
      setFieldError('Enter a valid email address.');
      return;
    }
    try {
      const result = await transferTicket({ ticketId: ticket.id, receiverEmail: receiverEmail.trim() });
      onSuccess?.(result);
    } catch {
      // error state handled by the hook
    }
  };

  const seatLabel = ticket.rowLabel && ticket.seatNumber
    ? `Row ${ticket.rowLabel} · Seat ${ticket.seatNumber}`
    : null;

  const displayError = mapError(error);

  return (
    <div className="trf-overlay" onClick={onClose}>
      <div className="trf-modal" onClick={(e) => e.stopPropagation()}>

        <div className="trf-header">
          <div className="trf-header-left">
            <h2 className="trf-title">Transfer ticket</h2>
            <span className="trf-subtitle">{ticket.eventName ?? `Ticket #${ticket.id}`}</span>
          </div>
          <button type="button" className="trf-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="trf-body" onSubmit={handleSubmit}>
          <div className="trf-ticket-info">
            {seatLabel && (
              <div className="trf-info-row">
                <span className="trf-info-label">Seat</span>
                <span className="trf-info-value">{seatLabel}</span>
              </div>
            )}
            {ticket.localityName && (
              <div className="trf-info-row">
                <span className="trf-info-label">Locality</span>
                <span className="trf-info-value">{ticket.localityName}</span>
              </div>
            )}
            <div className="trf-info-row">
              <span className="trf-info-label">Code</span>
              <span className="trf-info-value trf-info-value--mono">{ticket.ticketCode}</span>
            </div>
          </div>

          <label className="trf-field">
            <span className="trf-label">Recipient email</span>
            <input
              type="email"
              className={`trf-input${fieldError ? ' trf-input--error' : ''}`}
              placeholder="recipient@example.com"
              value={receiverEmail}
              onChange={handleChange}
              disabled={loading}
              autoFocus
              autoComplete="email"
            />
            {fieldError && <span className="trf-field-error">{fieldError}</span>}
          </label>

          {displayError && <p className="trf-error">{displayError}</p>}

          <div className="trf-actions">
            <button
              type="button"
              className="trf-btn trf-btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="trf-btn trf-btn--primary"
              disabled={loading}
            >
              {loading ? 'Transferring…' : 'Transfer ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
