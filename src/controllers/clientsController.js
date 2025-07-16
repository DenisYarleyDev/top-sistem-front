import { API_CONFIG } from '../assets/styles/colors';

// Controller para Clientes - CRUD completo

export async function getClients() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS.LIST}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar clientes');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getClientById(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS.GET(id)}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar cliente');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function createClient(clientData) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar cliente');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateClient(id, clientData) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar cliente');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteClient(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS.DELETE(id)}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao deletar cliente');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
} 