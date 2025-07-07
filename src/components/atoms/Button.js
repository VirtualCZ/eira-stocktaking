import React from 'react';

// Button variants
const VARIANT_CLASSES = {
  primary: '', // uses BASE_STYLE
  secondary: '', // uses BASE_STYLE + SECONDARY_STYLE
  default: '', // uses BASE_STYLE
};

const BASE_STYLE = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#282828',
  color: '#fff',
  border: '1px solid #282828',
  borderRadius: '1rem',
  padding: '0.75rem',
  fontSize: '0.75rem',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const SECONDARY_STYLE = {
  background: '#f0f1f3',
  color: '#282828',
  border: '1px solid #d1d1d1',
};

const Button = ({
  children,
  icon,
  iconPosition = 'left',
  variant = 'default',
  className = '',
  style = {},
  ...rest
}) => {
  const isIconOnly = !children && icon;
  const variantClass = VARIANT_CLASSES[variant] || '';
  const mergedStyle =
    variant === 'secondary'
      ? { ...BASE_STYLE, ...SECONDARY_STYLE, ...style }
      : { ...BASE_STYLE, ...style };

  // Render icon: string = material-icons-round, else as node
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return (
        <span
          className="material-icons-round"
          style={{ fontSize: 20, marginLeft: iconPosition === 'right' && children ? 8 : 0, marginRight: iconPosition === 'left' && children ? 8 : 0 }}
        >
          {icon}
        </span>
      );
    }
    return icon;
  };

  return (
    <button
      className={`inline-flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#282828] ${variantClass} ${isIconOnly ? 'p-2 w-10 h-10 justify-center' : ''} ${className}`}
      style={mergedStyle}
      onMouseOver={e => {
        if (variant === 'secondary') e.currentTarget.style.background = '#e5e6e8';
      }}
      onMouseOut={e => {
        if (variant === 'secondary') e.currentTarget.style.background = '#f0f1f3';
      }}
      {...rest}
    >
      {icon && iconPosition === 'left' && renderIcon()}
      {children && <span>{children}</span>}
      {icon && iconPosition === 'right' && renderIcon()}
    </button>
  );
};

export default Button; 