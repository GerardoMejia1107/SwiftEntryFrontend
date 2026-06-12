import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function OrganizerHomePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome, Organizer</h1>
      <p>You are logged in as <strong>ROLE_ORGANIZER</strong>.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
