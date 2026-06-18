import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/authLayout/AuthLayout';
import {
  InputField,
  PrimaryButton,
  CheckboxField,
} from '../../components/formComponents/FormComponents.jsx';
import { registerUser } from '../../api/auth';
import './RegisterPage.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const STEPS = [
  { label: 'Personal' },
  { label: 'Cuenta' },
  { label: 'Dirección' },
];

const STEP_FIELDS = [
  ['nombre', 'apellido', 'fechaNacimiento'],
  ['email', 'password', 'dui', 'telefono'],
  ['streetAddress', 'municipality', 'department', 'country'],
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    dui: '',
    telefono: '',
    fechaNacimiento: '',
    streetAddress: '',
    municipality: '',
    department: '',
    country: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);

    const payload = {
      name: form.nombre,
      lastName: form.apellido,
      email: form.email,
      password: form.password,
      dui: form.dui,
      phoneNumber: form.telefono,
      birthDate: form.fechaNacimiento,
      roleId: 3,
      address: {
        streetAddress: form.streetAddress,
        municipality: form.municipality,
        department: form.department,
        country: form.country,
      },
    };

    try {
      await registerUser(payload);
      alert('Registro exitoso');
      navigate('/login');
    } catch (error) {
      console.error('Status:', error.response?.status);
      console.error('Response body:', JSON.stringify(error.response?.data, null, 2));
      console.error('Full error:', error);
      alert(error.response?.data?.message ?? `Error ${error.response?.status ?? ''}: ${JSON.stringify(error.response?.data) ?? 'Error al crear usuario'}`);
    } finally {
      setLoading(false);
    }
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
      <div className="register-header">
        <h1 className="register-title">Crear Cuenta</h1>
        <p className="register-subtitle">
          Únete a la plataforma de eventos más vibrante.<br />
          Gestiona tus tickets con confianza.
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

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="step-panel" key={step}>
          {step === 0 && (
            <>
              <div className="form-row">
                <InputField
                  id="nombre" label="Nombre" placeholder="Ej. Juan"
                  value={form.nombre} onChange={update('nombre')} required error={errors.nombre}
                />
                <InputField
                  id="apellido" label="Apellido" placeholder="Ej. Pérez"
                  value={form.apellido} onChange={update('apellido')} required error={errors.apellido}
                />
              </div>
              <InputField
                id="fechaNacimiento" label="Fecha de nacimiento" type="date"
                value={form.fechaNacimiento} onChange={update('fechaNacimiento')}
                icon={<CalendarIcon />} required error={errors.fechaNacimiento}
              />
            </>
          )}

          {step === 1 && (
            <>
              <InputField
                id="email" label="Correo electrónico" type="email"
                placeholder="nombre@ejemplo.com"
                value={form.email} onChange={update('email')}
                icon={<MailIcon />} required error={errors.email}
              />
              <InputField
                id="password" label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={form.password} onChange={update('password')}
                icon={<LockIcon />}
                rightIcon={<EyeIcon open={showPassword} />}
                onRightIconClick={() => setShowPassword(v => !v)}
                required error={errors.password}
              />
              <div className="form-row">
                <InputField
                  id="dui" label="DUI" placeholder="00000000-0"
                  value={form.dui} onChange={update('dui')} required error={errors.dui}
                />
                <InputField
                  id="telefono" label="Teléfono" type="tel" placeholder="7000-0000"
                  value={form.telefono} onChange={update('telefono')} required error={errors.telefono}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <InputField
                id="streetAddress" label="Dirección" placeholder="Calle, número, colonia"
                value={form.streetAddress} onChange={update('streetAddress')}
                required error={errors.streetAddress}
              />
              <div className="form-row">
                <InputField
                  id="municipality" label="Municipio" placeholder="Ej. San Salvador"
                  value={form.municipality} onChange={update('municipality')}
                  required error={errors.municipality}
                />
                <InputField
                  id="department" label="Departamento" placeholder="Ej. San Salvador"
                  value={form.department} onChange={update('department')}
                  required error={errors.department}
                />
              </div>
              <InputField
                id="country" label="País" placeholder="Ej. El Salvador"
                value={form.country} onChange={update('country')} required error={errors.country}
              />
              <CheckboxField
                id="terms" checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                label={
                  <>
                    Al crear una cuenta, acepto los{' '}
                    <a href="#terms">Términos de Servicio</a> y la{' '}
                    <a href="#privacy">Política de Privacidad</a>.
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
              Crear Cuenta →
            </PrimaryButton>
          )}
        </div>
      </form>

      <div className="register-footer">
        <p>
          ¿Ya tienes una cuenta?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            Iniciar Sesión
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
