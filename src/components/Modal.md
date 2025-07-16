# Componente Modal

O componente Modal é um modal reutilizável para exibir avisos, confirmações e mensagens no sistema.

## Propriedades

- `isOpen` (boolean): Controla se o modal está visível
- `onClose` (function): Função chamada quando o modal é fechado
- `title` (string): Título do modal
- `message` (string): Mensagem do modal
- `type` (string): Tipo do modal ('success', 'error', 'warning', 'info')
- `onConfirm` (function): Função chamada quando o botão confirmar é clicado
- `confirmText` (string): Texto do botão confirmar (padrão: 'Confirmar')
- `cancelText` (string): Texto do botão cancelar (padrão: 'Cancelar')
- `showCancel` (boolean): Se deve mostrar o botão cancelar (padrão: true)

## Tipos de Modal

### Success (Sucesso)
- Ícone: ✓
- Cor: Verde
- Uso: Confirmações de sucesso

### Error (Erro)
- Ícone: ✕
- Cor: Vermelho
- Uso: Mensagens de erro

### Warning (Aviso)
- Ícone: ⚠
- Cor: Amarelo/Laranja
- Uso: Confirmações importantes

### Info (Informação)
- Ícone: ℹ
- Cor: Azul
- Uso: Informações gerais

## Exemplos de Uso

### Modal de Sucesso Simples
```javascript
const [modalConfig, setModalConfig] = useState({
  isOpen: false,
  title: '',
  message: '',
  type: 'info'
});

const showSuccessModal = () => {
  setModalConfig({
    isOpen: true,
    title: 'Sucesso',
    message: 'Operação realizada com sucesso!',
    type: 'success',
    confirmText: 'OK',
    showCancel: false
  });
};

// No JSX
<Modal
  isOpen={modalConfig.isOpen}
  onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
  title={modalConfig.title}
  message={modalConfig.message}
  type={modalConfig.type}
  confirmText={modalConfig.confirmText}
  showCancel={modalConfig.showCancel}
/>
```

### Modal de Confirmação
```javascript
const handleDelete = (id) => {
  setModalConfig({
    isOpen: true,
    title: 'Confirmar Exclusão',
    message: 'Tem certeza que deseja excluir este item?',
    type: 'warning',
    onConfirm: () => {
      // Lógica de exclusão
      deleteItem(id);
    },
    confirmText: 'Excluir',
    cancelText: 'Cancelar'
  });
};
```

### Modal de Erro
```javascript
const handleError = (errorMessage) => {
  setModalConfig({
    isOpen: true,
    title: 'Erro',
    message: errorMessage,
    type: 'error',
    confirmText: 'OK',
    showCancel: false
  });
};
```

## Função Helper

Para facilitar o uso, você pode criar uma função helper:

```javascript
const showModal = (title, message, type, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar', showCancel = true) => {
  setModalConfig({
    isOpen: true,
    title,
    message,
    type,
    onConfirm,
    confirmText,
    cancelText,
    showCancel
  });
};

const closeModal = () => {
  setModalConfig(prev => ({ ...prev, isOpen: false }));
};

// Uso
showModal('Sucesso', 'Item salvo!', 'success', null, 'OK', '', false);
showModal('Erro', 'Falha ao salvar', 'error', null, 'OK', '', false);
showModal('Confirmar', 'Deseja excluir?', 'warning', handleDelete, 'Excluir', 'Cancelar');
``` 