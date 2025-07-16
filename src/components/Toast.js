import React from 'react';

function Toast({ open, message, action, onClose, duration = 6000 }) {
  React.useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      background: '#fffbe8',
      color: '#7c4700',
      border: '1px solid #ffe082',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: '16px 24px',
      zIndex: 2000,
      minWidth: 280,
      maxWidth: 400,
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }}>
      <div style={{ flex: 1 }}>{message}</div>
      {action}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7c4700', fontWeight: 700, fontSize: 18, marginLeft: 8, cursor: 'pointer' }}>×</button>
    </div>
  );
}

export default Toast; 