import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Importações das views (ainda serão criadas)
import Dashboard from './views/Dashboard';
import Users from './views/Users';
import Clients from './views/Clients';
import Vendedores from './views/Vendedores';
import Products from './views/Products';
import Sales from './views/Sales';
import Login from './views/Login';
import Menu from './components/Menu';
import { isAuthenticated } from './controllers/authController';
import BudgetsPage from './views/BudgetsPage';
import OrcamentoPrint from './components/OrcamentoPrint';
import ReciboVendaPrint from './components/ReciboVendaPrint';
import NotificacoesPage from './views/NotificacoesPage';
import Toast from './components/Toast';
import { getAlertas } from './controllers/alertasController';
import { getOrcamentos } from './controllers/orcamentosController';
import { getClients } from './controllers/clientsController';
import Footer from './components/Footer';

function PrivateRoute({ element, onlyAdmin }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (onlyAdmin && user && user.tipo === 'comum') return <Navigate to="/" />;
  return element;
}

function Header() {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard';
      case '/usuarios': return 'Usuários';
      case '/clientes': return 'Clientes';
      case '/vendedores': return 'Vendedores';
      case '/produtos': return 'Produtos';
      case '/vendas': return 'Vendas';
      case '/orcamentos': return 'Orçamentos';
      default: return 'Página';
    }
  };

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: 'var(--spacing-md) var(--spacing-lg)',
      marginLeft: 240,
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text)'
          }}>
            {getPageTitle()}
          </h1>
          <p style={{
            margin: 'var(--spacing-xs) 0 0 0',
            color: 'var(--text-light)',
            fontSize: '0.75rem'
          }}>
            Sistema de Gestão Top Alumínio
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)'
        }}>
          <div style={{
            background: 'var(--border-light)',
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--text-light)'
          }}>
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isPrint = location.pathname.startsWith('/orcamentos/print') || location.pathname.startsWith('/recibo-venda/');

  // Toast de lembretes do dia
  const [lembretesHoje, setLembretesHoje] = React.useState([]);
  const [orcamentos, setOrcamentos] = React.useState([]);
  const [clientes, setClientes] = React.useState([]);
  const [toastIndex, setToastIndex] = React.useState(0);
  const [showToast, setShowToast] = React.useState(false);

  React.useEffect(() => {
    // Checar expiração do login (8 horas)
    const loginTime = Number(localStorage.getItem('loginTime'));
    if (loginTime && Date.now() - loginTime > 8 * 60 * 60 * 1000) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      window.location.href = '/login';
      return;
    }
    async function fetchLembretesHoje() {
      const resL = await getAlertas();
      const resO = await getOrcamentos();
      const resC = await getClients();
      setOrcamentos(resO.success ? resO.data : []);
      setClientes(resC.success ? resC.data : []);
      if (resL.success) {
        const hojeStr = new Date().toISOString().slice(0, 10);
        const lembretes = resL.data.filter(l => l.dataAlert && l.dataAlert.slice(0, 10) === hojeStr);
        setLembretesHoje(lembretes);
        setShowToast(lembretes.length > 0);
        setToastIndex(0);
      }
    }
    fetchLembretesHoje();
  }, [location.pathname]); // Atualiza toast e checa login ao mudar de rota

  function getClienteNome(orcamentoFK) {
    const orc = orcamentos.find(o => String(o.id) === String(orcamentoFK));
    if (orc && clientes.length > 0) {
      const clienteObj = clientes.find(c => String(c.id) === String(orc.clienteFK));
      return clienteObj ? clienteObj.nome : `Cliente #${orc.clienteFK}`;
    }
    return '-';
  }

  function handleNextToast() {
    if (toastIndex < lembretesHoje.length - 1) {
      setToastIndex(toastIndex + 1);
    } else {
      setShowToast(false);
    }
  }
  
  return (
    <>
      {!isLogin && !isPrint && <Menu />}
      {!isLogin && !isPrint && <Header />}
      {/* Toast de lembretes do dia */}
      {!isLogin && !isPrint && showToast && lembretesHoje.length > 0 && (
        <Toast
          open={showToast}
          message={<>
            <b>Lembrete de Orçamento</b><br />
            <span><b>Cliente:</b> {getClienteNome(lembretesHoje[toastIndex].orcamentoFK)}</span><br />
            <span><b>Observação:</b> {lembretesHoje[toastIndex].note}</span>
          </>}
          action={
            <button
              style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => {
                window.location.href = `/orcamentos?goto=${lembretesHoje[toastIndex].orcamentoFK}`;
              }}
            >Ver Orçamento</button>
          }
          onClose={handleNextToast}
          duration={8000}
        />
      )}
      <main style={{ 
        marginLeft: !isLogin && !isPrint ? 240 : 0,
        paddingTop: !isLogin && !isPrint ? 0 : 0,
        minHeight: '100vh',
        background: 'var(--background)'
      }}>
        <Routes>
          {/* Rotas principais */}
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/usuarios" element={<PrivateRoute onlyAdmin={true} element={<Users />} />} />
          <Route path="/clientes" element={<PrivateRoute element={<Clients />} />} />
          <Route path="/vendedores" element={<PrivateRoute element={<Vendedores />} />} />
          <Route path="/produtos" element={<PrivateRoute element={<Products />} />} />
          <Route path="/vendas" element={<PrivateRoute element={<Sales />} />} />
          <Route path="/orcamentos" element={<PrivateRoute element={<BudgetsPage />} />} />
          <Route path="/orcamentos/print/:id" element={<PrivateRoute element={<OrcamentoPrint />} />} />
          <Route path="/recibo-venda/:id" element={<ReciboVendaPrint />} />
          <Route path="/notificacoes" element={<PrivateRoute element={<NotificacoesPage />} />} />
          <Route path="/login" element={<Login />} />
          {/* Por enquanto, redireciona para login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
      {!isPrint && <Footer />}
    </>
  );
}

export default App;
