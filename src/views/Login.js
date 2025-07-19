import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../controllers/authController';
import Footer from '../components/Footer';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(usuario, senha);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, var(--primary) 0%, var(--secondary) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl) 0',
      }}>
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          padding: 'var(--spacing-2xl) var(--spacing-xl)',
          minWidth: 340,
          maxWidth: 380,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeIn 0.5s',
        }}>
          <img src="/logo-top.jpg" alt="Logo" style={{ height: 48, marginBottom: 18, display: 'block' }} />
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <div style={{
              fontWeight: 700,
              fontSize: 28,
              color: 'var(--primary)',
              letterSpacing: 0.5,
              marginBottom: 2,
              fontFamily: 'inherit',
            }}>
              Top Alumínio
            </div>
            <div style={{
              color: 'var(--text-light)',
              fontSize: 14,
              marginBottom: 2,
              fontWeight: 400,
              letterSpacing: 0.1,
            }}>
              Sistema de Gestão e Vendas
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ width: '100%' }} autoComplete="off">
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block',
                color: 'var(--text)',
                fontWeight: 500,
                marginBottom: 6,
                fontSize: 14,
              }}>Usuário</label>
              <input
                type="text"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  background: 'var(--background)',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                }}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block',
                color: 'var(--text)',
                fontWeight: 500,
                marginBottom: 6,
                fontSize: 14,
              }}>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  background: 'var(--background)',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                }}
                required
                disabled={loading}
              />
            </div>
            {error && <div style={{ color: 'var(--error)', marginBottom: 16, fontSize: 13, textAlign: 'center' }}>{error}</div>}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 0',
                background: 'var(--primary)',
                color: 'var(--text-white)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: 16,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: 'var(--shadow-md)',
                letterSpacing: 0.2,
                transition: 'background 0.2s',
              }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login; 