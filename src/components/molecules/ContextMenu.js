import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// ContextRow component for individual menu items
export function ContextRow({ icon, label, action, color = '#fff' }) {
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        action && action(e);
      }}
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
  const buttonRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    // Close menu on scroll
    function handleScroll() {
      setIsMenuOpen(false);
    }
    if (isMenuOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Default position: below and left-aligned
      let top = rect.bottom;
      let left = rect.left;
      setMenuPos({ top, left });
      // After menu is rendered, adjust if needed
      setTimeout(() => {
        if (menuRef.current) {
          const menuRect = menuRef.current.getBoundingClientRect();
          let newTop = top;
          let newLeft = left;
          // If menu overflows bottom, open upwards
          if (menuRect.bottom > window.innerHeight) {
            newTop = rect.top - menuRect.height;
            // If still overflows top, clamp to 8px from top
            if (newTop < 8) newTop = 8;
          }
          // If menu overflows right, shift left
          if (menuRect.right > window.innerWidth) {
            newLeft = window.innerWidth - menuRect.width - 8;
          }
          // If menu overflows left, clamp to 8px from left
          if (newLeft < 8) newLeft = 8;
          setMenuPos({ top: newTop, left: newLeft });
        }
      }, 0);
    }
  }, [isMenuOpen]);

  return (
    <span ref={buttonRef} style={{ display: 'inline-block' }}>
      <button
        type="button"
        onClick={e => {
          e.preventDefault();
          setIsMenuOpen(!isMenuOpen);
        }}
        className="focus:outline-none"
        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
      >
        <span className="material-icons-round text-black text-xl">more_horiz</span>
      </button>
      {isMenuOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            backgroundColor: '#282828',
            borderRadius: '16px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 3000,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </span>
  );
}