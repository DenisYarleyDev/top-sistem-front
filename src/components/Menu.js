import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import colors from '../assets/styles/colors';
import { logout, getCurrentUser } from '../controllers/authController';
import { translateUserType } from '../utils/userUtils';

const menuItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/usuarios', label: 'Usuários' },
  { path: '/clientes', label: 'Clientes' },
  { path: '/vendedores', label: 'Vendedores' },
  { path: '/produtos', label: 'Produtos' },
  { path: '/vendas', label: 'Vendas' },
  { path: '/orcamentos', label: 'Orçamentos' },
  { path: '/notificacoes', label: 'Notificações' },
];

function Menu() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Filtrar menu para tipo comum
  const filteredMenuItems = user && user.tipo === 'comum'
    ? menuItems.filter(item => item.path !== '/usuarios')
    : menuItems;

  return (
    <nav style={{
      width: 240,
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--primary) 0%, var(--secondary) 100%)',
      color: 'var(--text-white)',
      padding: 'var(--spacing-lg)',
      boxSizing: 'border-box',
      position: 'fixed',
      top: 0,
      left: 0,
      boxShadow: 'var(--shadow-xl)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo/Brand */}
      <div style={{
        textAlign: 'center',
        marginBottom: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-lg)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ 
          color: 'var(--text-white)', 
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}>
          Top Alumínio
        </h2>
        <p style={{
          margin: 'var(--spacing-xs) 0 0 0',
          fontSize: '0.75rem',
          opacity: 0.8,
          fontWeight: 400
        }}>
          Sistema de Gestão e Vendas
        </p>
      </div>

      {/* User Info */}
      {user && (
        <div style={{ 
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 'var(--spacing-xs)'
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--spacing-sm)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>
              {user.nome && user.nome.length > 0 ? user.nome[0] : ''}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600,
                fontSize: '0.8rem',
                marginBottom: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user.nome}
              </div>
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.8,
                background: 'rgba(255,255,255,0.2)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-block'
              }}>
                {translateUserType(user.tipo)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <ul style={{ 
        listStyle: 'none', 
        padding: 0,
        margin: 0,
        flex: 1
      }}>
        {filteredMenuItems.map(item => (
          <li key={item.path} style={{ marginBottom: 'var(--spacing-xs)' }}>
            <Link
              to={item.path}
              style={{
                display: 'block',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                color: location.pathname === item.path ? 'var(--text-white)' : 'rgba(255,255,255,0.8)',
                fontWeight: location.pathname === item.path ? 600 : 400,
                textDecoration: 'none',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.2s ease',
                border: location.pathname === item.path ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 'var(--spacing-md)'
      }}>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          style={{
            width: '100%',
            padding: 'var(--spacing-sm)',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 1)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.9)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Sair
        </button>
      </div>
    </nav>
  );
}

export default Menu; 