import { useEffect } from 'react';
import './DetailModal.css';

const STATUS = {
  PENDING:  { label: 'Pending',  cls: 'dtl-badge--pending'  },
  APPROVED: { label: 'Approved', cls: 'dtl-badge--approved' },
  FAILED:   { label: 'Failed',   cls: 'dtl-badge--failed'   },
  CANCELLED:{ label: 'Cancelled',cls: 'dtl-badge--cancelled'},
};

const METHOD_LABEL = {
  CREDIT_CARD:   'Credit card',
  DEBIT_CARD:    'Debit card',
  CASH:          'Cash',
  BANK_TRANSFER: 'Bank transfer',
};

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const money = (val) => (val != null ? `$${Number(val).toFixed(2)}` : '—');

function Field({ label, value, mono }) {
  return (
    <div className="dtl-field">
      <span className="dtl-field-label">{label}</span>
      <span className={`dtl-field-value${mono ? ' dtl-field-value--mono' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}

export default function PaymentDetailModal({ payment: p, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const badge = STATUS[p.status] ?? { label: p.status, cls: '' };

  return (
    <div className="dtl-overlay" onClick={onClose}>
      <div className="dtl-modal" onClick={(e) => e.stopPropagation()}>

        <div className="dtl-header">
          <div className="dtl-header-left">
            <h2 className="dtl-title">Payment #{p.id}</h2>
            <span className={`dtl-badge ${badge.cls}`}>{badge.label}</span>
          </div>
          <button type="button" className="dtl-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="dtl-body">
          <div className="dtl-amount-row">
            <span className="dtl-amount-label">Amount</span>
            <span className="dtl-amount">{money(p.amount)}</span>
          </div>

          <div className="dtl-fields">
            <Field label="Method"       value={METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod} />
            <Field label="Reservation"  value={`#${p.reservationId}`} />
            {p.transactionReference && (
              <Field label="Reference" value={p.transactionReference} mono />
            )}
            <Field label="Paid at"      value={fmt(p.paidAt)} />
            <Field label="Recorded at"  value={fmt(p.createdAt)} />
          </div>
        </div>
      </div>
    </div>
  );
}
