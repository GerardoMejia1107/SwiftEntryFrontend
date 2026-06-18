import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/authLayout/AuthLayout';
import {
  InputField,
  PrimaryButton,
  CheckboxField,
} from '../../components/formComponents/FormComponents.jsx';
import './RegisterOrganizerPage.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="1"/>
    <path d="M3 9h18M9 21V9"/>
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const IdIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M8 10h.01M8 14h.01M12 10h4M12 14h4"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l1.12-.85a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const STEPS = [
  { label: 'Organización' },
  { label: 'Credenciales' },
  { label: 'Contacto' },
];

const STEP_FIELDS = [
  ['orgName', 'repNombre', 'repApellido'],
  ['email', 'password'],
  ['duiRegistro', 'telefono', 'direccion'],
];

export default function RegisterOrganizerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    orgName: '',
    repNombre: '',
    repApellido: '',
    email: '',
    password: '',
    duiRegistro: '',
    telefono: '',
    direccion: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validateStep = (s = step) => {
    const newErrors = {};
    STEP_FIELDS[s].forEach(f => {
      if (!form[f]) newErrors[f] = 'Requerido';
    });
    if (s === 2 && !accepted) newErrors.accepted = 'Debes aceptar los términos';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const goBack = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const topNav = (
    <div className="register-topnav">
      <button className="back-btn" onClick={() => navigate('/login')}>
        <BackIcon />
      </button>
      <span className="brand-name">SwiftEntry</span>
    </div>
  );

  return (
    <AuthLayout topNav={topNav}>
      <div className="register-org-header">
        <h1 className="register-org-title">Crear Cuenta de Organizador</h1>
        <p className="register-org-subtitle">
          Únete como profesional para gestionar tus eventos.
        </p>
      </div>

      <div className="step-indicator">
        {STEPS.map((s, i) => (
          <>
            <div key={i} className="step-item">
              <div className={`step-dot ${i < step ? 'step-dot--done' : ''} ${i === step ? 'step-dot--active' : ''}`}>
                {i < step ? <CheckIcon /> : i + 1}
              </div>
              <span className={`step-label ${i === step ? 'step-label--active' : ''}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div key={`connector-${i}`} className={`step-connector ${i < step ? 'step-connector--done' : ''}`} />
            )}
          </>
        ))}
      </div>

      <form className="register-org-form" onSubmit={handleSubmit} noValidate>
        <div className="step-panel" key={step}>
          {step === 0 && (
            <>
              <InputField
                id="orgName"
                label="Nombre de la Organización"
                placeholder="Ej. Eventos SA"
                value={form.orgName}
                onChange={update('orgName')}
                icon={<BuildingIcon />}
                required
                error={errors.orgName}
              />
              <div className="form-row">
                <InputField
                  id="repNombre"
                  label="Nombre"
                  placeholder="Representante"
                  value={form.repNombre}
                  onChange={update('repNombre')}
                  required
                  error={errors.repNombre}
                />
                <InputField
                  id="repApellido"
                  label="Apellido"
                  placeholder="Representante"
                  value={form.repApellido}
                  onChange={update('repApellido')}
                  required
                  error={errors.repApellido}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <InputField
                id="emailOrg"
                label="Correo electrónico profesional"
                type="email"
                placeholder="nombre@empresa.com"
                value={form.email}
                onChange={update('email')}
                icon={<MailIcon />}
                required
                error={errors.email}
              />
              <InputField
                id="passwordOrg"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={update('password')}
                icon={<LockIcon />}
                rightIcon={<EyeIcon open={showPassword} />}
                onRightIconClick={() => setShowPassword(v => !v)}
                required
                error={errors.password}
              />
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-row">
                <InputField
                  id="duiRegistro"
                  label="DUI o Registro Fiscal"
                  placeholder="00000000-0"
                  value={form.duiRegistro}
                  onChange={update('duiRegistro')}
                  icon={<IdIcon />}
                  required
                  error={errors.duiRegistro}
                />
                <InputField
                  id="telefonoOrg"
                  label="Teléfono de contacto"
                  type="tel"
                  placeholder="7000-0000"
                  value={form.telefono}
                  onChange={update('telefono')}
                  icon={<PhoneIcon />}
                  required
                  error={errors.telefono}
                />
              </div>
              <InputField
                id="direccion"
                label="Dirección de la empresa"
                placeholder="Calle, número, colonia"
                value={form.direccion}
                onChange={update('direccion')}
                icon={<MapPinIcon />}
                required
                error={errors.direccion}
              />
              <CheckboxField
                id="termsOrg"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                label={
                  <>
                    Acepto los{' '}
                    <a href="#terms">Términos de Servicio</a> y la{' '}
                    <a href="#privacy">Política de Privacidad</a> de SwiftEntry Pro.
                  </>
                }
              />
              {errors.accepted && <p className="field-error">{errors.accepted}</p>}
            </>
          )}
        </div>

        <div className="step-nav">
          {step > 0 && (
            <button type="button" className="btn-back" onClick={goBack}>
              ← Anterior
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn-primary" onClick={goNext}>
              Siguiente →
            </button>
          ) : (
            <PrimaryButton type="submit" loading={loading} disabled={!accepted}>
              Registrar Organización →
            </PrimaryButton>
          )}
        </div>
      </form>

      <div className="register-org-footer">
        <p>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            ¿Ya tienes una cuenta? Iniciar Sesión
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
