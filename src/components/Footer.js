import React from 'react';

const footerStyle = {
  width: '100%',
  textAlign: 'center',
  padding: '0.7px 0 0.7px 0',
  background: 'rgba(255,255,255,0.92)',
  color: '#64748b',
  fontSize: '0.59rem',
  position: 'fixed',
  left: 0,
  bottom: 0,
  zIndex: 999,
  boxShadow: '0 -1px 4px 0 rgba(0,0,0,0.04)',
  letterSpacing: 0.012,
  fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0,
  minHeight: 13,
};

const nameStyle = {
  color: '#218838',
  fontWeight: 600,
  fontSize: '0.63rem',
  letterSpacing: 0.05,
  fontFamily: 'inherit',
  display: 'inline-block',
  marginLeft: 1,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'color 0.2s',
};

const iconStyle = {
  fontSize: '0.63em',
  verticalAlign: 'middle',
  marginRight: 1,
  color: '#43a047',
};

export default function Footer() {
  return (
    <footer style={footerStyle} className="footer-watermark">
      <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:3}}>
        <span style={iconStyle}>©</span>
        <span>
          Sistema de gestão e vendas desenvolvido por{' '}
          <a
            href="https://instagram.com/denisftosa"
            target="_blank"
            rel="noopener noreferrer"
            style={nameStyle}
            aria-label="Instagram de Denis Yarley"
          >
            Denis Yarley
          </a>
          , todos os direitos reservados. Versão 1.0 • 2025
        </span>
      </span>
    </footer>
  );
} 