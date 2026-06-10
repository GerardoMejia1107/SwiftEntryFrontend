import { useState } from 'react';
import './App.css';
import LoginPage from './pages/login/LoginPage';
import RegisterOrganizerPage from './pages/registerOrganizer/RegisterOrganizerPage';
import RegisterPage from './pages/registerUser/RegisterPage';

export default function App() {
  const [page, setPage] = useState('register'); // 'login', 'register', 'register-organizer'

  return (
    <div className="app">
      {page === 'login' && <LoginPage onNavigate={setPage} />}
      {page === 'register' && <RegisterPage onNavigate={setPage} />}
      {page === 'register-organizer' && <RegisterOrganizerPage onNavigate={setPage} />}
    </div>
  );
}
