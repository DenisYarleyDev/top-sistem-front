import React, { useState, useEffect, useRef } from 'react';
import colors from '../assets/styles/colors';
import ModalForm from '../components/ModalForm';
import OrcamentoModal from '../components/OrcamentoModal';
import OrcamentosTable from '../components/OrcamentosTable';
import Modal from '../components/Modal';
import { getClients } from '../controllers/clientsController';
import { getVendedores } from '../controllers/vendedoresController';
import { getProdutos } from '../controllers/produtosController';
import { getOrcamentos, updateOrcamento, deleteOrcamento, getItensOrcamento, updateItemOrcamento, deleteItemOrcamento } from '../controllers/orcamentosController';
import { API_CONFIG } from '../assets/styles/colors';

// Função utilitária para converter valores do payload
function toApiPayload(obj) {
  const out = {};
  for (const k in obj) {
    if (obj[k] !== undefined && obj[k] !== null) {
      if (k.endsWith('FK')) {
        out[k] = Number(obj[k]); // FK como integer
      } else {
        out[k] = String(obj[k]); // demais como string
      }
    }
  }
  return out;
}

// Função para salvar orçamento e itens
async function salvarOrcamentoApi(orcamento, itens) {
  // 1. Salvar orçamento
  const payloadOrcamento = toApiPayload(orcamento);
  const orcamentoRes = await fetch(`${API_CONFIG.BASE_URL}/api/orcamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadOrcamento)
  });
  if (!orcamentoRes.ok) {
    const errText = await orcamentoRes.text();
    console.error('Erro ao salvar orçamento:', errText);
    throw new Error('Erro ao salvar orçamento');
  }
  const orcamentoSalvo = await orcamentoRes.json();
  // 2. Salvar itens
  // Corrigir obtenção do id do orçamento salvo (compatível com objeto ou array)
  let orcamentoId = null;
  if (orcamentoSalvo && typeof orcamentoSalvo === 'object') {
    if ('id' in orcamentoSalvo) {
      orcamentoId = orcamentoSalvo.id;
    } else if (Array.isArray(orcamentoSalvo) && orcamentoSalvo[0]?.id) {
      orcamentoId = orcamentoSalvo[0].id;
    }
  }
  if (!orcamentoId) {
    console.error('Resposta completa do backend ao salvar orçamento:', orcamentoSalvo);
    throw new Error('Id do orçamento não encontrado');
  }
  for (const item of itens) {
    const itemPayload = toApiPayload({
      orcamentoFK: orcamentoId,
      produtoFK: item.produtoFK,
      largura: item.largura,
      altura: item.altura,
      area: item.area,
      quantidade: item.quantidade
    });
    const itemRes = await fetch(`${API_CONFIG.BASE_URL}/api/itens-orcamento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemPayload)
    });
    if (!itemRes.ok) {
      const errText = await itemRes.text();
      console.error('Erro ao salvar item do orçamento:', errText);
      throw new Error('Erro ao salvar item do orçamento');
    }
  }
  return orcamentoSalvo;
}

function BudgetsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  // Estado do cabeçalho
  const [cliente, setCliente] = useState(''); // id
  const [clienteInput, setClienteInput] = useState(''); // nome
  const [clientes, setClientes] = useState([]);
  const [vendedor, setVendedor] = useState(''); // id
  const [vendedorInput, setVendedorInput] = useState(''); // nome
  const [vendedores, setVendedores] = useState([]);
  const [parcelas, setParcelas] = useState('');
  const [desconto, setDesconto] = useState('7'); // valor padrão 7%
  // Estado do item
  const [produto, setProduto] = useState(''); // id
  const [produtoInput, setProdutoInput] = useState(''); // nome
  const [produtos, setProdutos] = useState([]);
  const [quantidade, setQuantidade] = useState('');
  const [largura, setLargura] = useState('');
  const [altura, setAltura] = useState('');
  const [area, setArea] = useState('');
  // Estado da lista de itens
  const [itens, setItens] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const produtoInputRef = useRef(null);
  const produtoDropdownRef = useRef(null);
  const [produtoDropdownIndex, setProdutoDropdownIndex] = useState(-1);
  const [produtoInputFocused, setProdutoInputFocused] = useState(false);
  const [clienteInputFocused, setClienteInputFocused] = useState(false);
  const [vendedorInputFocused, setVendedorInputFocused] = useState(false);
  const [orcamentos, setOrcamentos] = useState([]);
  const [loadingOrcamentos, setLoadingOrcamentos] = useState(true);
  const [editOrcamentoId, setEditOrcamentoId] = useState(null);
  const [orcamentoEditData, setOrcamentoEditData] = useState(null);
  const [produtosOrcamento, setProdutosOrcamento] = useState({}); // { [orcamentoId]: [nomesProdutos] }
  // Novo estado para controlar se está editando
  const [editandoOrcamentoId, setEditandoOrcamentoId] = useState(null);
  // Novo estado para controlar itens originais ao editar
  const [itensOriginais, setItensOriginais] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [filtroContato, setFiltroContato] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [modalExcluir, setModalExcluir] = useState({ aberto: false, orcamentoId: null });
  // Adicionar campo status ao estado do orçamento
  const [status, setStatus] = useState('aberto');

  // Carregar dados para autocomplete
  useEffect(() => {
    getClients().then(res => { if (res.success) setClientes(res.data); });
    getVendedores().then(res => { if (res.success) setVendedores(res.data); });
    getProdutos().then(res => { if (res.success) setProdutos(res.data); });
  }, []);

  // Carregar orçamentos
  useEffect(() => {
    async function loadOrcamentos() {
      setLoadingOrcamentos(true);
      const res = await getOrcamentos();
      if (res.success) setOrcamentos(res.data);
      setLoadingOrcamentos(false);
    }
    loadOrcamentos();
  }, []);

  // Carregar produtos dos orçamentos
  useEffect(() => {
    async function fetchProdutosOrcamentos() {
      const map = {};
      for (const orc of orcamentos) {
        const res = await getItensOrcamento(orc.id);
        if (res.success) {
          map[orc.id] = res.data.map(item => {
            const prod = produtos.find(p => p.id === item.produtoFK || p.id === Number(item.produtoFK));
            return prod ? prod.nome : `ID ${item.produtoFK}`;
          });
        } else {
          map[orc.id] = [];
        }
      }
      setProdutosOrcamento(map);
    }
    if (orcamentos.length > 0 && produtos.length > 0) fetchProdutosOrcamentos();
  }, [orcamentos, produtos]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        produtoInputRef.current &&
        !produtoInputRef.current.contains(event.target) &&
        produtoDropdownRef.current &&
        !produtoDropdownRef.current.contains(event.target)
      ) {
        setProdutoDropdownIndex(-1);
        setProdutoInputFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atualiza área automaticamente
  useEffect(() => {
    let larguraStr = largura;
    let alturaStr = altura;
    if (typeof larguraStr === 'number') larguraStr = larguraStr.toString();
    if (typeof alturaStr === 'number') alturaStr = alturaStr.toString();
    if (produto && getProdutoSelecionado()?.medida && larguraStr && alturaStr) {
      const areaCalc = (parseFloat(larguraStr.replace(',', '.')) * parseFloat(alturaStr.replace(',', '.'))).toFixed(2);
      setArea(isNaN(areaCalc) ? '' : areaCalc);
    } else {
      setArea('');
    }
  }, [largura, altura, produto]);

  function getProdutoSelecionado() {
    return produtos.find(p => p.id.toString() === produto);
  }
  function getClienteSelecionado() {
    return clientes.find(c => c.id.toString() === cliente);
  }
  function getVendedorSelecionado() {
    return vendedores.find(v => v.id.toString() === vendedor);
  }

  function handleSelectCliente(id) {
    setCliente(id);
    const obj = clientes.find(c => c.id.toString() === id);
    setClienteInput(obj ? obj.nome : '');
  }
  function handleSelectVendedor(id) {
    setVendedor(id);
    const obj = vendedores.find(v => v.id.toString() === id);
    setVendedorInput(obj ? obj.nome : '');
  }
  function handleSelectProduto(id) {
    setProduto(id);
    const obj = produtos.find(p => p.id.toString() === id);
    setProdutoInput(obj ? obj.nome : '');
  }

  function handleAddItem(e) {
    e.preventDefault();
    const prod = getProdutoSelecionado();
    if (!prod) return;
    // Validação dos campos obrigatórios
    const quantidadeAtual = Number(quantidade);
    if (!quantidadeAtual || quantidadeAtual <= 0) {
      alert('Informe a quantidade.');
      return;
    }
    let larguraNum = null;
    let alturaNum = null;
    let areaNum = null;
    if (prod.medida) {
      let larguraStr = largura;
      let alturaStr = altura;
      if (typeof larguraStr === 'number') larguraStr = larguraStr.toString();
      if (typeof alturaStr === 'number') alturaStr = alturaStr.toString();
      if (!larguraStr || Number(larguraStr.replace(',', '.')) <= 0) {
        alert('Informe a largura.');
        return;
      }
      if (!alturaStr || Number(alturaStr.replace(',', '.')) <= 0) {
        alert('Informe a altura.');
        return;
      }
      larguraNum = Number(larguraStr.replace(',', '.'));
      alturaNum = Number(alturaStr.replace(',', '.'));
      areaNum = Number((larguraNum * alturaNum).toFixed(2));
    }
    const valorUnitario = parseFloat(prod.preco);
    let subtotalNum = 0;
    if (prod.medida) {
      subtotalNum = Number((valorUnitario * areaNum * quantidadeAtual).toFixed(2));
    } else {
      subtotalNum = Number((valorUnitario * quantidadeAtual).toFixed(2));
    }
    const item = {
      produtoFK: produto,
      nomeProduto: prod.nome,
      valorUnitario: valorUnitario,
      comMedida: prod.medida, // mantém o nome do campo no item para a tabela
      quantidade: quantidadeAtual,
      largura: larguraNum,
      altura: alturaNum,
      area: areaNum,
      subtotal: subtotalNum,
    };
    if (editIndex !== null) {
      const novos = [...itens];
      novos[editIndex] = item;
      setItens(novos);
      setEditIndex(null);
    } else {
      setItens([...itens, item]);
    }
    setProduto(''); setProdutoInput(''); setQuantidade(''); setLargura(''); setAltura(''); setArea('');
  }

  function handleEditItem(idx) {
    const item = itens[idx];
    setProduto(item.produtoFK);
    setProdutoInput(item.nomeProduto);
    setQuantidade(item.quantidade);
    setLargura(item.largura);
    setAltura(item.altura);
    setArea(item.area);
    setEditIndex(idx);
  }

  function handleRemoveItem(idx) {
    setItens(itens.filter((_, i) => i !== idx));
    setEditIndex(null);
  }

  // Filtros para autocomplete
  let produtosFiltrados = [];
  if (produtoInput.length >= 2) {
    produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(produtoInput.toLowerCase()));
  } else if (produtoInputFocused && produtoInput.length === 0 && produtos.length > 0 && produtoDropdownIndex !== -2) {
    produtosFiltrados = produtos.slice(0, 5); // Mostra os 5 primeiros produtos ao focar
  }

  let clientesFiltradosDropdown = [];
  if (clienteInput.length >= 2) {
    clientesFiltradosDropdown = clientes.filter(c => c.nome.toLowerCase().includes(clienteInput.toLowerCase()));
  } else if (clienteInputFocused && clienteInput.length === 0 && clientes.length > 0) {
    clientesFiltradosDropdown = clientes.slice(0, 5);
  }

  let vendedoresFiltradosDropdown = [];
  if (vendedorInput.length >= 2) {
    vendedoresFiltradosDropdown = vendedores.filter(v => v.nome.toLowerCase().includes(vendedorInput.toLowerCase()));
  } else if (vendedorInputFocused && vendedorInput.length === 0 && vendedores.length > 0) {
    vendedoresFiltradosDropdown = vendedores.slice(0, 5);
  }

  // Função para calcular o total do orçamento
  function calcularTotalOrcamento() {
    return itens.reduce((acc, item) => acc + (typeof item.subtotal === 'number' && !isNaN(item.subtotal) ? item.subtotal : 0), 0);
  }

  // Função para deletar orçamento
  async function handleDeleteOrcamento(id) {
    if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) return;
    // Buscar e deletar todos os itens vinculados
    const resItens = await getItensOrcamento(id);
    if (resItens.success && Array.isArray(resItens.data)) {
      for (const item of resItens.data) {
        await deleteItemOrcamento(item.id);
      }
    }
    // Agora sim, deletar o orçamento
    const res = await deleteOrcamento(id);
    if (res.success) {
      setOrcamentos(orcamentos.filter(o => o.id !== id));
      alert('Orçamento excluído com sucesso!');
    } else {
      alert('Erro ao excluir orçamento: ' + res.message);
    }
  }

  // Função para editar orçamento (apenas campos básicos)
  function handleEditOrcamento(orcamento) {
    setEditOrcamentoId(orcamento.id);
    setOrcamentoEditData({ ...orcamento });
  }
  async function handleSaveEditOrcamento() {
    const res = await updateOrcamento(editOrcamentoId, orcamentoEditData);
    if (res.success) {
      setOrcamentos(orcamentos.map(o => o.id === editOrcamentoId ? res.data : o));
      setEditOrcamentoId(null);
      setOrcamentoEditData(null);
      alert('Orçamento atualizado com sucesso!');
    } else {
      alert('Erro ao atualizar orçamento: ' + res.message);
    }
  }
  function handleCancelEditOrcamento() {
    setEditOrcamentoId(null);
    setOrcamentoEditData(null);
  }

  // Função para abrir modal para edição
  async function handleEditOrcamento(orcamento) {
    setEditandoOrcamentoId(orcamento.id);
    setCliente(orcamento.clienteFK ? String(orcamento.clienteFK) : '');
    setClienteInput(() => {
      const c = clientes.find(c => c.id === orcamento.clienteFK || c.id === Number(orcamento.clienteFK));
      return c ? c.nome : '';
    });
    setVendedor(orcamento.vendedorFK ? String(orcamento.vendedorFK) : '');
    setVendedorInput(() => {
      const v = vendedores.find(v => v.id === orcamento.vendedorFK || v.id === Number(orcamento.vendedorFK));
      return v ? v.nome : '';
    });
    setParcelas(orcamento.parcelas || '');
    setDesconto(orcamento.desconto || '7');
    setStatus(orcamento.status || 'aberto'); // Adicionar status
    // Buscar itens do orçamento
    const res = await getItensOrcamento(orcamento.id);
    if (res.success) {
      setItens(res.data.map(item => {
        const prod = produtos.find(p => p.id === item.produtoFK || p.id === Number(item.produtoFK));
        // Recalcula subtotal se vier vazio, zero ou inválido
        let subtotal = item.subtotal !== undefined && item.subtotal !== null && item.subtotal !== '' ? Number(item.subtotal) : NaN;
        const preco = prod ? Number(prod.preco) : 0;
        if (!prod) subtotal = 0;
        if (!subtotal || isNaN(subtotal) || subtotal === 0) {
          if (prod && prod.medida) {
            subtotal = preco * (Number(item.quantidade) || 0) * (Number(item.area) || 0);
          } else {
            subtotal = preco * (Number(item.quantidade) || 0);
          }
        }
        // Garante valorUnitario correto
        let valorUnitario = item.valorUnitario !== undefined && item.valorUnitario !== null && item.valorUnitario !== '' ? Number(item.valorUnitario) : preco;
        return {
          id: item.id, // importante para update/delete
          produtoFK: String(item.produtoFK),
          nomeProduto: prod ? prod.nome : '',
          valorUnitario,
          comMedida: prod ? (prod.medida === true || prod.medida === 'true') : false,
          quantidade: item.quantidade ? Number(item.quantidade) : '',
          largura: item.largura !== undefined && item.largura !== null && item.largura !== '' ? Number(item.largura) : '',
          altura: item.altura !== undefined && item.altura !== null && item.altura !== '' ? Number(item.altura) : '',
          area: item.area !== undefined && item.area !== null && item.area !== '' ? Number(item.area) : '',
          subtotal
        };
      }));
      setItensOriginais(res.data.map(item => ({ ...item })));
    } else {
      setItens([]);
      setItensOriginais([]);
    }
    setModalOpen(true);
  }

  // Função para salvar orçamento (novo ou edição)
  async function handleSalvarOrcamento() {
    try {
      if (!cliente) { alert('Selecione um cliente.'); return; }
      if (!vendedor) { alert('Selecione um vendedor.'); return; }
      if (itens.length === 0) { alert('Adicione pelo menos um item.'); return; }
      // Validação extra: garantir que os ids existem e são válidos
      const clienteValido = clientes.some(c => String(c.id) === String(cliente) && c.id !== '' && c.id !== null && c.id !== undefined);
      const vendedorValido = vendedores.some(v => String(v.id) === String(vendedor) && v.id !== '' && v.id !== null && v.id !== undefined);
      if (!clienteValido) { alert('Selecione um cliente válido!'); return; }
      if (!vendedorValido) { alert('Selecione um vendedor válido!'); return; }
      for (const item of itens) {
        const produtoValido = produtos.some(p => String(p.id) === String(item.produtoFK) && p.id !== '' && p.id !== null && p.id !== undefined);
        if (!produtoValido) {
          alert('Produto inválido em um dos itens!');
          return;
        }
      }
      const orcamentoPayload = {
        clienteFK: cliente,
        vendedorFK: vendedor,
        totalOrcamento: calcularTotalOrcamento(),
        parcelas,
        desconto,
        status // Adicionar status ao payload
      };
      if (editandoOrcamentoId) {
        // Atualizar orçamento existente
        await updateOrcamento(editandoOrcamentoId, orcamentoPayload);
        // Atualizar, criar e deletar itens individualmente
        // 1. Atualizar itens existentes
        for (const item of itens) {
          if (item.id) {
            await updateItemOrcamento(item.id, toApiPayload({
              orcamentoFK: editandoOrcamentoId,
              produtoFK: item.produtoFK,
              largura: item.largura,
              altura: item.altura,
              area: item.area,
              quantidade: item.quantidade
            }));
          }
        }
        // 2. Criar novos itens
        for (const item of itens) {
          if (!item.id) {
            await fetch(`${API_CONFIG.BASE_URL}/api/itens-orcamento`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(toApiPayload({
                orcamentoFK: editandoOrcamentoId,
                produtoFK: item.produtoFK,
                largura: item.largura,
                altura: item.altura,
                area: item.area,
                quantidade: item.quantidade
              }))
            });
          }
        }
        // 3. Deletar itens removidos
        for (const itemOrig of itensOriginais) {
          if (!itens.some(i => i.id === itemOrig.id)) {
            await deleteItemOrcamento(itemOrig.id);
          }
        }
        alert('Orçamento atualizado com sucesso!');
      } else {
        // Novo orçamento
        await salvarOrcamentoApi(orcamentoPayload, itens);
        alert('Orçamento salvo com sucesso!');
      }
      setModalOpen(false);
      setEditandoOrcamentoId(null);
      setItensOriginais([]);
      setCliente(''); setClienteInput(''); setVendedor(''); setVendedorInput(''); setParcelas(''); setDesconto(''); setItens([]);
      // Recarregar orçamentos
      const res = await getOrcamentos();
      if (res.success) setOrcamentos(res.data);
    } catch (err) {
      alert('Erro ao salvar orçamento: ' + err.message);
    }
  }

  // Utilitário para formatar data
  function formatarDataBR(dataISO) {
    if (!dataISO) return '';
    const d = new Date(dataISO);
    if (isNaN(d)) return '';
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // Utilitário para formatar valor
  function formatarReais(valor) {
    if (valor == null || valor === '') return '';
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Filtro de orçamentos
  const orcamentosFiltrados = orcamentos.filter(orc => {
    const clienteObj = clientes.find(c => c.id === orc.clienteFK || c.id === Number(orc.clienteFK));
    const vendedorObj = vendedores.find(v => v.id === orc.vendedorFK || v.id === Number(orc.vendedorFK));
    const clienteNome = clienteObj ? clienteObj.nome.toLowerCase() : '';
    const vendedorNome = vendedorObj ? vendedorObj.nome.toLowerCase() : '';
    const clienteContato = clienteObj ? (clienteObj.telefone || '').toLowerCase() : '';
    const dataOrc = orc.data ? orc.data.slice(0, 10) : '';
    return (
      (!filtroCliente || clienteNome.includes(filtroCliente.toLowerCase())) &&
      (!filtroVendedor || vendedorNome.includes(filtroVendedor.toLowerCase())) &&
      (!filtroContato || clienteContato.includes(filtroContato.toLowerCase())) &&
      (!filtroData || dataOrc === filtroData)
    );
  });

  return (
    <div style={{ padding: 24 }}>
      {/* Botão Novo Orçamento */}
      <button
        style={{ padding: '10px 24px', fontSize: 16, background: colors.primary, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginBottom: 24 }}
        onClick={() => setModalOpen(true)}
      >
        Novo Orçamento
      </button>
      {/* Listagem de orçamentos */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.primary, marginBottom: 16 }}>Cadastro de Orçamentos</h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <input
                  type="text"
          placeholder="Filtrar por cliente..."
          value={filtroCliente}
          onChange={e => setFiltroCliente(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #c3e6cb' }}
        />
                <input
                  type="text"
          placeholder="Filtrar por vendedor..."
          value={filtroVendedor}
          onChange={e => setFiltroVendedor(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #c3e6cb' }}
        />
                <input
                  type="text"
          placeholder="Filtrar por contato do cliente..."
          value={filtroContato}
          onChange={e => setFiltroContato(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #c3e6cb' }}
        />
                <input
          type="date"
          placeholder="Filtrar por data"
          value={filtroData}
          onChange={e => setFiltroData(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #c3e6cb' }}
                />
              </div>
      {loadingOrcamentos ? (
        <div>Carregando orçamentos...</div>
      ) : (
        <OrcamentosTable
          orcamentos={orcamentosFiltrados}
          clientes={clientes}
          vendedores={vendedores}
          produtosOrcamento={produtosOrcamento}
          onEditar={handleEditOrcamento}
          onExcluir={id => setModalExcluir({ aberto: true, orcamentoId: id })}
          formatarReais={formatarReais}
          formatarDataBR={formatarDataBR}
        />
      )}
      <Modal
        isOpen={modalExcluir.aberto}
        onClose={() => setModalExcluir({ aberto: false, orcamentoId: null })}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este orçamento? Esta ação não poderá ser desfeita."
        type="warning"
        confirmText="Excluir"
        cancelText="Cancelar"
        showCancel={true}
        onConfirm={async () => {
          await handleDeleteOrcamento(modalExcluir.orcamentoId);
          setModalExcluir({ aberto: false, orcamentoId: null });
        }}
      />
      {/* Modal de edição inline simples */}
      {editOrcamentoId && orcamentoEditData && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: 24, marginBottom: 32 }}>
          <h3 style={{ color: colors.primary, fontWeight: 600, marginBottom: 16 }}>Editar Orçamento #{editOrcamentoId}</h3>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Cliente (ID)</label>
              <input type="text" value={orcamentoEditData.clienteFK} onChange={e => setOrcamentoEditData({ ...orcamentoEditData, clienteFK: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Vendedor (ID)</label>
              <input type="text" value={orcamentoEditData.vendedorFK} onChange={e => setOrcamentoEditData({ ...orcamentoEditData, vendedorFK: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }} />
                </div>
                <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Total</label>
              <input type="text" value={orcamentoEditData.totalOrcamento} onChange={e => setOrcamentoEditData({ ...orcamentoEditData, totalOrcamento: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }} />
                    </div>
                    <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Parcelas</label>
              <input type="text" value={orcamentoEditData.parcelas} onChange={e => setOrcamentoEditData({ ...orcamentoEditData, parcelas: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }} />
                    </div>
                    <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Desconto (%)</label>
              <input type="text" value={orcamentoEditData.desconto} onChange={e => setOrcamentoEditData({ ...orcamentoEditData, desconto: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }} />
                    </div>
                    <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Status</label>
              <select value={orcamentoEditData.status} onChange={e => setOrcamentoEditData({ ...orcamentoEditData, status: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}>
                <option value="aberto">Aberto</option>
                <option value="fechado">Fechado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
              </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button style={{ background: colors.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '10px 32px', fontWeight: 600, cursor: 'pointer' }} onClick={handleSaveEditOrcamento}>Salvar</button>
            <button style={{ background: colors.error, color: '#fff', border: 'none', borderRadius: 4, padding: '10px 32px', fontWeight: 600, cursor: 'pointer' }} onClick={handleCancelEditOrcamento}>Cancelar</button>
          </div>
        </div>
      )}
      <OrcamentoModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditandoOrcamentoId(null); setItensOriginais([]); }}
        onSalvar={handleSalvarOrcamento}
        editandoOrcamentoId={editandoOrcamentoId}
        cliente={cliente} setCliente={setCliente} clienteInput={clienteInput} setClienteInput={setClienteInput} clientes={clientes} clienteInputFocused={clienteInputFocused} setClienteInputFocused={setClienteInputFocused}
        vendedor={vendedor} setVendedor={setVendedor} vendedorInput={vendedorInput} setVendedorInput={setVendedorInput} vendedores={vendedores} vendedorInputFocused={vendedorInputFocused} setVendedorInputFocused={setVendedorInputFocused}
        parcelas={parcelas} setParcelas={setParcelas} desconto={desconto} setDesconto={setDesconto}
        itens={itens} setItens={setItens} produtos={produtos} produtoInputRef={produtoInputRef} produtoDropdownRef={produtoDropdownRef} produtoDropdownIndex={produtoDropdownIndex} setProdutoDropdownIndex={setProdutoDropdownIndex} produtoInputFocused={produtoInputFocused} setProdutoInputFocused={setProdutoInputFocused}
        handleAddItem={handleAddItem} editIndex={editIndex}
        handleEditItem={handleEditItem} handleRemoveItem={handleRemoveItem}
        calcularTotalOrcamento={calcularTotalOrcamento}
        toApiPayload={toApiPayload}
        handleSalvarOrcamento={handleSalvarOrcamento}
        produtoInput={produtoInput} setProdutoInput={setProdutoInput} produto={produto} setProduto={setProduto} quantidade={quantidade} setQuantidade={setQuantidade} largura={largura} setLargura={setLargura} altura={altura} setAltura={setAltura} area={area} setArea={setArea}
        status={status} setStatus={setStatus}
      />
    </div>
  );
}

export default BudgetsPage; 