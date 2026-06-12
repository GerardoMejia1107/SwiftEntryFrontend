import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const accessToken = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    return accessToken ? { accessToken, role } : null;
  });

  const login = (tokenData) => {
    localStorage.setItem('accessToken', tokenData.accessToken);
    localStorage.setItem('refreshToken', tokenData.refreshToken);
    localStorage.setItem('role', tokenData.role);
    setAuth({ accessToken: tokenData.accessToken, role: tokenData.role });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
