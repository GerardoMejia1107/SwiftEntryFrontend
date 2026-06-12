import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/authLayout/AuthLayout';
import { BrandLogo, InputField, PrimaryButton } from '../../components/formComponents/FormComponents';
import { loginUser } from '../../api/authService';
import { useAuth } from '../../context/AuthContext';
import { roleRoutes, DEFAULT_ROUTE } from '../../router/roleRoutes';
import './LoginPage.css';

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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokenData = await loginUser({ email: form.email, password: form.password });
      login(tokenData);
      const destination = roleRoutes[tokenData.role] ?? DEFAULT_ROUTE;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-header">
        <BrandLogo size="md" />
        <h1 className="login-title">SwiftEntry</h1>
        <p className="login-subtitle">Bienvenido de vuelta</p>
        <p className="login-description">
          Inicia sesión para acceder a tus tickets digitales y próximos eventos.
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <InputField
          id="email"
          label="Correo electrónico"
          type="email"
          placeholder="nombre@ejemplo.com"
          value={form.email}
          onChange={update('email')}
          icon={<MailIcon />}
          required
        />

        <InputField
          id="password"
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={update('password')}
          icon={<LockIcon />}
          rightIcon={<EyeIcon open={showPassword} />}
          onRightIconClick={() => setShowPassword(v => !v)}
          required
        />

        <div className="login-forgot">
          <a href="#forgot">¿Olvidaste tu contraseña?</a>
        </div>

        {error && <p className="login-error">{error}</p>}

        <PrimaryButton type="submit" loading={loading}>
          Iniciar Sesión →
        </PrimaryButton>
      </form>

      <div className="login-footer">
        <p>
          ¿No tienes una cuenta?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
            Crear cuenta
          </a>
        </p>
        <p className="login-footer-organizer">
          ¿Eres organizador?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register-organizer'); }}>
            Registra tu organización
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
