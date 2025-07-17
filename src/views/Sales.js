import React, { useState, useEffect } from 'react';
import colors from '../assets/styles/colors';
import { API_CONFIG } from '../assets/styles/colors';
import Modal from '../components/Modal';

const ABAS = [
  { label: 'Faturada', status: 'faturada' },
  { label: 'Cancelada', status: 'cancelada' }
];

function Sales() {
  const [aba, setAba] = useState(0);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState({ open: false, title: '', message: '', type: 'info', onConfirm: null });
  const [modalConfirm, setModalConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    async function fetchVendas() {
      setLoading(true);
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/vendas/${ABAS[aba].status}`);
        const data = await res.json();
        setVendas(Array.isArray(data) ? data : []);
      } catch (e) {
        setVendas([]);
      }
      setLoading(false);
    }
    fetchVendas();
  }, [aba]);

  async function concluirVenda(id, orcamento_id) {
    setModalConfirm({
      open: true,
      title: 'Confirmar Conclusão',
      message: 'Deseja marcar esta venda como concluída?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_CONFIG.BASE_URL}/api/vendas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orcamento_id, observacoes: '' })
          });
          if (!res.ok) throw new Error('Erro ao concluir venda');
          setModalMsg({ open: true, title: 'Sucesso', message: 'Venda concluída com sucesso!', type: 'success', onConfirm: null });
          setVendas(vendas => vendas.filter(v => v.id !== id));
        } catch (e) {
          setModalMsg({ open: true, title: 'Erro', message: 'Erro ao concluir venda: ' + e.message, type: 'error', onConfirm: null });
        }
      }
    });
  }
  async function cancelarVenda(id) {
    setModalConfirm({
      open: true,
      title: 'Confirmar Cancelamento',
      message: 'Deseja cancelar esta venda?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_CONFIG.BASE_URL}/api/vendas/${id}/cancelar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ observacoes: '' })
          });
          if (!res.ok) throw new Error('Erro ao cancelar venda');
          setModalMsg({ open: true, title: 'Sucesso', message: 'Venda cancelada com sucesso!', type: 'success', onConfirm: null });
          setVendas(vendas => vendas.filter(v => v.id !== id));
        } catch (e) {
          setModalMsg({ open: true, title: 'Erro', message: 'Erro ao cancelar venda: ' + e.message, type: 'error', onConfirm: null });
        }
      }
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: colors.primary, fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Vendas</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {ABAS.map((tab, idx) => (
          <button
            key={tab.status}
            onClick={() => setAba(idx)}
            style={{
              padding: '10px 32px',
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              borderBottom: idx === aba ? '3px solid ' + colors.primary : '3px solid transparent',
              background: 'none',
              color: idx === aba ? colors.primary : '#888',
              cursor: 'pointer',
              outline: 'none',
              transition: 'color 0.2s, border 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div>Carregando vendas...</div>
      ) : vendas.length === 0 ? (
        <div style={{ color: '#888', marginTop: 32 }}>Nenhuma venda encontrada.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <thead>
              <tr style={{ background: colors.surface }}>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>ID</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Cliente</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Vendedor</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Valor Total</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Data</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => (
                <tr key={venda.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 10 }}>{venda.id}</td>
                  <td style={{ padding: 10 }}>{venda.orcamentos?.clientes?.nome || '-'}</td>
                  <td style={{ padding: 10 }}>{venda.orcamentos?.vendedores?.nome || '-'}</td>
                  <td style={{ padding: 10 }}>{Number(venda.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td style={{ padding: 10 }}>{
                    // Exibir data da venda: sempre data_faturada
                    (() => {
                      const dataVenda = venda.data_faturada;
                      if (!dataVenda || typeof dataVenda !== 'string' || !dataVenda.includes('-')) return '-';
                      try {
                        const [dataPart] = dataVenda.split(' ');
                        if (!dataPart) return '-';
                        const partes = dataPart.split('-');
                        if (partes.length < 3) return '-';
                        const ano = partes[0];
                        const mes = partes[1];
                        const dia = partes[2].slice(0, 2); // Garante só o dia
                        const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
                        return !isNaN(data) ? data.toLocaleDateString('pt-BR') : '-';
                      } catch {
                        return '-';
                      }
                    })()
                  }</td>
                  <td style={{ padding: 10 }}>{
                    venda.status === 'faturada' ? 'Faturada' : venda.status === 'concluida' ? 'Concluída' : 'Cancelada'
                  }</td>
                  <td style={{ padding: 10 }}>
                    {aba === 0 && (
                      <>
                        {/* Removido botão Concluir, só exibe Cancelar */}
                        <button style={{ color: colors.error, background: 'none', border: '1px solid #ef4444', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 500 }} onClick={() => cancelarVenda(venda.id)}>Cancelar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

export default Sales; 