import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ReservationProvider } from './context/ReservationContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ReservationProvider>
        <App />
      </ReservationProvider>
    </AuthProvider>
  </StrictMode>,
)
