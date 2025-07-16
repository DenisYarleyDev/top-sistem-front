const colors = {
  primary: '#218838', // Verde principal
  secondary: '#28a745', // Verde secundário
  accent: '#43a047', // Verde de destaque
  background: '#f6fff8', // Fundo claro
  surface: '#e9f5ee', // Superfície clara
  text: '#212529', // Texto principal
  textLight: '#f8f9fa', // Texto claro
  border: '#c3e6cb', // Bordas suaves
  error: '#dc3545', // Vermelho para erros
  warning: '#ffc107', // Amarelo para alertas
  success: '#28a745', // Verde para sucesso
};

// Configurações da API
export const API_CONFIG = {
  BASE_URL: 'https://back-top-alum-production.up.railway.app',
  ENDPOINTS: {
    // Autenticação
    LOGIN: '/api/login',
    
    // Usuários - CRUD completo
    USERS: {
      LIST: '/api/usuarios',
      CREATE: '/api/usuarios',
      GET: (id) => `/api/usuarios/${id}`,
      UPDATE: (id) => `/api/usuarios/${id}`,
      DELETE: (id) => `/api/usuarios/${id}`,
    },
    
    // Clientes - CRUD completo
    CLIENTS: {
      LIST: '/api/clientes',
      CREATE: '/api/clientes',
      GET: (id) => `/api/clientes/${id}`,
      UPDATE: (id) => `/api/clientes/${id}`,
      DELETE: (id) => `/api/clientes/${id}`,
    },
    
    // Vendedores - CRUD completo
    VENDEDORES: {
      LIST: '/api/vendedores',
      CREATE: '/api/vendedores',
      GET: (id) => `/api/vendedores/${id}`,
      UPDATE: (id) => `/api/vendedores/${id}`,
      DELETE: (id) => `/api/vendedores/${id}`,
    },
    
    // Produtos - CRUD completo
    PRODUCTS: {
      LIST: '/api/produtos',
      CREATE: '/api/produtos',
      GET: (id) => `/api/produtos/${id}`,
      UPDATE: (id) => `/api/produtos/${id}`,
      DELETE: (id) => `/api/produtos/${id}`,
    },
    
    // Vendas - CRUD completo
    SALES: {
      LIST: '/api/vendas',
      CREATE: '/api/vendas',
      GET: (id) => `/api/vendas/${id}`,
      UPDATE: (id) => `/api/vendas/${id}`,
      DELETE: (id) => `/api/vendas/${id}`,
    },
    
    // Dashboard - Relatórios e estatísticas
    DASHBOARD: {
      STATS: '/api/dashboard/stats',
      SALES_REPORT: '/api/dashboard/sales-report',
      PRODUCTS_REPORT: '/api/dashboard/products-report',
    },
  }
};

export default colors; 