import React from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  onConfirm, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  showCancel = true,
  hideFooter = false,
  children 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'modal-success';
      case 'error':
        return 'modal-error';
      case 'warning':
        return 'modal-warning';
      case 'info':
      default:
        return 'modal-info';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.18)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div
        className={`modal ${getTypeClass()}`}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          minWidth: 340,
          maxWidth: 420,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          fontFamily: 'inherit',
        }}
      >
        <div className="modal-header" style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f1f1f1',
          padding: '22px 28px 12px 28px',
          background: 'transparent',
        }}>
          <div className="modal-icon" style={{ fontSize: 22, marginRight: 12, color: '#218838' }}>
            {getIcon()}
          </div>
          <h3 className="modal-title" style={{ flex: 1, fontSize: 20, fontWeight: 700, color: '#222', margin: 0, letterSpacing: 0.2 }}>{title}</h3>
          <button className="modal-close" onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: 24,
            color: '#888',
            cursor: 'pointer',
            marginLeft: 8,
            padding: 0,
            lineHeight: 1,
          }}>
            ×
          </button>
        </div>
        <div className="modal-body" style={{
          padding: '28px 28px 12px 28px',
          background: 'transparent',
          fontSize: 16,
          color: '#333',
          minHeight: 60,
        }}>
          {message && <p className="modal-message" style={{ margin: 0, marginBottom: 18, color: '#666', fontSize: 15 }}>{message}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {children}
          </div>
        </div>
        {!hideFooter && (
          <div className="modal-footer" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            padding: '0 28px 22px 28px',
            background: 'transparent',
          }}>
            {showCancel && (
              <button className="modal-btn modal-btn-secondary" onClick={handleCancel} style={{
                background: '#f3f4f6',
                color: '#333',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '8px 22px',
                fontWeight: 500,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}>
                {cancelText}
              </button>
            )}
            <button className="modal-btn modal-btn-primary" onClick={handleConfirm} style={{
              background: '#218838',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 22px',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}>
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 