import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import React from 'react';

// ContextRow component for individual menu items
export function ContextRow({ icon, label, action, color = '#fff', closeMenu }) {
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        if (action) action(e);
        if (closeMenu) closeMenu();
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
  const [menuPos, setMenuPos] = useState(null);

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
    if (!isMenuOpen) {
      setMenuPos(null);
    }
  }, [isMenuOpen]);

  React.useLayoutEffect(() => {
    if (isMenuOpen && menuPos === null && menuRef.current && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      
      let newTop = rect.bottom;
      let newLeft = rect.left;

      if (rect.left + menuRect.width > window.innerWidth) {
        newLeft = rect.right - menuRect.width;
      }

      if (rect.bottom + menuRect.height > window.innerHeight) {
        newTop = rect.top - menuRect.height;
      }
      
      if (newTop < 8) newTop = 8;
      if (newLeft < 8) newLeft = 8;
      if (newLeft + menuRect.width > window.innerWidth) {
        newLeft = window.innerWidth - menuRect.width - 8;
      }

      setMenuPos({ top: newTop, left: newLeft });
    }
  }, [isMenuOpen, menuPos]);

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
            top: menuPos ? menuPos.top : -9999,
            left: menuPos ? menuPos.left : -9999,
            visibility: menuPos ? 'visible' : 'hidden',
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
          {React.Children.map(children, child =>
            React.cloneElement(child, { closeMenu: () => setIsMenuOpen(false) })
          )}
        </div>,
        document.body
      )}
    </span>
  );
}