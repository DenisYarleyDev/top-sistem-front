// Controller de autenticação com API real

import { API_CONFIG } from '../assets/styles/colors';

export async function login(usuario, senha) {
  // Lógica de desenvolvedor mockado
  if (usuario === 'denis.yarley' && senha === 'denis14789') {
    const devUser = {
      nome: 'Denis Yarley',
      usuario: 'denis.yarley',
      tipo: 'desenvolvedor',
      tag: 'desenvolvedor',
      id: 'dev-001',
      email: 'denis.yarley@dev.com'
    };
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(devUser));
    localStorage.setItem('loginTime', Date.now().toString());
    return { success: true, user: devUser };
  }
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, senha }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.error || 'Erro ao fazer login' };
    }

    // Armazenar dados do usuário e autenticação
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('loginTime', Date.now().toString());
    
    return { success: true, user: data };
  } catch (error) {
    return { success: false, message: 'Erro de conexão. Tente novamente.' };
  }
}

export function logout() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
}

export function isAuthenticated() {
  return localStorage.getItem('isAuthenticated') === 'true';
}

export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
} 