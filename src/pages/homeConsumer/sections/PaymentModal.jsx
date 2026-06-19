import { useState } from 'react';
import { useProcessPayment } from '../../../hooks/usePayments';
import './PaymentModal.css';

const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD',   label: 'Credit card'   },
  { value: 'DEBIT_CARD',    label: 'Debit card'    },
  { value: 'CASH',          label: 'Cash'          },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
];

const formatAmount = (val) => {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
};

export default function PaymentModal({ reservation, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const { processPayment, loading, error } = useProcessPayment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payment = await processPayment({ reservationId: reservation.id, paymentMethod });
      onSuccess?.(payment);
    } catch {
      // error state is handled by the hook and rendered below
    }
  };

  return (
    <div className="pay-overlay" onClick={onClose}>
      <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pay-modal-header">
          <h2>Pay reservation #{reservation.id}</h2>
          <button type="button" className="pay-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="pay-modal-body" onSubmit={handleSubmit}>
          <div className="pay-total-row">
            <span>Total to pay</span>
            <span className="pay-total">{formatAmount(reservation.totalAmount)}</span>
          </div>

          <label className="pay-field">
            <span className="pay-label">Payment method</span>
            <select
              className="pay-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={loading}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>

          {error && <p className="pay-error">{error}</p>}

          <div className="pay-actions">
            <button type="button" className="pay-btn pay-btn--ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="pay-btn pay-btn--primary" disabled={loading}>
              {loading ? 'Processing…' : `Pay ${formatAmount(reservation.totalAmount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
