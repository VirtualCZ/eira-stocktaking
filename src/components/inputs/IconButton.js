import React from 'react';

const VARIANT_STYLES = {
  primary: {
    background: '#282828',
    color: '#fff',
    border: '1px solid #282828',
  },
  secondary: {
    background: '#f0f1f3',
    color: '#282828',
    border: '1px solid #d1d1d1',
  },
  danger: {
    background: '#FF6262',
    color: '#000',
    border: 'none',
  },
};

/**
 * IconButton component for icon-only actions
 * @param {object} props
 * @param {string} props.icon - Material icon name (required)
 * @param {'primary'|'secondary'|'danger'} [props.variant] - Button variant
 * @param {string} [props.borderRadius] - Border radius (e.g., '0.5rem', '1rem')
 * @param {number} [props.size] - Button size in px (width/height/padding)
 * @param {string} [props.className] - Additional className
 * @param {object} [props.style] - Additional style
 * @param {any} rest - Other button props
 */
const IconButton = ({
  icon,
  variant = 'primary',
  borderRadius = '1rem',
  size = 40,
  className = '',
  style = {},
  ...rest
}) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const mergedStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius,
    width: size,
    height: size,
    padding: 0,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    fontSize: 0, // Remove default button text size
    ...variantStyle,
    ...style,
  };

  return (
    <button
      type="button"
      className={`hover:opacity-80 active:opacity-80 focus:opacity-80 ${className}`}
      style={mergedStyle}
      {...rest}
    >
      <span className="material-icons-round" style={{ color: variantStyle.color, fontSize: 20 }}>
        {icon}
      </span>
    </button>
  );
};

export default IconButton; 