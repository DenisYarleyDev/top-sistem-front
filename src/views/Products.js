import React, { useState, useEffect } from 'react';
import { getProdutos, createProduto, updateProduto, deleteProduto } from '../controllers/produtosController';
import { getOrcamentos, getItensOrcamento } from '../controllers/orcamentosController';
import Modal from '../components/Modal';

function Products() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    descricao: '',
    ativo: true,
    medida: false
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
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    setLoading(true);
    const result = await getProdutos();
    if (result.success) {
      setProdutos(result.data);
    } else {
      showModal('Erro', result.message, 'error', null, 'OK', '', false);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Converter preço para número
      const produtoData = {
        ...formData,
        preco: parseFloat(formData.preco) || 0,
        medida: Boolean(formData.medida)
      };

      let result;
      if (editingProduto) {
        result = await updateProduto(editingProduto.id, produtoData);
      } else {
        result = await createProduto(produtoData);
      }

      if (result.success) {
        setShowForm(false);
        setEditingProduto(null);
        resetForm();
        loadProdutos();
        showModal('Sucesso', 'Produto salvo com sucesso!', 'success', null, 'OK', '', false);
      } else {
        showModal('Erro', result.message, 'error', null, 'OK', '', false);
      }
    } catch (error) {
      showModal('Erro', 'Erro ao salvar produto', 'error', null, 'OK', '', false);
    }
    setSubmitting(false);
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome || '',
      preco: produto.preco ? produto.preco.toString() : '',
      descricao: produto.descricao || '',
      ativo: produto.ativo !== undefined ? produto.ativo : true,
      medida: produto.medida !== undefined ? produto.medida : false
    });
    setShowForm(true);
  };

  const handleDelete = async (produtoId) => {
    showModal(
      'Confirmar Exclusão',
      'Tem certeza que deseja deletar este produto?',
      'warning',
      async () => {
        try {
          // Buscar todos os orçamentos
          const orcRes = await getOrcamentos();
          if (orcRes.success && Array.isArray(orcRes.data)) {
            for (const orc of orcRes.data) {
              const itensRes = await getItensOrcamento(orc.id);
              if (itensRes.success && Array.isArray(itensRes.data)) {
                if (itensRes.data.some(item => String(item.produtoFK) === String(produtoId) || String(item.produto_id) === String(produtoId))) {
                  showModal('Erro', 'Não é possível excluir este produto pois ele está sendo utilizado em um orçamento.', 'error', null, 'OK', '', false);
                  return;
                }
              }
            }
          }
          // Se não está em uso, pode deletar
          const result = await deleteProduto(produtoId);
          if (result.success) {
            loadProdutos();
            showModal('Sucesso', result.message, 'success', null, 'OK', '', false);
          } else {
            showModal('Erro', result.message, 'error', null, 'OK', '', false);
          }
        } catch (err) {
          showModal('Erro', 'Erro ao excluir produto: ' + (err.message || err), 'error', null, 'OK', '', false);
        }
      },
      'Excluir',
      'Cancelar'
    );
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      preco: '',
      descricao: '',
      ativo: true,
      medida: false
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingProduto(null);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: 'var(--spacing-2xl)', 
        textAlign: 'center',
        color: 'var(--text-light)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)' }}></div>
        Carregando produtos...
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
          <h2 style={{ margin: 0, color: 'var(--text)' }}>Gerenciar Produtos</h2>
          <p style={{ 
            margin: 'var(--spacing-xs) 0 0 0', 
            color: 'var(--text-light)',
            fontSize: '0.875rem'
          }}>
            {produtos.length} produto{produtos.length !== 1 ? 's' : ''} cadastrado{produtos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingProduto(null); setShowForm(true); }}
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
          Novo Produto
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={cancelForm}
          title={editingProduto ? 'Editar Produto' : 'Novo Produto'}
          hideFooter={true}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 260, maxWidth: 340 }}>
            <label style={{ fontWeight: 500, color: '#222', fontSize: 15, marginBottom: 2 }}>
              Nome:
              <input
                type="text"
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 7,
                  border: '1px solid #e5e7eb',
                  marginTop: 6,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #218838'}
                onBlur={e => e.target.style.border = '1px solid #e5e7eb'}
              />
            </label>
            <label style={{ fontWeight: 500, color: '#222', fontSize: 15, marginBottom: 2 }}>
              Preço:
              <input
                type="number"
                value={formData.preco}
                onChange={e => setFormData({ ...formData, preco: e.target.value })}
                required
                min={0}
                step={0.01}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 7,
                  border: '1px solid #e5e7eb',
                  marginTop: 6,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #218838'}
                onBlur={e => e.target.style.border = '1px solid #e5e7eb'}
              />
            </label>
            <label style={{ fontWeight: 500, color: '#222', fontSize: 15, marginBottom: 2 }}>
              Descrição:
              <input
                type="text"
                value={formData.descricao}
                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 7,
                  border: '1px solid #e5e7eb',
                  marginTop: 6,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #218838'}
                onBlur={e => e.target.style.border = '1px solid #e5e7eb'}
              />
            </label>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 2 }}>
              <label style={{ fontWeight: 500, color: '#222', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                  style={{ accentColor: '#218838', width: 18, height: 18, marginRight: 4 }}
                />
                Ativo
              </label>
              <label style={{ fontWeight: 500, color: '#222', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={formData.medida}
                  onChange={e => setFormData({ ...formData, medida: e.target.checked })}
                  style={{ accentColor: '#218838', width: 18, height: 18, marginRight: 4 }}
                />
                Produto exige medida (largura/altura)?
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={cancelForm}
                style={{
                  background: '#f3f4f6',
                  color: '#333',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '8px 22px',
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#218838',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 22px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Tabela de produtos */}
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
          <h3 style={{ margin: 0, color: 'var(--text)' }}>Lista de Produtos</h3>
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
                }}>Preço</th>
                <th style={{ 
                  padding: 'var(--spacing-md)', 
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'var(--text)',
                  borderBottom: '1px solid var(--border)'
                }}>Tipo</th>
                <th style={{ 
                  padding: 'var(--spacing-md)', 
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'var(--text)',
                  borderBottom: '1px solid var(--border)'
                }}>Status</th>
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
              {produtos.map((produto, index) => (
                <tr key={produto.id} style={{ 
                  borderBottom: '1px solid var(--border-light)',
                  background: index % 2 === 0 ? 'var(--surface)' : 'var(--background)'
                }}>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{produto.nome}</div>
                    {produto.descricao && (
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: 'var(--text-light)', 
                        marginTop: '2px',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {produto.descricao}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {formatPrice(produto.preco)}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      background: produto.medida ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: produto.medida ? 'var(--primary)' : 'var(--text-light)'
                    }}>
                      {produto.medida ? 'Com Medida' : 'Sem Medida'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      background: produto.ativo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: produto.ativo ? 'var(--success)' : 'var(--error)'
                    }}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(produto)}
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
                        onClick={() => handleDelete(produto.id)}
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

export default Products; 