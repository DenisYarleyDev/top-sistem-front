import { API_CONFIG } from '../assets/styles/colors';

// Controller para Vendas - CRUD completo

export async function getSales() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES.LIST}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar vendas');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getSaleById(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES.GET(id)}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar venda');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function createSale(saleData) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar venda');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateSale(id, saleData) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar venda');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteSale(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES.DELETE(id)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao deletar venda');
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
} 