import React, { useEffect, useState } from 'react';
import { getAlertas, updateAlerta, deleteAlerta } from '../controllers/alertasController';
import { getOrcamentos } from '../controllers/orcamentosController';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

function NotificacoesPage() {
  const [lembretes, setLembretes] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [editando, setEditando] = useState(null); // { id, observacao, dataAlert }
  const [obs, setObs] = useState('');
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalMsg, setModalMsg] = useState({ open: false, title: '', message: '', type: 'info', onConfirm: null });
  const [modalConfirm, setModalConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const resL = await getAlertas();
      const resO = await getOrcamentos();
      setLembretes(resL.success ? resL.data : []);
      setOrcamentos(resO.success ? resO.data : []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  function getClienteNome(orcamentoFK) {
    const orc = orcamentos.find(o => String(o.id) === String(orcamentoFK));
    return orc && orc.cliente_nome ? orc.cliente_nome : (orc && orc.clienteFK ? `Cliente #${orc.clienteFK}` : '-');
  }

  async function handleSalvar() {
    if (!obs || !data) { 
      setModalMsg({ open: true, title: 'Atenção', message: 'Preencha todos os campos!', type: 'warning', onConfirm: null });
      return; 
    }
    const res = await updateAlerta(editando.id, { note: obs, dataAlert: data });
    if (res.success) {
      setLembretes(lembretes.map(l => l.id === editando.id ? { ...l, note: obs, dataAlert: data } : l));
      setEditando(null); setObs(''); setData('');
    } else {
      setModalMsg({ open: true, title: 'Erro', message: 'Erro ao salvar: ' + res.message, type: 'error', onConfirm: null });
    }
  }

  async function handleExcluir(id) {
    setModalConfirm({
      open: true,
      title: 'Confirmar Exclusão',
      message: 'Excluir este lembrete?',
      onConfirm: async () => {
        const res = await deleteAlerta(id);
        if (res.success) setLembretes(lembretes.filter(l => l.id !== id));
        else setModalMsg({ open: true, title: 'Erro', message: 'Erro ao excluir: ' + res.message, type: 'error', onConfirm: null });
      }
    });
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Notificações / Lembretes</h2>
      {loading ? <div>Carregando...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <thead>
            <tr style={{ background: '#f6fff8' }}>
              <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Data</th>
              <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Cliente</th>
              <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Observação</th>
              <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lembretes.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: 20 }}>Nenhum lembrete cadastrado</td></tr>}
            {lembretes.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: 8 }}>{l.dataAlert ? new Date(l.dataAlert).toLocaleDateString('pt-BR') : ''}</td>
                <td style={{ padding: 8 }}>{getClienteNome(l.orcamentoFK)}</td>
                <td style={{ padding: 8 }}>
                  {editando && editando.id === l.id ? (
                    <input value={obs} onChange={e => setObs(e.target.value)} style={{ width: '100%' }} />
                  ) : l.note}
                </td>
                <td style={{ padding: 8 }}>
                  {editando && editando.id === l.id ? (
                    <>
                      <input type="date" value={data} onChange={e => setData(e.target.value)} style={{ marginRight: 8 }} />
                      <button onClick={handleSalvar} style={{ color: '#10b981', marginRight: 8 }}>Salvar</button>
                      <button onClick={() => { setEditando(null); setObs(''); setData(''); }} style={{ color: '#888' }}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditando(l); setObs(l.note); setData(l.dataAlert ? l.dataAlert.slice(0,10) : ''); }} style={{ color: '#f59e42', marginRight: 8 }}>Editar</button>
                      <button onClick={() => handleExcluir(l.id)} style={{ color: '#ef4444', marginRight: 8 }}>Excluir</button>
                      <button onClick={() => navigate(`/orcamentos?goto=${l.orcamentoFK}`)} style={{ color: '#2563eb' }}>Ver Orçamento</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal
        isOpen={modalMsg.open}
        onClose={() => setModalMsg({ ...modalMsg, open: false })}
        title={modalMsg.title}
        message={modalMsg.message}
        type={modalMsg.type}
        showCancel={false}
        confirmText="OK"
        onConfirm={modalMsg.onConfirm}
      />
      <Modal
        isOpen={modalConfirm.open}
        onClose={() => setModalConfirm({ ...modalConfirm, open: false })}
        title={modalConfirm.title}
        message={modalConfirm.message}
        type="warning"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={modalConfirm.onConfirm}
      />
    </div>
  );
}

export default NotificacoesPage; 