import React, { useState, useEffect } from 'react';
import { getClients, createClient, updateClient, deleteClient } from '../controllers/clientsController';
import { getOrcamentos, deleteOrcamento } from '../controllers/orcamentosController';
import Modal from '../components/Modal';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpfoucnpj: '',
    telefone: '',
    cidade: '',
    rua: '',
    bairro: '',
    numero: '',
    cep: '',
    bloqueado: false,
    nota: ''
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
  const [cpfCnpjError, setCpfCnpjError] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const result = await getClients();
    if (result.success) {
      setClients(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Funções utilitárias para validação de CPF e CNPJ
  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  }
  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    return true;
  }
  function isCpfCnpjValido(valor) {
    const num = valor.replace(/\D/g, '');
    if (num.length === 11) return validarCPF(num);
    if (num.length === 14) return validarCNPJ(num);
    return false;
  }

  function capitalizeWords(str) {
    return typeof str === 'string' ? str.replace(/\b\w/g, l => l.toUpperCase()) : str;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Só valida CPF/CNPJ se o campo não estiver vazio
    if (formData.cpfoucnpj && !isCpfCnpjValido(formData.cpfoucnpj)) {
      setCpfCnpjError('CPF ou CNPJ inválido');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      let result;
      if (editingClient) {
        result = await updateClient(editingClient.id, formData);
      } else {
        result = await createClient(formData);
      }

      if (result.success) {
        setShowForm(false);
        setEditingClient(null);
        resetForm();
        loadClients();
        showModal('Sucesso', 'Cliente salvo com sucesso!', 'success', null, 'OK', '', false);
      } else {
        showModal('Erro', result.message, 'error', null, 'OK', '', false);
      }
    } catch (error) {
      showModal('Erro', 'Erro ao salvar cliente', 'error', null, 'OK', '', false);
    }
    setSubmitting(false);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      nome: client.nome || '',
      cpfoucnpj: client.cpfoucnpj || '',
      telefone: client.telefone || '',
      cidade: client.cidade || '',
      rua: client.rua || '',
      bairro: client.bairro || '',
      numero: client.numero || '',
      cep: client.cep || '',
      bloqueado: client.bloqueado || false,
      nota: client.nota || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (clientId) => {
    showModal(
      'Confirmar Exclusão',
      'Tem certeza que deseja deletar este cliente?',
      'warning',
      async () => {
        try {
          // Buscar todos os orçamentos
          const orcRes = await getOrcamentos();
          if (orcRes.success && Array.isArray(orcRes.data)) {
            if (orcRes.data.some(o => String(o.clienteFK) === String(clientId) || String(o.cliente_id) === String(clientId))) {
              showModal('Erro', 'Não é possível excluir este cliente pois ele está sendo utilizado em um orçamento.', 'error', null, 'OK', '', false);
              return;
            }
          }
          // Se não está em uso, pode deletar
          const result = await deleteClient(clientId);
          if (result.success) {
            loadClients();
            showModal('Sucesso', 'Cliente excluído com sucesso!', 'success', null, 'OK', '', false);
          } else {
            showModal('Erro', result.message, 'error', null, 'OK', '', false);
          }
        } catch (err) {
          showModal('Erro', 'Erro ao excluir cliente: ' + (err.message || err), 'error', null, 'OK', '', false);
        }
      },
      'Excluir',
      'Cancelar'
    );
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpfoucnpj: '',
      telefone: '',
      cidade: '',
      rua: '',
      bairro: '',
      numero: '',
      cep: '',
      bloqueado: false,
      nota: ''
    });
    setCpfCnpjError('');
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingClient(null);
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
        Carregando clientes...
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
          <h2 style={{ margin: 0, color: 'var(--text)' }}>Gerenciar Clientes</h2>
          <p style={{ 
            margin: 'var(--spacing-xs) 0 0 0', 
            color: 'var(--text-light)',
            fontSize: '0.875rem'
          }}>
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
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
          Novo Cliente
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
            {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <form onSubmit={handleSubmit}>
            {/* Informações Básicas */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--text)', fontSize: '1rem' }}>Informações Básicas</h4>
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
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    value={formData.cpfoucnpj}
                    onChange={(e) => {
                      setFormData({...formData, cpfoucnpj: e.target.value});
                      if (e.target.value.length >= 11) {
                        setCpfCnpjError(isCpfCnpjValido(e.target.value) ? '' : 'CPF ou CNPJ inválido');
                      } else {
                        setCpfCnpjError('');
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-sm)', 
                      border: cpfCnpjError ? '1.5px solid var(--error)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      background: cpfCnpjError ? '#fff6f6' : undefined
                    }}
                  />
                  {cpfCnpjError && (
                    <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 2 }}>{cpfCnpjError}</div>
                  )}
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-xs)',
                    fontWeight: 500,
                    color: 'var(--text)',
                    fontSize: '0.875rem'
                  }}>
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-sm)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem'
                    }}
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
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => setFormData({...formData, cep: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-sm)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--text)', fontSize: '1rem' }}>Endereço</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-xs)',
                    fontWeight: 500,
                    color: 'var(--text)',
                    fontSize: '0.875rem'
                  }}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={e => setFormData({...formData, cidade: capitalizeWords(e.target.value)})}
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-sm)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem'
                    }}
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
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={e => setFormData({...formData, bairro: capitalizeWords(e.target.value)})}
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-sm)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem'
                    }}
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
                    Rua
                  </label>
                  <input
                    type="text"
                    value={formData.rua}
                    onChange={e => setFormData({...formData, rua: capitalizeWords(e.target.value)})}
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-sm)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem'
                    }}
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
                    Número
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
                  />
                </div>
              </div>
            </div>

            {/* Status e Observações */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--text)', fontSize: '1rem' }}>Status e Observações</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    fontWeight: 500,
                    color: 'var(--text)',
                    fontSize: '0.875rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.bloqueado}
                      onChange={(e) => setFormData({...formData, bloqueado: e.target.checked})}
                      style={{ 
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    Cliente Bloqueado
                  </label>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-xs)',
                    fontWeight: 500,
                    color: 'var(--text)',
                    fontSize: '0.875rem'
                  }}>
                    Observações
                  </label>
                  <textarea
                    value={formData.nota}
                    onChange={(e) => setFormData({...formData, nota: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-sm)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Observações sobre o cliente..."
                  />
                </div>
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
                {submitting ? 'Salvando...' : (editingClient ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de clientes */}
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
          <h3 style={{ margin: 0, color: 'var(--text)' }}>Lista de Clientes</h3>
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
                }}>CPF/CNPJ</th>
                <th style={{ 
                  padding: 'var(--spacing-md)', 
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text)',
                  borderBottom: '1px solid var(--border)'
                }}>Telefone</th>
                <th style={{ 
                  padding: 'var(--spacing-md)', 
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text)',
                  borderBottom: '1px solid var(--border)'
                }}>Cidade</th>
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
              {clients.map((client, index) => (
                <tr key={client.id} style={{ 
                  borderBottom: '1px solid var(--border-light)',
                  background: index % 2 === 0 ? 'var(--surface)' : 'var(--background)'
                }}>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{capitalizeWords(client.nome)}</div>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <code style={{ 
                      background: 'var(--border-light)', 
                      padding: '2px 6px', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem'
                    }}>
                      {client.cpfoucnpj}
                    </code>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    {client.telefone || '-'}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    {client.cidade || '-'}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      background: client.bloqueado ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: client.bloqueado ? 'var(--error)' : 'var(--success)'
                    }}>
                      {client.bloqueado ? 'Bloqueado' : 'Ativo'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(client)}
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
                        onClick={() => handleDelete(client.id)}
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

export default Clients; 