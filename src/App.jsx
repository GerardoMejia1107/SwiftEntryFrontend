import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/login/LoginPage';
import RegisterOrganizerPage from './pages/registerOrganizer/RegisterOrganizerPage';
import RegisterPage from './pages/registerUser/RegisterPage';

const WelcomeUser = () => <h1>Bienvenido usuario normal</h1>;
const WelcomeOrganizer = () => <h1>Bienvenido organizador</h1>;
const WelcomeAdmin = () => <h1>Bienvenido usuario administrador</h1>;

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-organizer" element={<RegisterOrganizerPage />} />
          
          
          <Route path="/home-user" element={<WelcomeUser />} />
          <Route path="/home-organizer" element={<WelcomeOrganizer />} />
          <Route path="/home-admin" element={<WelcomeAdmin />} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}