import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roleRoutes, DEFAULT_ROUTE } from '../../router/roleRoutes';

export default function UnauthorizedPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const goHome = () => {
    const destination = auth ? (roleRoutes[auth.role] ?? DEFAULT_ROUTE) : '/login';
    navigate(destination, { replace: true });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <button onClick={goHome}>Go to my home page</button>
    </div>
  );
}
