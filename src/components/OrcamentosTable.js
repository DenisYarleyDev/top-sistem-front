import React, { useEffect, useState } from 'react';
import colors from '../assets/styles/colors';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../assets/styles/colors';
import Modal from './Modal';
// Remover: import { FaBell } from 'react-icons/fa';
import { createAlertaOrcamento, getAlertasPorOrcamento, updateAlerta, deleteAlerta } from '../controllers/alertasController';
// Remover: import { Bell } from 'lucide-react';

function formatarTelefone(telefone) {
  if (!telefone) return '-';
  // Remove tudo que não for número
  const num = telefone.replace(/\D/g, '');
  if (num.length === 11) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
  } else if (num.length === 10) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
  }
  return telefone;
}

function OrcamentosTable({
  orcamentos,
  clientes,
  vendedores,
  produtosOrcamento,
  onEditar,
  onExcluir,
  formatarReais,
  formatarDataBR
}) {
  const navigate = useNavigate();
  const [modalRecibo, setModalRecibo] = useState({ aberto: false, orcamentoId: null });
  const [tipoPagamento, setTipoPagamento] = useState('');
  const [entrada, setEntrada] = useState('');
  const [entradaTipo, setEntradaTipo] = useState('valor');
  const [dataEntrega, setDataEntrega] = useState('');
  const [vendas, setVendas] = useState([]);
  const [modalLembrete, setModalLembrete] = useState({ aberto: false, orcamentoId: null });
  const [lembreteObs, setLembreteObs] = useState('');
  const [lembreteData, setLembreteData] = useState('');
  const [lembretesOrcamento, setLembretesOrcamento] = useState({}); // { [orcamentoId]: [lembretes] }
  const [loadingLembretes, setLoadingLembretes] = useState(false);
  const [editandoLembrete, setEditandoLembrete] = useState(null); // { id, observacao, dataAlert }
  const [modalMsg, setModalMsg] = useState({ open: false, title: '', message: '', type: 'info', onConfirm: null });
  const [modalConfirm, setModalConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    async function fetchVendas() {
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/vendas`);
        const data = await res.json();
        setVendas(Array.isArray(data) ? data : []);
      } catch {
        setVendas([]);
      }
    }
    fetchVendas();
  }, []);

  // Carregar lembretes de todos os orçamentos ao montar
  useEffect(() => {
    async function fetchLembretes() {
      setLoadingLembretes(true);
      const map = {};
      for (const orc of orcamentos) {
        const res = await getAlertasPorOrcamento(orc.id);
        if (res.success) {
          map[orc.id] = res.data;
        } else {
          map[orc.id] = [];
        }
      }
      setLembretesOrcamento(map);
      setLoadingLembretes(false);
    }
    if (orcamentos.length > 0) fetchLembretes();
  }, [orcamentos]);

  function getVendaStatus(orcamentoId) {
    const venda = vendas.find(v => v.orcamento_id === orcamentoId);
    return venda ? venda.status : null;
  }

  function abrirModalRecibo(orcamentoId) {
    setModalRecibo({ aberto: true, orcamentoId });
    setTipoPagamento('');
    setEntrada('');
    setEntradaTipo('valor');
    setDataEntrega('');
  }

  function confirmarRecibo() {
    let url = `/recibo-venda/${modalRecibo.orcamentoId}?tipo=${tipoPagamento}`;
    if (tipoPagamento === 'avista') {
      url += `&entrada=${entrada}&entradaTipo=${entradaTipo}`;
    }
    url += `&dataEntrega=${encodeURIComponent(dataEntrega)}`;
    window.open(url, '_blank');
    setModalRecibo({ aberto: false, orcamentoId: null });
  }

  // Função para baixar PDF
  async function handleDownloadPDF(orcamentoId) {
    // Abre a página de impressão em nova aba
    window.open(`/orcamentos/print/${orcamentoId}`, '_blank');
  }

  async function handleSalvarLembrete() {
    if (!lembreteObs || !lembreteData) {
      setModalMsg({ open: true, title: 'Atenção', message: 'Preencha a observação e a data do lembrete!', type: 'warning', onConfirm: null });
      return;
    }
    try {
      let res;
      if (editandoLembrete) {
        res = await updateAlerta(editandoLembrete.id, { note: lembreteObs, dataAlert: lembreteData });
      } else {
        res = await createAlertaOrcamento(modalLembrete.orcamentoId, { note: lembreteObs, dataAlert: lembreteData });
      }
      if (res.success) {
        setModalMsg({ open: true, title: 'Sucesso', message: 'Lembrete salvo com sucesso!', type: 'success', onConfirm: null });
        setModalLembrete({ aberto: false, orcamentoId: null });
        setEditandoLembrete(null);
        setLembreteObs('');
        setLembreteData('');
        // Recarregar lembretes desse orçamento
        const r = await getAlertasPorOrcamento(modalLembrete.orcamentoId);
        setLembretesOrcamento(prev => ({ ...prev, [modalLembrete.orcamentoId]: r.success ? r.data : [] }));
      } else {
        setModalMsg({ open: true, title: 'Erro', message: 'Erro ao salvar lembrete: ' + res.message, type: 'error', onConfirm: null });
      }
    } catch (e) {
      setModalMsg({ open: true, title: 'Erro', message: 'Erro ao salvar lembrete: ' + e.message, type: 'error', onConfirm: null });
    }
  }

  async function handleExcluirLembrete(orcamentoId, lembreteId) {
    setModalConfirm({
      open: true,
      title: 'Confirmar Exclusão',
      message: 'Deseja excluir este lembrete?',
      onConfirm: async () => {
        try {
          const res = await deleteAlerta(lembreteId);
          if (res.success) {
            // Atualizar lista
            const r = await getAlertasPorOrcamento(orcamentoId);
            setLembretesOrcamento(prev => ({ ...prev, [orcamentoId]: r.success ? r.data : [] }));
          } else {
            setModalMsg({ open: true, title: 'Erro', message: 'Erro ao excluir lembrete: ' + res.message, type: 'error', onConfirm: null });
          }
        } catch (e) {
          setModalMsg({ open: true, title: 'Erro', message: 'Erro ao excluir lembrete: ' + e.message, type: 'error', onConfirm: null });
        }
      }
    });
  }

  function abrirEditarLembrete(orcamentoId, lembrete) {
    setModalLembrete({ aberto: true, orcamentoId });
    setEditandoLembrete(lembrete);
    setLembreteObs(lembrete.note || '');
    setLembreteData(lembrete.dataAlert ? lembrete.dataAlert.slice(0, 10) : '');
  }

  return (
    <div style={{ marginBottom: 32, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: colors.surface }}>
            <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>ID</th>
            <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Cliente</th>
            <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Contato</th>
            <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Vendedor</th>
            <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Total</th>
            <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Produtos</th>
            <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Data de Emissão</th>
            <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {orcamentos.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 20 }}>Nenhum orçamento cadastrado</td></tr>
          )}
          {orcamentos.map(orc => {
            const clienteObj = clientes.find(c => c.id === orc.clienteFK || c.id === Number(orc.clienteFK));
            const vendedorObj = vendedores.find(v => v.id === orc.vendedorFK || v.id === Number(orc.vendedorFK));
            const produtosLista = produtosOrcamento[orc.id] || [];
            return (
              <tr key={orc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 10 }}>{orc.id}</td>
                <td style={{ padding: 10 }}>{clienteObj ? clienteObj.nome : `ID ${orc.clienteFK}`}</td>
                <td style={{ padding: 10 }}>{clienteObj && clienteObj.telefone ? formatarTelefone(clienteObj.telefone) : '-'}</td>
                <td style={{ padding: 10 }}>{vendedorObj ? vendedorObj.nome : `ID ${orc.vendedorFK}`}</td>
                <td style={{ padding: 10, textAlign: 'right' }}>{formatarReais(orc.totalOrcamento)}</td>
                <td style={{ padding: 10 }}>{produtosLista.slice(0,3).join(', ')}</td>
                <td style={{ padding: 10 }}>{formatarDataBR(orc.data).split(' ')[0]}</td>
                <td style={{ padding: 10, textAlign: 'center' }}>
                  <button style={{ marginRight: 8, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => onEditar(orc)}>Editar</button>
                  <button style={{ marginRight: 8, color: colors.error, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => onExcluir(orc.id)}>Excluir</button>
                  <button style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => window.open(`/orcamentos/print/${orc.id}`, '_blank')}>Imprimir</button>
                  {(() => {
                    const vendaStatus = getVendaStatus(orc.id);
                    if (vendaStatus === 'cancelada') {
                      return (
                        <button
                          style={{ marginRight: 8, color: '#fff', background: '#dc3545', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 500, cursor: 'not-allowed', opacity: 0.7 }}
                          disabled
                        >
                          Cancelado
                        </button>
                      );
                    } else if (vendaStatus === 'faturada') {
                      return (
                        <button
                          style={{ marginRight: 8, color: '#fff', background: '#bdbdbd', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 500, cursor: 'not-allowed', opacity: 0.7 }}
                          disabled
                        >
                          Faturado
                        </button>
                      );
                    } else {
                      return (
                        <button
                          style={{ marginRight: 8, color: colors.primary, background: 'none', border: '1px solid #10b981', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 500 }}
                          onClick={() => setModalConfirm({
                            open: true,
                            title: 'Confirmar Faturamento',
                            message: 'Deseja realmente faturar este orçamento?',
                            onConfirm: async () => {
                              try {
                                const res = await fetch(`${API_CONFIG.BASE_URL}/api/vendas`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ orcamento_id: orc.id })
                                });
                                if (!res.ok) {
                                  let errMsg = res.statusText;
                                  try { const err = await res.json(); errMsg = err.error || errMsg; } catch {}
                                  setModalMsg({ open: true, title: 'Erro', message: 'Erro ao faturar: ' + errMsg, type: 'error', onConfirm: null });
                                  return;
                                }
                                setModalMsg({ open: true, title: 'Sucesso', message: 'Orçamento faturado com sucesso!', type: 'success', onConfirm: null });
                                window.location.reload();
                              } catch (e) {
                                setModalMsg({ open: true, title: 'Erro', message: 'Erro ao faturar: ' + e.message, type: 'error', onConfirm: null });
                              }
                            }
                          })}
                        >
                          Faturar
                        </button>
                      );
                    }
                  })()}
                  {/* Botão Gerar Recibo de Venda só habilitado se houver venda faturada */}
                  <button
                    style={{ color: colors.primary, background: 'none', border: 'none', cursor: getVendaStatus(orc.id) === 'faturada' ? 'pointer' : 'not-allowed', fontWeight: 500, opacity: getVendaStatus(orc.id) === 'faturada' ? 1 : 0.5 }}
                    onClick={() => {
                      if (getVendaStatus(orc.id) === 'faturada') {
                        abrirModalRecibo(orc.id);
                      } else {
                        setModalMsg({ open: true, title: 'Atenção', message: 'Para gerar recibo de venda, a venda precisa estar faturada.', type: 'warning', onConfirm: null });
                      }
                    }}
                    disabled={getVendaStatus(orc.id) !== 'faturada'}
                  >
                    Gerar Recibo de Venda
                  </button>
                  <button
                    style={{ marginLeft: 8, color: '#f59e42', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                    title="Adicionar Lembrete"
                    onClick={() => {
                      setModalLembrete({ aberto: true, orcamentoId: orc.id });
                      setEditandoLembrete(null);
                      setLembreteObs('');
                      setLembreteData('');
                    }}
                  >
                    <span style={{ marginRight: 4 }}>🔔</span> Lembrete
                  </button>
                  {/* Listar lembretes desse orçamento */}
                  <div style={{ marginTop: 6 }}>
                    {(lembretesOrcamento[orc.id] || []).map(lembrete => (
                      <div key={lembrete.id} style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 4, padding: 4, marginBottom: 4, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>
                          <b>{lembrete.dataAlert ? new Date(lembrete.dataAlert).toLocaleDateString('pt-BR') : ''}</b>: {lembrete.note}
                        </span>
                        <span>
                          <button style={{ color: '#f59e42', background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer' }} title="Editar" onClick={() => abrirEditarLembrete(orc.id, lembrete)}>Editar</button>
                          <button style={{ color: '#ef4444', background: 'none', border: 'none', marginLeft: 4, cursor: 'pointer' }} title="Excluir" onClick={() => handleExcluirLembrete(orc.id, lembrete.id)}>Excluir</button>
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Modal
        isOpen={modalRecibo.aberto}
        onClose={() => setModalRecibo({ aberto: false, orcamentoId: null })}
        title="Tipo de Pagamento"
        message={
          <div>
            <div style={{ marginBottom: 12 }}>
              <label>
                <input type="radio" name="tipoPagamento" value="parcelado" checked={tipoPagamento === 'parcelado'} onChange={() => setTipoPagamento('parcelado')} /> Parcelado
              </label>
              <label style={{ marginLeft: 24 }}>
                <input type="radio" name="tipoPagamento" value="avista" checked={tipoPagamento === 'avista'} onChange={() => setTipoPagamento('avista')} /> À vista
              </label>
            </div>
            {tipoPagamento === 'avista' && (
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 6 }}>Valor de entrada:</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" min="0" placeholder="Valor ou %" value={entrada} onChange={e => setEntrada(e.target.value)} style={{ width: 100, padding: 4 }} />
                  <select value={entradaTipo} onChange={e => setEntradaTipo(e.target.value)}>
                    <option value="valor">R$</option>
                    <option value="porcentagem">%</option>
                  </select>
                </div>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <label style={{ fontWeight: 500 }}>Data de Entrega <span style={{ color: 'red' }}>*</span></label><br />
              <input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }} required />
            </div>
          </div>
        }
        type="info"
        confirmText="Gerar Recibo"
        cancelText="Cancelar"
        showCancel={true}
        onConfirm={tipoPagamento && dataEntrega ? confirmarRecibo : null}
      />
      {/* Modal de Lembrete */}
      <Modal
        isOpen={modalLembrete.aberto}
        onClose={() => { setModalLembrete({ aberto: false, orcamentoId: null }); setEditandoLembrete(null); }}
        title={editandoLembrete ? "Editar Lembrete" : "Adicionar Lembrete"}
        message={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Observação</label>
              <textarea value={lembreteObs} onChange={e => setLembreteObs(e.target.value)} rows={3} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            </div>
            <div>
              <label>Data do Lembrete</label>
              <input type="date" value={lembreteData} onChange={e => setLembreteData(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            </div>
          </div>
        }
        type="info"
        confirmText={editandoLembrete ? "Salvar Alterações" : "Salvar"}
        cancelText="Cancelar"
        showCancel={true}
        onConfirm={handleSalvarLembrete}
      />
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

export default OrcamentosTable; 