const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

/** Mini gráfico de barras decorativo. */
function Sparkline({ bars = [40, 65, 50, 80, 60, 95], tone = 'up' }) {
  return (
    <div className={`stat-spark stat-spark--${tone}`}>
      {bars.map((h, i) => (
        <span key={i} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

/**
 * Tarjeta de métrica: etiqueta, valor, icono y tendencia.
 * Si `loading` es true muestra un placeholder en el valor.
 */
export default function StatCard({ label, value, icon, trend, loading }) {
  const tone = trend?.direction === 'down' ? 'down' : 'up';

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-icon">{icon}</span>
      </div>

      <p className="stat-card-value">{loading ? '—' : value}</p>

      <div className="stat-card-bottom">
        {trend && (
          <span className={`stat-trend stat-trend--${tone}`}>
            {tone === 'down' ? <TrendDownIcon /> : <TrendUpIcon />}
            {trend.value}
          </span>
        )}
        <Sparkline bars={trend?.bars} tone={tone} />
      </div>
    </div>
  );
}
