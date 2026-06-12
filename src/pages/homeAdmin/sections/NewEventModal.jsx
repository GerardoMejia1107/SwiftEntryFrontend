import { useState } from 'react';
import { InputField, PrimaryButton, SectionLabel } from '../../../components/formComponents/FormComponents';
import { createEvent, createLocality } from '../../../api/eventService';
import './NewEventModal.css';

const CATEGORIES = ['CONCERT', 'SPORTS', 'THEATER', 'COMEDY', 'CONFERENCE', 'FESTIVAL', 'MOVIE', 'CULTURAL'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED'];

const emptyEvent = () => ({
  name: '',
  description: '',
  category: 'CONCERT',
  organizerId: '',
  startDate: '',
  endDate: '',
  venueName: '',
  status: 'DRAFT',
  imageUrl: '',
});

const emptyAddress = () => ({
  streetAddress: '',
  neighborhood: '',
  municipality: '',
  department: '',
  country: '',
  referencePoint: '',
});

const emptyLocality = () => ({ name: '', description: '', price: '', capacity: '' });

// datetime-local entrega "YYYY-MM-DDTHH:MM"; el backend espera segundos.
const withSeconds = (value) => (value && value.length === 16 ? `${value}:00` : value);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default function NewEventModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(emptyEvent);
  const [hasAddress, setHasAddress] = useState(false);
  const [address, setAddress] = useState(emptyAddress);
  const [localities, setLocalities] = useState([emptyLocality()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!open) return null;

  const updateForm = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const updateAddress = (field) => (e) => setAddress(prev => ({ ...prev, [field]: e.target.value }));

  const updateLocality = (index, field) => (e) => {
    const value = e.target.value;
    setLocalities(prev => prev.map((loc, i) => (i === index ? { ...loc, [field]: value } : loc)));
  };

  const addLocality = () => setLocalities(prev => [...prev, emptyLocality()]);
  const removeLocality = (index) => setLocalities(prev => prev.filter((_, i) => i !== index));

  const resetAll = () => {
    setForm(emptyEvent());
    setHasAddress(false);
    setAddress(emptyAddress());
    setLocalities([emptyLocality()]);
  };

  const handleClose = () => {
    if (loading) return;
    setError('');
    setSuccess('');
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const eventPayload = {
        name: form.name,
        description: form.description || undefined,
        category: form.category,
        organizerId: Number(form.organizerId),
        startDate: withSeconds(form.startDate),
        endDate: withSeconds(form.endDate),
        venueName: form.venueName || undefined,
        status: form.status,
        imageUrl: form.imageUrl || undefined,
        address: hasAddress ? { ...address } : undefined,
      };

      const createdEvent = await createEvent(eventPayload);
      const eventId = createdEvent.id;

      // Solo se mandan las localidades con los campos obligatorios llenos.
      const validLocalities = localities.filter(
        (loc) => loc.name.trim() && loc.price !== '' && loc.capacity !== '',
      );

      for (const loc of validLocalities) {
        const capacity = Number(loc.capacity);
        await createLocality({
          eventId,
          name: loc.name,
          description: loc.description || undefined,
          price: Number(loc.price),
          capacity,
          availableSlots: capacity, // siempre igual a capacity
        });
      }

      setSuccess(
        `Evento "${createdEvent.name}" creado (ID ${eventId}) con ${validLocalities.length} localidad(es).`,
      );
      onCreated?.(createdEvent);
      resetAll();
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo crear el evento. Revisa los datos e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h2 className="modal-title">Crear nuevo evento</h2>
            <p className="modal-subtitle">Define el evento y sus localidades.</p>
          </div>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* ===== Datos del evento ===== */}
          <SectionLabel>Datos del evento</SectionLabel>

          <InputField
            id="ev-name"
            label="Nombre del evento"
            placeholder="Rock Fest 2026"
            value={form.name}
            onChange={updateForm('name')}
            required
          />

          <div className="modal-field">
            <label className="input-label" htmlFor="ev-description">Descripción</label>
            <textarea
              id="ev-description"
              className="modal-textarea"
              placeholder="Breve descripción del evento"
              value={form.description}
              onChange={updateForm('description')}
              rows={3}
            />
          </div>

          <div className="modal-grid-2">
            <div className="modal-field">
              <label className="input-label" htmlFor="ev-category">Categoría<span className="input-required"> *</span></label>
              <select id="ev-category" className="modal-select" value={form.category} onChange={updateForm('category')} required>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="modal-field">
              <label className="input-label" htmlFor="ev-status">Estado<span className="input-required"> *</span></label>
              <select id="ev-status" className="modal-select" value={form.status} onChange={updateForm('status')} required>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="modal-grid-2">
            <InputField
              id="ev-organizer"
              label="ID del organizador"
              type="number"
              min="1"
              placeholder="Ej. 1"
              value={form.organizerId}
              onChange={updateForm('organizerId')}
              required
            />
            <InputField
              id="ev-venue"
              label="Nombre del recinto"
              placeholder="National Stadium"
              value={form.venueName}
              onChange={updateForm('venueName')}
            />
          </div>

          <div className="modal-grid-2">
            <InputField
              id="ev-start"
              label="Inicio"
              type="datetime-local"
              value={form.startDate}
              onChange={updateForm('startDate')}
              required
            />
            <InputField
              id="ev-end"
              label="Fin"
              type="datetime-local"
              value={form.endDate}
              onChange={updateForm('endDate')}
              required
            />
          </div>

          <InputField
            id="ev-image"
            label="URL de imagen"
            type="url"
            placeholder="https://..."
            value={form.imageUrl}
            onChange={updateForm('imageUrl')}
          />

          {/* ===== Dirección (opcional) ===== */}
          <label className="modal-toggle">
            <input
              type="checkbox"
              checked={hasAddress}
              onChange={(e) => setHasAddress(e.target.checked)}
            />
            Este evento tiene una dirección física
          </label>

          {hasAddress && (
            <div className="modal-address">
              <InputField
                id="ad-street"
                label="Dirección"
                placeholder="Blvd. de los Héroes 123"
                value={address.streetAddress}
                onChange={updateAddress('streetAddress')}
                required
              />
              <div className="modal-grid-2">
                <InputField id="ad-neighborhood" label="Colonia / Barrio" value={address.neighborhood} onChange={updateAddress('neighborhood')} />
                <InputField id="ad-municipality" label="Municipio" value={address.municipality} onChange={updateAddress('municipality')} required />
              </div>
              <div className="modal-grid-2">
                <InputField id="ad-department" label="Departamento" value={address.department} onChange={updateAddress('department')} required />
                <InputField id="ad-country" label="País" value={address.country} onChange={updateAddress('country')} required />
              </div>
              <InputField id="ad-reference" label="Punto de referencia" value={address.referencePoint} onChange={updateAddress('referencePoint')} />
            </div>
          )}

          {/* ===== Localidades ===== */}
          <div className="modal-localities-head">
            <SectionLabel>Localidades</SectionLabel>
            <button type="button" className="modal-add-locality" onClick={addLocality}>
              <PlusIcon /> Agregar zona
            </button>
          </div>

          <div className="modal-localities">
            {localities.map((loc, index) => (
              <div className="modal-locality" key={index}>
                <div className="modal-locality-grid">
                  <InputField id={`loc-name-${index}`} placeholder="Zona (VIP, General...)" value={loc.name} onChange={updateLocality(index, 'name')} />
                  <InputField id={`loc-price-${index}`} type="number" min="0" step="0.01" placeholder="Precio" value={loc.price} onChange={updateLocality(index, 'price')} />
                  <InputField id={`loc-capacity-${index}`} type="number" min="1" placeholder="Capacidad" value={loc.capacity} onChange={updateLocality(index, 'capacity')} />
                </div>
                <InputField id={`loc-desc-${index}`} placeholder="Descripción (opcional)" value={loc.description} onChange={updateLocality(index, 'description')} />
                {localities.length > 1 && (
                  <button type="button" className="modal-remove-locality" onClick={() => removeLocality(index)} aria-label="Quitar zona">
                    <TrashIcon /> Quitar
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && <p className="modal-error">{error}</p>}
          {success && <p className="modal-success">{success}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <PrimaryButton type="submit" loading={loading}>
              Crear evento
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
