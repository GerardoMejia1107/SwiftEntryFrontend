import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConsumerLayout from '../../components/dashboardLayout/ConsumerLayout';
import { useMyPayments, useMyTickets } from '../../hooks/usePayments';
import PaymentDetailModal from './sections/PaymentDetailModal';
import TicketDetailModal from './sections/TicketDetailModal';
import TicketTransferModal from './sections/TicketTransferModal';
import '../homeAdmin/EventsPage.css';
import './ConsumerPaymentsPage.css';

const PAYMENT_STATUS_BADGE = {
  PENDING:  { label: 'Pending',  cls: 'cpay-badge--pending'  },
  APPROVED: { label: 'Approved', cls: 'cpay-badge--approved' },
  FAILED:   { label: 'Failed',   cls: 'cpay-badge--failed'   },
  CANCELLED:{ label: 'Cancelled',cls: 'cpay-badge--cancelled'},
};

const TICKET_STATUS_BADGE = {
  ISSUED:    { label: 'Issued',    cls: 'cpay-badge--approved' },
  USED:      { label: 'Used',      cls: 'cpay-badge--used'     },
  CANCELLED: { label: 'Cancelled', cls: 'cpay-badge--cancelled'},
  REFUNDED:  { label: 'Refunded',  cls: 'cpay-badge--pending'  },
};

const METHOD_LABEL = {
  CREDIT_CARD:   'Credit card',
  DEBIT_CARD:    'Debit card',
  CASH:          'Cash',
  BANK_TRANSFER: 'Bank transfer',
};

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const money = (val) => (val != null ? `$${Number(val).toFixed(2)}` : '—');

function PaymentsTab({ onSelect }) {
  const { payments, loading, error } = useMyPayments();

  if (loading) return (
    <div className="ev-state">
      <span className="ev-spinner" />
      <p className="ev-state-text">Loading payment history…</p>
    </div>
  );

  if (error) return (
    <div className="ev-state ev-state--error">
      <p className="ev-state-text">Could not load payment history.</p>
    </div>
  );

  if (payments.length === 0) return (
    <div className="ev-state">
      <p className="ev-state-text">No payments yet. Complete a reservation to see your history here.</p>
    </div>
  );

  return (
    <div className="ev-table-wrap">
      <table className="ev-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Paid on</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const badge = PAYMENT_STATUS_BADGE[p.status] ?? { label: p.status, cls: '' };
            return (
              <tr key={p.id} className="ev-row" onClick={() => onSelect(p)}>
                <td>{METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}</td>
                <td><span className={`cpay-badge ${badge.cls}`}>{badge.label}</span></td>
                <td style={{ fontWeight: 700 }}>{money(p.amount)}</td>
                <td className="ev-col-date">{fmt(p.paidAt ?? p.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TicketsTab({ tickets, loading, error, onSelect }) {
  if (loading) return (
    <div className="ev-state">
      <span className="ev-spinner" />
      <p className="ev-state-text">Loading your tickets…</p>
    </div>
  );

  if (error) return (
    <div className="ev-state ev-state--error">
      <p className="ev-state-text">Could not load tickets.</p>
    </div>
  );

  if (tickets.length === 0) return (
    <div className="ev-state">
      <p className="ev-state-text">No tickets yet. Pay a reservation to receive your tickets.</p>
    </div>
  );

  return (
    <div className="ev-table-wrap">
      <table className="ev-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Locality</th>
            <th>Seat</th>
            <th>Code</th>
            <th>Status</th>
            <th>Issued on</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const badge = TICKET_STATUS_BADGE[t.status] ?? { label: t.status, cls: '' };
            const shortCode = t.ticketCode
              ? t.ticketCode.substring(0, 12) + '…'
              : '—';
            return (
              <tr key={t.id} className="ev-row" onClick={() => onSelect(t)}>
                <td>{t.eventName ?? '—'}</td>
                <td>{t.localityName ?? '—'}</td>
                <td>
                  {t.rowLabel && t.seatNumber
                    ? <span className="cpay-seat-tag">{t.rowLabel}{t.seatNumber}</span>
                    : '—'}
                </td>
                <td className="cpay-code">{shortCode}</td>
                <td><span className={`cpay-badge ${badge.cls}`}>{badge.label}</span></td>
                <td className="ev-col-date">{fmt(t.issuedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ConsumerPaymentsPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]               = useState('payments');
  const [selectedPayment, setSelectedPayment]   = useState(null);
  const [selectedTicket, setSelectedTicket]     = useState(null);
  const [transferringTicket, setTransferringTicket] = useState(null);

  const { tickets, loading: ticketsLoading, error: ticketsError, refetch: refetchTickets } = useMyTickets();

  const handleTransferClick = (ticket) => {
    setSelectedTicket(null);
    setTransferringTicket(ticket);
  };

  const handleTransferSuccess = () => {
    setTransferringTicket(null);
    refetchTickets();
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <ConsumerLayout user={auth?.user} activeItem="payments" onLogout={handleLogout}>
      <div className="cpay-page">
        <header className="cpay-header">
          <h1 className="cpay-title">My Payments &amp; Tickets</h1>
          <p className="cpay-subtitle">Your full payment history and issued tickets.</p>
        </header>

        <div className="ev-card">
          <div className="cpay-tabs">
            <button
              type="button"
              className={`cpay-tab ${activeTab === 'payments' ? 'cpay-tab--active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payment History
            </button>
            <button
              type="button"
              className={`cpay-tab ${activeTab === 'tickets' ? 'cpay-tab--active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              My Tickets
            </button>
          </div>

          {activeTab === 'payments'
            ? <PaymentsTab onSelect={setSelectedPayment} />
            : (
              <TicketsTab
                tickets={tickets}
                loading={ticketsLoading}
                error={ticketsError}
                onSelect={setSelectedTicket}
              />
            )}
        </div>
      </div>

      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTransfer={() => handleTransferClick(selectedTicket)}
        />
      )}

      {transferringTicket && (
        <TicketTransferModal
          ticket={transferringTicket}
          onClose={() => setTransferringTicket(null)}
          onSuccess={handleTransferSuccess}
        />
      )}
    </ConsumerLayout>
  );
}
