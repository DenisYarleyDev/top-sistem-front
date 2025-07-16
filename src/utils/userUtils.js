// Utilitários para usuários

export const translateUserType = (type) => {
  switch(type) {
    case 'super': return 'Administrador';
    case 'comum': return 'Usuário';
    default: return type;
  }
};

export const getUserTypeColor = (type) => {
  switch(type) {
    case 'super': return '#dc3545'; // Vermelho para admin
    case 'comum': return '#28a745'; // Verde para usuário comum
    default: return '#6c757d'; // Cinza para outros
  }
};

export const canManageUsers = (userType) => {
  return userType === 'super';
};

export const canDeleteRecords = (userType) => {
  return userType === 'super';
}; 