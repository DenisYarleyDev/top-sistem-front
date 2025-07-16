import { API_CONFIG } from '../assets/styles/colors';

// Buscar todos os produtos
export const getProdutos = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || 'Erro ao buscar produtos' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: 'Erro de conexão ao buscar produtos' };
  }
};

// Buscar produto por ID
export const getProdutoById = async (id) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.GET(id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || 'Erro ao buscar produto' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: 'Erro de conexão ao buscar produto' };
  }
};

// Criar novo produto
export const createProduto = async (produtoData) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(produtoData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || 'Erro ao criar produto' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: 'Erro de conexão ao criar produto' };
  }
};

// Atualizar produto
export const updateProduto = async (id, produtoData) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(produtoData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || 'Erro ao atualizar produto' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: 'Erro de conexão ao atualizar produto' };
  }
};

// Deletar produto
export const deleteProduto = async (id) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || 'Erro ao deletar produto' };
    }

    return { success: true, message: 'Produto excluído com sucesso' };
  } catch (error) {
    return { success: false, message: 'Erro de conexão ao deletar produto' };
  }
}; 