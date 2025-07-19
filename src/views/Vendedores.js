import React, { useState, useEffect } from 'react';
import { getVendedores, createVendedor, updateVendedor, deleteVendedor } from '../controllers/vendedoresController';
import { getOrcamentos, deleteOrcamento, getItensOrcamento, deleteItemOrcamento } from '../controllers/orcamentosController';
import Modal from '../components/Modal';

function capitalizeWords(str) {
  return typeof str === 'string' ? str.replace(/\b\w/g, l => l.toUpperCase()) : str;
}

function Vendedores() {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    numero: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    showCancel: true
  });

  useEffect(() => {
    loadVendedores();
  }, []);

  const loadVendedores = async () => {
    setLoading(true);
    const result = await getVendedores();
    if (result.success) {
      setVendedores(result.data);
    } else {
      showModal('Erro', result.message, 'error', null, 'OK', '', false);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let result;
      if (editingVendedor) {
        result = await updateVendedor(editingVendedor.id, formData);
      } else {
        result = await createVendedor(formData);
      }

      if (result.success) {
        setShowForm(false);
        setEditingVendedor(null);
        resetForm();
        loadVendedores();
        showModal('Sucesso', 'Vendedor salvo com sucesso!', 'success', null, 'OK', '', false);
      } else {
        showModal('Erro', result.message, 'error', null, 'OK', '', false);
      }
    } catch (error) {
      showModal('Erro', 'Erro ao salvar vendedor', 'error', null, 'OK', '', false);
    }
    setSubmitting(false);
  };

  const handleEdit = (vendedor) => {
    setEditingVendedor(vendedor);
    setFormData({
      nome: vendedor.nome || '',
      numero: vendedor.numero || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (vendedorId) => {
    showModal(
      'Confirmar Exclusão',
      'Tem certeza que deseja deletar este vendedor? Todos os orçamentos relacionados também serão excluídos.',
      'warning',
      async () => {
        try {
          // Buscar todos os orçamentos relacionados ao vendedor
          const orcRes = await getOrcamentos();
          if (orcRes.success && Array.isArray(orcRes.data)) {
            const orcsDoVendedor = orcRes.data.filter(o => String(o.vendedorFK) === String(vendedorId) || String(o.vendedor_id) === String(vendedorId));
            for (const orc of orcsDoVendedor) {
              // Deletar todos os itens do orçamento antes de deletar o orçamento
              const itensRes = await getItensOrcamento(orc.id);
              if (itensRes.success && Array.isArray(itensRes.data)) {
                for (const item of itensRes.data) {
                  await deleteItemOrcamento(item.id);
                }
              }
              await deleteOrcamento(orc.id);
            }
          }
          // Agora deleta o vendedor
          const result = await deleteVendedor(vendedorId);
          if (result.success) {
            loadVendedores();
            showModal('Sucesso', 'Vendedor e orçamentos relacionados excluídos com sucesso!', 'success', null, 'OK', '', false);
          } else {
            showModal('Erro', result.message, 'error', null, 'OK', '', false);
          }
        } catch (err) {
          showModal('Erro', 'Erro ao excluir vendedor e orçamentos: ' + (err.message || err), 'error', null, 'OK', '', false);
        }
      },
      'Excluir',
      'Cancelar'
    );
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      numero: ''
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingVendedor(null);
    resetForm();
  };

  const showModal = (title, message, type, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar', showCancel = true) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
      showCancel
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return (
      <div style={{ 
        padding: 'var(--spacing-2xl)', 
        textAlign: 'center',
        color: 'var(--text-light)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)' }}></div>
        Carregando vendedores...
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-lg)' }}>
      {/* Header da página */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 'var(--spacing-lg)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-md)'
      }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text)' }}>Gerenciar Vendedores</h2>
          <p style={{ 
            margin: 'var(--spacing-xs) 0 0 0', 
            color: 'var(--text-light)',
            fontSize: '0.875rem'
          }}>
            {vendedores.length} vendedor{vendedores.length !== 1 ? 'es' : ''} cadastrado{vendedores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: 'var(--spacing-md) var(--spacing-lg)',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--shadow-sm)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          Novo Vendedor
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div style={{ 
          background: 'var(--surface)', 
          padding: 'var(--spacing-lg)', 
          borderRadius: 'var(--radius-lg)', 
          marginBottom: 'var(--spacing-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--text)' }}>
            {editingVendedor ? 'Editar Vendedor' : 'Novo Vendedor'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-xs)',
                  fontWeight: 500,
                  color: 'var(--text)',
                  fontSize: '0.875rem'
                }}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: capitalizeWords(e.target.value)})}
                  style={{ 
                    width: '100%', 
                    padding: 'var(--spacing-sm)', 
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-xs)',
                  fontWeight: 500,
                  color: 'var(--text)',
                  fontSize: '0.875rem'
                }}>
                  Número *
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: 'var(--spacing-sm)', 
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
            </div>

            {/* Botões */}
            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-md)', 
              marginTop: 'var(--spacing-lg)',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={cancelForm}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  background: 'var(--border-light)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  background: submitting ? 'var(--text-light)' : 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                {submitting ? 'Salvando...' : (editingVendedor ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de vendedores */}
      <div style={{ 
        background: 'var(--surface)', 
        borderRadius: 'var(--radius-lg)', 
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          padding: 'var(--spacing-md) var(--spacing-lg)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--border-light)'
        }}>
          <h3 style={{ margin: 0, color: 'var(--text)' }}>Lista de Vendedores</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '0.8rem'
          }}>
            <thead>
              <tr style={{ 
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)'
              }}>
                <th style={{ 
                  padding: 'var(--spacing-md)', 
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text)',
                  borderBottom: '1px solid var(--border)'
                }}>Nome</th>
                <th style={{ 
                  padding: 'var(--spacing-md)', 
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text)',
                  borderBottom: '1px solid var(--border)'
                }}>Número</th>
                <th style={{ 
                  padding: 'var(--spacing-md)', 
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'var(--text)',
                  borderBottom: '1px solid var(--border)'
                }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((vendedor, index) => (
                <tr key={vendedor.id} style={{ 
                  borderBottom: '1px solid var(--border-light)',
                  background: index % 2 === 0 ? 'var(--surface)' : 'var(--background)'
                }}>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{capitalizeWords(vendedor.nome)}</div>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <code style={{ 
                      background: 'var(--border-light)', 
                      padding: '2px 6px', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem'
                    }}>
                      {vendedor.numero}
                    </code>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(vendedor)}
                        style={{
                          padding: 'var(--spacing-xs) var(--spacing-sm)',
                          background: 'var(--warning)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          fontWeight: 500
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(vendedor.id)}
                        style={{
                          padding: 'var(--spacing-xs) var(--spacing-sm)',
                          background: 'var(--error)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          fontWeight: 500
                        }}
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        showCancel={modalConfig.showCancel}
      />
    </div>
  );
}

export default Vendedores; 