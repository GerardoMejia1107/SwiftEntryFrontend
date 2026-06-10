import './AuthLayout.css';

export default function AuthLayout({ children, topNav }) {
  return (
    <div className="auth-layout">
      {topNav && (
        <header className="auth-topnav">
          {topNav}
        </header>
      )}
      <main className="auth-main">
        <div className="auth-card">
          {children}
        </div>
      </main>
    </div>
  );
}
