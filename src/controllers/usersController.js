import { API_CONFIG } from '../assets/styles/colors';

// Controller para Usuários - CRUD completo

export async function getUsers() {
  try {
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.LIST}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar usuários');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getUserById(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.GET(id)}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar usuário');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function createUser(userData) {
  try {
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar usuário');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateUser(id, userData) {
  try {
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar usuário');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteUser(id) {
  try {
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.DELETE(id)}`, {
      method: 'DELETE',
    });
    
    // Status 204 significa sucesso sem conteúdo de retorno
    if (response.status === 204) {
      return { success: true };
    }
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao deletar usuário');
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
} 