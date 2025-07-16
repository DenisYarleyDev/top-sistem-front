import { API_CONFIG } from '../assets/styles/colors';

// Controller para Produtos - CRUD completo

export async function getProducts() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar produtos');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getProductById(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.GET(id)}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar produto');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function createProduct(productData) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar produto');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateProduct(id, productData) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar produto');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(id)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao deletar produto');
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
} 