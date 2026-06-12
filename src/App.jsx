import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/login/LoginPage';
import RegisterOrganizerPage from './pages/registerOrganizer/RegisterOrganizerPage';
import RegisterPage from './pages/registerUser/RegisterPage';

const WelcomeUser = () => <h1>Bienvenido usuario normal</h1>;
const WelcomeOrganizer = () => <h1>Bienvenido organizador</h1>;
const WelcomeAdmin = () => <h1>Bienvenido usuario administrador</h1>;

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage onNavigate={navigate} />} />
      <Route path="/register" element={<RegisterPage onNavigate={navigate} />} />
      <Route path="/register-organizer" element={<RegisterOrganizerPage onNavigate={navigate} />} />

      <Route path="/home-user" element={<WelcomeUser />} />
      <Route path="/home-organizer" element={<WelcomeOrganizer />} />
      <Route path="/home-admin" element={<WelcomeAdmin />} />

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}