import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/usersController';
import { translateUserType, canManageUsers, canDeleteRecords } from '../utils/userUtils';
import { getCurrentUser } from '../controllers/authController';
import Modal from '../components/Modal';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    usuario: '',
    senha: '',
    tipo: 'comum'
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

  const currentUser = getCurrentUser();

  // Debug temporário
  console.log('Usuário atual:', currentUser);
  console.log('Tipo do usuário:', currentUser?.tipo);
  console.log('Pode gerenciar usuários:', canManageUsers(currentUser?.tipo));

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getUsers();
    if (result.success) {
      setUsers(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let result;
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.senha) delete updateData.senha;
        result = await updateUser(editingUser.id, updateData);
      } else {
        result = await createUser(formData);
      }

      if (result.success) {
        setShowForm(false);
        setEditingUser(null);
        resetForm();
        loadUsers();
        showModal('Sucesso', 'Usuário salvo com sucesso!', 'success', null, 'OK', '', false);
      } else {
        showModal('Erro', result.message, 'error', null, 'OK', '', false);
      }
    } catch (error) {
      showModal('Erro', 'Erro ao salvar usuário', 'error', null, 'OK', '', false);
    }
    setSubmitting(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      usuario: user.usuario,
      senha: '',
      tipo: user.tipo
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    showModal(
      'Confirmar Exclusão',
      'Tem certeza que deseja deletar este usuário?',
      'warning',
      async () => {
        const result = await deleteUser(userId);
        if (result.success) {
          loadUsers();
          showModal('Sucesso', 'Usuário excluído com sucesso!', 'success', null, 'OK', '', false);
        } else {
          showModal('Erro', result.message, 'error', null, 'OK', '', false);
        }
      },
      'Excluir',
      'Cancelar'
    );
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      usuario: '',
      senha: '',
      tipo: 'comum'
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
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
        Carregando usuários...
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
          <h2 style={{ margin: 0, color: 'var(--text)' }}>Gerenciar Usuários</h2>
          <p style={{ 
            margin: 'var(--spacing-xs) 0 0 0', 
            color: 'var(--text-light)',
            fontSize: '0.875rem'
          }}>
            {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
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
          Novo Usuário
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
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: 'var(--spacing-sm)', 
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.2s ease'
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
                  Nome de Usuário
                </label>
                <input
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => setFormData({...formData, usuario: e.target.value})}
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
                  Senha {editingUser && <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(deixe vazio para não alterar)</span>}
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: 'var(--spacing-sm)', 
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}
                  required={!editingUser}
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
                  Tipo de Usuário
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: 'var(--spacing-sm)', 
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    background: 'white'
                  }}
                >
                  <option value="comum">Usuário</option>
                  <option value="super">Administrador</option>
                </select>
              </div>
            </div>
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
                {submitting ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de usuários */}
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
          <h3 style={{ margin: 0, color: 'var(--text)' }}>Lista de Usuários</h3>
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
                }}>Usuário</th>
                <th style={{ 
                  padding: 'var(--spacing-md)', 
                  textAlign: 'left',
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
                }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{ 
                  borderBottom: '1px solid var(--border-light)',
                  background: index % 2 === 0 ? 'var(--surface)' : 'var(--background)'
                }}>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{user.nome}</div>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <code style={{ 
                      background: 'var(--border-light)', 
                      padding: '2px 6px', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem'
                    }}>
                      {user.usuario}
                    </code>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      background: user.tipo === 'super' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: user.tipo === 'super' ? 'var(--error)' : 'var(--success)'
                    }}>
                      {translateUserType(user.tipo)}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(user)}
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
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
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
                      )}
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

export default Users; 