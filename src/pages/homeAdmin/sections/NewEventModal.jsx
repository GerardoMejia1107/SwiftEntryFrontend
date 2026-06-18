import { useState } from 'react';
import { InputField, PrimaryButton } from '../../../components/formComponents/FormComponents';
import { useMutation } from '../../../hooks/useMutation';
import { createEvent, updateEvent } from '../../../api/events';
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

const emptyLocality = () => ({ name: '', description: '', price: '' });

const withSeconds = (value) => (value && value.length === 16 ? `${value}:00` : value);

// Map API event shape → form state
const toDatetimeLocal = (iso) => iso ? iso.slice(0, 16) : '';

const fromEvent = (ev) => ({
  name: ev.name || '',
  description: ev.description || '',
  category: ev.category || 'CONCERT',
  organizerId: String(ev.organizer?.id ?? ev.organizerId ?? ''),
  startDate: toDatetimeLocal(ev.startDate),
  endDate: toDatetimeLocal(ev.endDate),
  venueName: ev.venueName || '',
  status: ev.status || 'DRAFT',
  imageUrl: ev.imageUrl || '',
});

const fromLocalities = (locs) =>
  locs?.length > 0
    ? locs.map((l) => ({ name: l.name || '', description: l.description || '', price: String(l.price ?? '') }))
    : [emptyLocality()];

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

function CardHeader({ number, title, subtitle, action }) {
  return (
    <div className="ef-card-header">
      <span className="ef-badge">{number}</span>
      <div className="ef-card-header-text">
        <p className="ef-card-title">{title}</p>
        {subtitle && <p className="ef-card-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="ef-card-header-action">{action}</div>}
    </div>
  );
}

export default function NewEventForm({ onCancel, onCreated, onUpdated, initialEvent }) {
  const isEdit = Boolean(initialEvent);

  const [form, setForm] = useState(() => initialEvent ? fromEvent(initialEvent) : emptyEvent());
  const [localities, setLocalities] = useState(() => fromLocalities(initialEvent?.localities));
  const [success, setSuccess] = useState('');

  const { mutate: create, loading: creating, error: createError } = useMutation(createEvent);
  const { mutate: update, loading: updating, error: updateError } = useMutation(updateEvent);

  const loading = isEdit ? updating : creating;
  const error = isEdit ? updateError : createError;

  const updateForm = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const updateLocality = (index, field) => (e) => {
    const value = e.target.value;
    setLocalities(prev => prev.map((loc, i) => (i === index ? { ...loc, [field]: value } : loc)));
  };

  const addLocality = () => setLocalities(prev => [...prev, emptyLocality()]);
  const removeLocality = (index) => setLocalities(prev => prev.filter((_, i) => i !== index));

  const resetAll = () => {
    setForm(emptyEvent());
    setLocalities([emptyLocality()]);
  };

  const handleCancel = () => {
    if (loading) return;
    onCancel?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');

    const validLocalities = localities
      .filter((loc) => loc.name.trim() && loc.price !== '')
      .map((loc) => ({
        name: loc.name.trim(),
        description: loc.description.trim() || undefined,
        price: Number(loc.price),
      }));

    const payload = {
      name: form.name,
      description: form.description || undefined,
      category: form.category,
      organizerId: Number(form.organizerId),
      status: form.status,
      startDate: withSeconds(form.startDate),
      endDate: withSeconds(form.endDate),
      venueName: form.venueName || undefined,
      imageUrl: form.imageUrl || undefined,
      localities: validLocalities.length > 0 ? validLocalities : undefined,
    };

    try {
      if (isEdit) {
        const updatedEvent = await update(initialEvent.id, payload);
        setSuccess(`Evento "${updatedEvent.name}" actualizado con éxito.`);
        onUpdated?.(updatedEvent);
      } else {
        const createdEvent = await create(payload);
        setSuccess(`Evento "${createdEvent.name}" creado con éxito (ID ${createdEvent.id}).`);
        onCreated?.(createdEvent);
        resetAll();
      }
    } catch {
      // error is already set by useMutation
    }
  };

  return (
    <div className="ef-page">
      <div className="ef-page-header">
        <h1 className="ef-page-title">{isEdit ? 'Editar evento' : 'Crear nuevo evento'}</h1>
        <p className="ef-page-subtitle">
          {isEdit ? `Editando: ${initialEvent.name}` : 'Completa los campos para publicar tu evento.'}
        </p>
      </div>

      <form className="ef-form" onSubmit={handleSubmit}>

        {/* ── Top 2-column grid ── */}
        <div className="ef-top-grid">

          {/* Card 1: Basic Info */}
          <div className="ef-card">
            <CardHeader number="1" title="Información básica" subtitle="Nombre, categoría y estado" />
            <InputField
              id="ev-name"
              label="Nombre del evento"
              placeholder="Ej. Rock Fest 2026"
              value={form.name}
              onChange={updateForm('name')}
              required
            />
            <div className="ef-field">
              <label className="input-label" htmlFor="ev-description">Descripción</label>
              <textarea
                id="ev-description"
                className="ef-textarea"
                placeholder="Breve descripción del evento…"
                value={form.description}
                onChange={updateForm('description')}
                rows={4}
              />
            </div>
            <div className="ef-grid-2">
              <div className="ef-field">
                <label className="input-label" htmlFor="ev-category">
                  Categoría<span className="input-required"> *</span>
                </label>
                <select id="ev-category" className="ef-select" value={form.category} onChange={updateForm('category')} required>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="ef-field">
                <label className="input-label" htmlFor="ev-status">
                  Estado<span className="input-required"> *</span>
                </label>
                <select id="ev-status" className="ef-select" value={form.status} onChange={updateForm('status')} required>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Venue & Dates */}
          <div className="ef-card">
            <CardHeader number="2" title="Recinto y fechas" subtitle="Lugar, horarios e imagen" />
            <div className="ef-grid-2">
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
                placeholder="Estadio Nacional"
                value={form.venueName}
                onChange={updateForm('venueName')}
              />
            </div>
            <div className="ef-grid-2">
              <InputField
                id="ev-start"
                label="Fecha de inicio"
                type="datetime-local"
                value={form.startDate}
                onChange={updateForm('startDate')}
                required
              />
              <InputField
                id="ev-end"
                label="Fecha de fin"
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
              placeholder="https://example.com/imagen.jpg"
              value={form.imageUrl}
              onChange={updateForm('imageUrl')}
            />
          </div>
        </div>

        {/* ── Card 3: Localities ── */}
        <div className="ef-card">
          <CardHeader
            number="3"
            title="Localidades"
            subtitle="Zonas de acceso con precio"
            action={
              <button type="button" className="ef-add-locality" onClick={addLocality}>
                <PlusIcon /> Agregar zona
              </button>
            }
          />
          <div className="ef-localities-grid">
            {localities.map((loc, index) => (
              <div className="ef-locality" key={index}>
                <div className="ef-locality-header">
                  <span className="ef-locality-badge">Zona {index + 1}</span>
                  {localities.length > 1 && (
                    <button type="button" className="ef-remove-locality" onClick={() => removeLocality(index)} aria-label="Quitar zona">
                      <TrashIcon /> Quitar
                    </button>
                  )}
                </div>
                <div className="ef-grid-2">
                  <InputField
                    id={`loc-name-${index}`}
                    label="Nombre"
                    placeholder="VIP, General…"
                    value={loc.name}
                    onChange={updateLocality(index, 'name')}
                  />
                  <InputField
                    id={`loc-price-${index}`}
                    label="Precio (USD)"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={loc.price}
                    onChange={updateLocality(index, 'price')}
                  />
                </div>
                <InputField
                  id={`loc-desc-${index}`}
                  label="Descripción (opcional)"
                  placeholder="Zona frontal con mejor vista…"
                  value={loc.description}
                  onChange={updateLocality(index, 'description')}
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="ef-error">{error}</p>}
        {success && <p className="ef-success">{success}</p>}

        <div className="ef-actions">
          <button type="button" className="ef-cancel" onClick={handleCancel} disabled={loading}>
            Cancelar
          </button>
          <PrimaryButton type="submit" loading={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear evento'}
          </PrimaryButton>
        </div>

      </form>
    </div>
  );
}
