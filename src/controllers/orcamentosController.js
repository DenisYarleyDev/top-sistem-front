import { API_CONFIG } from '../assets/styles/colors';

// Listar todos os orçamentos
export async function getOrcamentos() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/orcamentos`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar orçamentos');
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Atualizar orçamento
export async function updateOrcamento(id, orcamentoData) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/orcamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orcamentoData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar orçamento');
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Deletar orçamento
export async function deleteOrcamento(id) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/orcamentos/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok && response.status !== 204) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao deletar orçamento');
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Buscar itens de um orçamento específico
export async function getItensOrcamento(orcamentoId) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/itens-orcamento/${orcamentoId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar itens do orçamento');
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Atualizar item do orçamento
export async function updateItemOrcamento(itemId, itemData) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/itens-orcamento/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar item do orçamento');
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Deletar item do orçamento
export async function deleteItemOrcamento(itemId) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/itens-orcamento/${itemId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok && response.status !== 204) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao deletar item do orçamento');
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
} 