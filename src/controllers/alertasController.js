// Controller para consumir a API de alertas/lembretes
import { API_CONFIG } from '../assets/styles/colors';

// Buscar todos os alertas
export async function getAlertas() {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/alertas`);
    if (!res.ok) throw new Error('Erro ao buscar alertas');
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Buscar alertas de um orçamento específico
export async function getAlertasPorOrcamento(orcamentoId) {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/orcamentos/${orcamentoId}/alertas`);
    if (!res.ok) throw new Error('Erro ao buscar alertas do orçamento');
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Criar novo alerta geral
export async function createAlerta(alerta) {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/alertas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alerta)
    });
    if (!res.ok) throw new Error('Erro ao criar alerta');
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Criar novo alerta vinculado a orçamento
export async function createAlertaOrcamento(orcamentoId, alerta) {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/orcamentos/${orcamentoId}/alertas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alerta)
    });
    if (!res.ok) throw new Error('Erro ao criar alerta para orçamento');
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Atualizar alerta
export async function updateAlerta(id, alerta) {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/alertas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alerta)
    });
    if (!res.ok) throw new Error('Erro ao atualizar alerta');
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Excluir alerta
export async function deleteAlerta(id) {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/alertas/${id}`, {
      method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir alerta');
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
} 