import { API_CONFIG } from '../assets/styles/colors';

// Controller para Dashboard - Estatísticas e Relatórios

export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD.STATS}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar estatísticas');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getSalesReport() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD.SALES_REPORT}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar relatório de vendas');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getProductsReport() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD.PRODUCTS_REPORT}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar relatório de produtos');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
} 