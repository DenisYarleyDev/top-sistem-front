import { API_CONFIG } from '../assets/styles/colors';

// Buscar todos os vendedores
export const getVendedores = async () => {
  try {
    console.log('🔍 Buscando vendedores...');
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VENDEDORES.LIST}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro ao buscar vendedores:', errorData);
      return { success: false, message: errorData.error || 'Erro ao buscar vendedores' };
    }

    const data = await response.json();
    console.log('✅ Vendedores carregados:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro na requisição de vendedores:', error);
    return { success: false, message: 'Erro de conexão ao buscar vendedores' };
  }
};

// Criar novo vendedor
export const createVendedor = async (vendedorData) => {
  try {
    console.log('📝 Criando vendedor:', vendedorData);
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VENDEDORES.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(vendedorData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro ao criar vendedor:', errorData);
      return { success: false, message: errorData.error || 'Erro ao criar vendedor' };
    }

    const data = await response.json();
    console.log('✅ Vendedor criado:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro na requisição de criação:', error);
    return { success: false, message: 'Erro de conexão ao criar vendedor' };
  }
};

// Atualizar vendedor
export const updateVendedor = async (id, vendedorData) => {
  try {
    console.log('🔄 Atualizando vendedor:', id, vendedorData);
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VENDEDORES.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(vendedorData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro ao atualizar vendedor:', errorData);
      return { success: false, message: errorData.error || 'Erro ao atualizar vendedor' };
    }

    const data = await response.json();
    console.log('✅ Vendedor atualizado:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro na requisição de atualização:', error);
    return { success: false, message: 'Erro de conexão ao atualizar vendedor' };
  }
};

// Deletar vendedor
export const deleteVendedor = async (id) => {
  try {
    console.log('🗑️ Deletando vendedor:', id);
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VENDEDORES.DELETE(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro ao deletar vendedor:', errorData);
      return { success: false, message: errorData.error || 'Erro ao deletar vendedor' };
    }

    const data = await response.json();
    console.log('✅ Vendedor deletado:', data);
    return { 
      success: true, 
      data,
      message: `Vendedor excluído com sucesso${data.orcamentosExcluidos > 0 ? `. ${data.orcamentosExcluidos} orçamento(s) relacionado(s) também foi(foram) excluído(s).` : ''}`
    };
  } catch (error) {
    console.error('❌ Erro na requisição de exclusão:', error);
    return { success: false, message: 'Erro de conexão ao deletar vendedor' };
  }
}; 