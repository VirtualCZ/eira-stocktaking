import { useState, useRef, useEffect, useLayoutEffect, Children, isValidElement, cloneElement } from 'react';
import { createPortal } from 'react-dom';

const PAD = { y: 8, x: 16, edge: 15 };
const VIEWPORT_INSET = 8;

const styles = {
  trigger: {
    background: 'none',
    border: 'none',
    padding: '5px',
    margin: '-5px',
    cursor: 'pointer',
  },
  row: {
    background: 'none',
    border: 'none',
    margin: 0,
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    textAlign: 'left',
    WebkitTapHighlightColor: 'transparent',
  },
  panel: {
    position: 'fixed',
    backgroundColor: '#282828',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 3000,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
};

function rowPadding(index, count) {
  const { y, x, edge } = PAD;
  const sides = `${x}px`;
  if (count === 1) return `${edge}px ${sides}`;
  if (index === 0) return `${edge}px ${sides} ${y}px`;
  if (index === count - 1) return `${y}px ${sides} ${edge}px`;
  return `${y}px ${sides}`;
}

function placeMenu(anchor, menu) {
  let top = anchor.bottom;
  let left = anchor.left;

  if (left + menu.width > window.innerWidth) left = anchor.right - menu.width;
  if (anchor.bottom + menu.height > window.innerHeight) top = anchor.top - menu.height;

  top = Math.max(VIEWPORT_INSET, top);
  left = Math.max(VIEWPORT_INSET, left);
  left = Math.min(left, window.innerWidth - menu.width - VIEWPORT_INSET);

  return { top, left };
}

export function ContextRow({ icon, label, action, color = '#fff', closeMenu, rowPadding: padding }) {
  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await action?.(e);
    } finally {
      closeMenu?.();
    }
  };

  return (
    <button type="button" onClick={handleClick} style={{ ...styles.row, padding }}>
      <span className="material-icons-round" style={{ fontSize: 14, color, flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ fontSize: 12, color, lineHeight: 1 }}>{label}</span>
    </button>
  );
}

export function ContextButton({ children }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const items = Children.toArray(children).filter(isValidElement);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    const onPointerDown = (e) => {
      if (menuRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      close();
    };
    const onScroll = () => close();

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('scroll', onScroll);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || position || !menuRef.current || !triggerRef.current) return;
    setPosition(placeMenu(
      triggerRef.current.getBoundingClientRect(),
      menuRef.current.getBoundingClientRect(),
    ));
  }, [open, position]);

  const menu = open && (
    <div
      ref={menuRef}
      style={{
        ...styles.panel,
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        visibility: position ? 'visible' : 'hidden',
      }}
    >
      {items.map((child, i) =>
        cloneElement(child, {
          closeMenu: close,
          rowPadding: rowPadding(i, items.length),
        })
      )}
    </div>
  );

  return (
    <span ref={triggerRef} style={{ display: 'inline-block' }}>
      <button
        type="button"
        className="focus:outline-none"
        style={styles.trigger}
        aria-label="Další akce"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
      >
        <span className="material-icons-round text-black text-xl">more_horiz</span>
      </button>
      {typeof window !== 'undefined' && menu && createPortal(menu, document.body)}
    </span>
  );
}
