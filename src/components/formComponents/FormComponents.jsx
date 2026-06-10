import './FormComponents.css';

export function Logo({ size = 'md' }) {
  const sizes = { sm: 40, md: 56, lg: 72 };
  const px = sizes[size] || 56;
  return (
    <div className={`logo logo--${size}`} style={{ width: px, height: px }}>
      <svg width={px * 0.55} height={px * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M16 11c0 2.21-1.79 4-4 4s-4-1.79-4-4V6h2v5c0 1.1.9 2 2 2s2-.9 2-2V6h2v5zM20 4H4v2h16V4zM4 18h16v2H4v-2z" fill="white" opacity="0.9"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white"/>
      </svg>
    </div>
  );
}

export function BrandLogo({ size = 'md' }) {
  const sizes = { sm: 40, md: 56, lg: 72 };
  const px = sizes[size] || 56;
  return (
    <div className={`brand-logo brand-logo--${size}`} style={{ width: px, height: px }}>
      <svg width={Math.round(px * 0.52)} height={Math.round(px * 0.52)} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2z" fill="white" opacity="0.15"/>
        <path d="M9 9h10M9 14h6M9 19h8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="19" cy="19" r="4" fill="white"/>
        <path d="M17.5 19l1.2 1.2 2.3-2.2" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export function InputField({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  rightIcon,
  onRightIconClick,
  error,
  required,
  ...props
}) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
          {required && <span className="input-required"> *</span>}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''}`}>
        {icon && <span className="input-icon input-icon--left">{icon}</span>}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`input-field ${icon ? 'input-field--has-left-icon' : ''} ${rightIcon ? 'input-field--has-right-icon' : ''}`}
          required={required}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            className="input-icon input-icon--right input-icon--btn"
            onClick={onRightIconClick}
            tabIndex={-1}
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}

export function SectionLabel({ children }) {
  return <p className="section-label">{children}</p>;
}

export function PrimaryButton({ children, type = 'button', onClick, disabled, loading }) {
  return (
    <button
      type={type}
      className="btn-primary"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="btn-spinner" />
      ) : (
        children
      )}
    </button>
  );
}

export function CheckboxField({ id, label, checked, onChange }) {
  return (
    <label className="checkbox-field" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="checkbox-input"
      />
      <span className="checkbox-custom" />
      <span className="checkbox-label">{label}</span>
    </label>
  );
}
