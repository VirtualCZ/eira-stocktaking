import { useState, useRef, useEffect } from 'react';

// ContextRow component for individual menu items
export function ContextRow({ icon, label, action, color = '#fff' }) {
  return (
    <button
      onClick={action}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      <span className="material-icons-round" style={{ fontSize: '14px', color }}>
        {icon}
      </span>
      <span style={{ fontSize: '12px', color }}>
        {label}
      </span>
    </button>
  );
}

// ContextButton component that contains the menu
export function ContextButton({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsMenuOpen(!isMenuOpen);
        }}
        className="focus:outline-none"
        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
      >
        <span className="material-icons-round text-black text-xl">more_horiz</span>
      </button>

      {isMenuOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          backgroundColor: '#282828',
          borderRadius: '16px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 1000,
          minWidth: '50px'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}