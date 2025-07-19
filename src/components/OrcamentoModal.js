import React, { useState } from 'react';
import colors from '../assets/styles/colors';
import ModalForm from '../components/ModalForm';
import Modal from './Modal';

function OrcamentoModal({
  isOpen,
  onClose,
  onSalvar,
  editandoOrcamentoId,
  cliente, setCliente, clienteInput, setClienteInput, clientes, clienteInputFocused, setClienteInputFocused,
  vendedor, setVendedor, vendedorInput, setVendedorInput, vendedores, vendedorInputFocused, setVendedorInputFocused,
  parcelas, setParcelas, desconto, setDesconto,
  itens, setItens, produtos, produtoInputRef, produtoDropdownRef, produtoDropdownIndex, setProdutoDropdownIndex, produtoInputFocused, setProdutoInputFocused,
  handleAddItem, editIndex, setEditIndex,
  handleEditItem, handleRemoveItem,
  calcularTotalOrcamento,
  toApiPayload,
  handleSalvarOrcamento,
  produtoInput, setProdutoInput, produto, setProduto, quantidade, setQuantidade, largura, setLargura, altura, setAltura, area, setArea,
  status, setStatus,
}) {
  // Filtros para autocomplete
  let produtosFiltrados = [];
  if (produtoInput && produtoInput.length >= 2) {
    produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(produtoInput.toLowerCase()));
  } else if (produtoInputFocused && produtoInput.length === 0 && produtos.length > 0 && produtoDropdownIndex !== -2) {
    produtosFiltrados = produtos.slice(0, 5);
  }

  let clientesFiltradosDropdown = [];
  if (clienteInput && clienteInput.length >= 2) {
    clientesFiltradosDropdown = clientes.filter(c => c.nome.toLowerCase().includes(clienteInput.toLowerCase()));
  } else if (clienteInputFocused && clienteInput.length === 0 && clientes.length > 0) {
    clientesFiltradosDropdown = clientes.slice(0, 5);
  }

  let vendedoresFiltradosDropdown = [];
  if (vendedorInput && vendedorInput.length >= 2) {
    vendedoresFiltradosDropdown = vendedores.filter(v => v.nome.toLowerCase().includes(vendedorInput.toLowerCase()));
  } else if (vendedorInputFocused && vendedorInput.length === 0 && vendedores.length > 0) {
    vendedoresFiltradosDropdown = vendedores.slice(0, 5);
  }

  const [transpasso, setTranspasso] = useState('');
  const [modalMsg, setModalMsg] = useState({ open: false, title: '', message: '', type: 'info', onConfirm: null });

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  function handleAddItem() {
    const prod = produtos.find(p => p.id.toString() === produto);
    if (!prod) {
      setModalMsg({ open: true, title: 'Atenção', message: 'Selecione um produto válido.', type: 'warning', onConfirm: null });
      return;
    }
    const qtd = Number(quantidade) || 0;
    if (!qtd || qtd <= 0) {
      setModalMsg({ open: true, title: 'Atenção', message: 'Informe a quantidade.', type: 'warning', onConfirm: null });
      return;
    }
    let larguraNum = Number(largura) || 0;
    let alturaNum = Number(altura) || 0;
    let transpNum = Number(transpasso) || 0;
    if (prod.medida) {
      let larguraStr = largura;
      let alturaStr = altura;
      if (typeof larguraStr === 'number') larguraStr = larguraStr.toString();
      if (typeof alturaStr === 'number') alturaStr = alturaStr.toString();
      if (!larguraStr || Number(larguraStr.replace(',', '.')) <= 0) {
        setModalMsg({ open: true, title: 'Atenção', message: 'Informe a largura.', type: 'warning', onConfirm: null });
        return;
      }
      if (!alturaStr || Number(alturaStr.replace(',', '.')) <= 0) {
        setModalMsg({ open: true, title: 'Atenção', message: 'Informe a altura.', type: 'warning', onConfirm: null });
        return;
      }
      larguraNum = Number(larguraStr.replace(',', '.'));
      alturaNum = Number(alturaStr.replace(',', '.'));
    }
    let areaCalculada = '';
    let subtotal = 0;
    if (prod.medida) {
      areaCalculada = ((larguraNum + transpNum) * alturaNum).toFixed(3);
      subtotal = Number(prod.preco) * qtd * Number(areaCalculada);
    } else {
      areaCalculada = '';
      subtotal = Number(prod.preco) * qtd;
    }
    const novoItem = {
      produtoFK: prod.id,
      nomeProduto: prod.nome,
      quantidade: qtd,
      valorUnitario: Number(prod.preco),
      largura: prod.medida ? larguraNum : undefined,
      altura: prod.medida ? alturaNum : undefined,
      area: prod.medida ? Number(areaCalculada) : undefined,
      subtotal,
      transpasso: prod.medida ? transpasso : undefined // Salva transpasso localmente
    };
    console.log('Item adicionado no modal:', novoItem); // Depuração
    if (editIndex !== null) {
      setItens(itens.map((item, idx) => idx === editIndex ? novoItem : item));
    } else {
      setItens([...itens, novoItem]);
    }
    // Limpar campos
    setProduto('');
    setProdutoInput('');
    setQuantidade('');
    setLargura('');
    setAltura('');
    setArea('');
    setTranspasso('');
  }

  function handleEditItem(idx) {
    const item = itens[idx];
    setProduto(item.produtoFK?.toString() || '');
    setProdutoInput(item.nomeProduto || '');
    setQuantidade(item.quantidade || '');
    setLargura(item.largura || '');
    setAltura(item.altura || '');
    setArea(item.area || '');
    setTranspasso(item.transpasso !== undefined && item.transpasso !== null ? String(item.transpasso) : '');
    // Se houver controle de editIndex, setar aqui também
    if (typeof setEditIndex === 'function') setEditIndex(idx);
  }

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={editandoOrcamentoId ? `Editar Orçamento #${editandoOrcamentoId}` : 'Novo Orçamento'}
    >
      {/* Cabeçalho do orçamento */}
      <div style={{ marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: colors.primary, marginBottom: 16 }}>{editandoOrcamentoId ? `Editar Orçamento #${editandoOrcamentoId}` : 'Novo Orçamento'}</h2>
        <form autoComplete="off" onSubmit={e => e.preventDefault()}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <label style={{ fontWeight: 500 }}>Cliente</label>
              <input
                type="text"
                value={clienteInput}
                onChange={e => { setClienteInput(capitalizeWords(e.target.value)); setCliente(''); }}
                onFocus={() => setClienteInputFocused(true)}
                placeholder="Pesquisar cliente..."
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}
                autoComplete="off"
              />
              {clienteInputFocused && clientesFiltradosDropdown.length > 0 && (
                <ul style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #c3e6cb', borderRadius: 4, width: '100%', maxHeight: 180, overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
                  {clientesFiltradosDropdown.map(c => (
                    <li key={c.id} style={{ padding: 8, cursor: 'pointer' }} onClick={() => { setCliente(c.id); setClienteInput(c.nome); setClienteInputFocused(false); }}>{c.nome}</li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <label style={{ fontWeight: 500 }}>Vendedor</label>
              <input
                type="text"
                value={vendedorInput}
                onChange={e => { setVendedorInput(capitalizeWords(e.target.value)); setVendedor(''); }}
                onFocus={() => setVendedorInputFocused(true)}
                placeholder="Pesquisar vendedor..."
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}
                autoComplete="off"
              />
              {vendedorInputFocused && vendedoresFiltradosDropdown.length > 0 && (
                <ul style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #c3e6cb', borderRadius: 4, width: '100%', maxHeight: 180, overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
                  {vendedoresFiltradosDropdown.map(v => (
                    <li key={v.id} style={{ padding: 8, cursor: 'pointer' }} onClick={() => { setVendedor(v.id); setVendedorInput(v.nome); setVendedorInputFocused(false); }}>{v.nome}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 0 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Parcelas</label>
              <input
                type="text"
                value={parcelas}
                onChange={e => setParcelas(e.target.value)}
                placeholder="Ex: 3"
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Desconto (%)</label>
              <input
                type="text"
                value={desconto}
                onChange={e => setDesconto(e.target.value)}
                placeholder="Ex: 7%"
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}>
                <option value="aberto">Aberto</option>
                <option value="fechado">Fechado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </form>
      </div>
      {/* Área de produtos do orçamento */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.primary, marginBottom: 12 }}>Itens do Orçamento</h2>
        <form autoComplete="off" onSubmit={e => e.preventDefault()}>
          <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 16, marginBottom: 16, background: '#f6fff8' }}>
            <legend style={{ fontWeight: 600, color: colors.primary, fontSize: 15 }}>Adicionar Produto</legend>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <div style={{ flex: 2, position: 'relative' }}>
                <label style={{ fontWeight: 500 }}>Produto</label>
                <input
                  ref={produtoInputRef}
                  type="text"
                  value={produtoInput}
                  onChange={e => { setProdutoInput(capitalizeWords(e.target.value)); setProduto(''); setProdutoDropdownIndex(-1); }}
                  onFocus={() => { setProdutoDropdownIndex(-1); setProdutoInputFocused(true); }}
                  onKeyDown={e => {
                    if (produtosFiltrados.length > 0) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setProdutoDropdownIndex(idx => Math.min(idx + 1, produtosFiltrados.length - 1));
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setProdutoDropdownIndex(idx => Math.max(idx - 1, 0));
                      } else if (e.key === 'Enter' && produtoDropdownIndex >= 0) {
                        e.preventDefault();
                        const p = produtosFiltrados[produtoDropdownIndex];
                        if (p) {
                          setProduto(p.id.toString());
                          setProdutoInput(p.nome);
                          setProdutoDropdownIndex(-1);
                        }
                      } else if (e.key === 'Escape') {
                        setProdutoDropdownIndex(-1);
                      }
                    }
                  }}
                  placeholder="Pesquisar produto..."
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}
                  autoComplete="off"
                />
                {produtoInputFocused && produtosFiltrados.length > 0 && produtoDropdownIndex !== -2 && (
                  <ul
                    ref={produtoDropdownRef}
                    style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #c3e6cb', borderRadius: 4, width: '100%', maxHeight: 180, overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
                  >
                    {produtosFiltrados.map((p, idx) => (
                      <li
                        key={p.id}
                        onClick={() => { setProduto(p.id.toString()); setProdutoInput(p.nome); setProdutoDropdownIndex(-2); setProdutoInputFocused(false); }}
                        onMouseEnter={() => setProdutoDropdownIndex(idx)}
                        style={{
                          padding: 8,
                          cursor: 'pointer',
                          background: produtoDropdownIndex === idx ? colors.primary : '#fff',
                          color: produtoDropdownIndex === idx ? '#fff' : '#222',
                          transition: 'background 0.15s',
                          borderBottom: '1px solid #f0f0f0',
                        }}
                      >
                        {p.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Quantidade</label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={e => setQuantidade(e.target.value)}
                  placeholder="Ex: 2"
                  min={1}
                  step={1}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}
                />
              </div>
              {(() => {
                const prod = produtos.find(p => p.id.toString() === produto);
                if (prod && prod.medida) {
                  return (
                    <>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 500 }}>Largura</label>
                        <input
                          type="number"
                          value={largura}
                          onChange={e => setLargura(e.target.value)}
                          min={0}
                          step={0.01}
                          placeholder="Ex: 1.20"
                          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 500 }}>Altura</label>
                        <input
                          type="number"
                          value={altura}
                          onChange={e => setAltura(e.target.value)}
                          min={0}
                          step={0.01}
                          placeholder="Ex: 2.00"
                          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}
                        />
                      </div>
                      {(() => {
                        const prod = produtos.find(p => p.id.toString() === produto);
                        if (prod && prod.medida) {
                          return (
                            <div style={{ flex: 1 }}>
                              <label style={{ fontWeight: 500 }}>Transpasso (opcional)</label>
                              <input
                                type="number"
                                value={transpasso}
                                onChange={e => setTranspasso(e.target.value)}
                                min={0}
                                step={0.01}
                                placeholder="Ex: 0.05"
                                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}
                              />
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 500 }}>Área</label>
                        <input
                          type="text"
                          value={area}
                          readOnly
                          style={{ width: '100%', background: '#f3f4f6', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4 }}
                        />
                      </div>
                    </>
                  );
                }
                return null;
              })()}
              {(() => {
                const prod = produtos.find(p => p.id.toString() === produto);
                const preco = prod ? Number(prod.preco) : 0;
                let subtotal = 0;
                if (prod && prod.medida) {
                  const areaCalculada = (() => {
                    const larg = Number(largura) || 0;
                    const alt = Number(altura) || 0;
                    const transp = Number(transpasso) || 0;
                    return ((larg + transp) * alt).toFixed(3);
                  })();
                  subtotal = preco * (Number(quantidade) || 0) * (Number(areaCalculada) || 0);
                } else {
                  subtotal = preco * (Number(quantidade) || 0);
                }
                return (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 500 }}>Subtotal</label>
                    <input
                      type="text"
                      value={subtotal > 0 ? `R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
                      readOnly
                      style={{ width: '100%', background: '#f3f4f6', padding: 8, borderRadius: 4, border: '1px solid #c3e6cb', marginTop: 4, fontWeight: 600 }}
                    />
                  </div>
                );
              })()}
            </div>
            <button
              type="button"
              style={{ background: colors.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 500, cursor: 'pointer', marginTop: 8, minWidth: 160 }}
              onClick={handleAddItem}
            >
              {editIndex !== null ? 'Salvar Alteração' : 'Adicionar Produto'}
            </button>
          </fieldset>
        </form>
        {/* Tabela de itens adicionados */}
        <div style={{ marginBottom: 16, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: colors.surface }}>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: colors.primary }}>Produto</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: colors.primary }}>Qtd</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: colors.primary }}>Valor Unitário</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: colors.primary }}>Largura</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: colors.primary }}>Altura</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: colors.primary }}>Área</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: colors.primary }}>Subtotal</th>
                <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}></th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 20 }}>Nenhum produto adicionado</td></tr>
              )}
              {itens.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 10 }}>{item.nomeProduto}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{item.quantidade}</td>
                  <td style={{ padding: 10, textAlign: 'right' }}>{typeof item.valorUnitario === 'number' && !isNaN(item.valorUnitario) ? `R$ ${item.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{(typeof item.largura === 'number' && !isNaN(item.largura) && item.largura > 0) ? item.largura : '-'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{(typeof item.altura === 'number' && !isNaN(item.altura) && item.altura > 0) ? item.altura : '-'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{(typeof item.area === 'number' && !isNaN(item.area) && item.area > 0) ? item.area : '-'}</td>
                  <td style={{ padding: 10, textAlign: 'right', fontWeight: 500 }}>
                    {(() => {
                      let subtotal = item.subtotal;
                      const prod = produtos.find(p => p.id.toString() === item.produtoFK);
                      const preco = prod ? Number(prod.preco) : 0;
                      if ((subtotal === '' || subtotal === undefined || isNaN(subtotal)) && prod) {
                        if (prod.medida) {
                          const areaCalculada = (() => {
                            const larg = Number(item.largura) || 0;
                            const alt = Number(item.altura) || 0;
                            const transp = Number(item.transpasso) || 0;
                            return ((larg + transp) * alt).toFixed(3);
                          })();
                          subtotal = preco * (Number(item.quantidade) || 0) * (Number(areaCalculada) || 0);
                        } else {
                          subtotal = preco * (Number(item.quantidade) || 0);
                        }
                      }
                      return (typeof subtotal === 'number' && !isNaN(subtotal))
                        ? `R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : 'R$ 0,00';
                    })()}
                  </td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <button style={{ marginRight: 8, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => handleEditItem(idx)}>Editar</button>
                    <button style={{ color: colors.error, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => handleRemoveItem(idx)}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Resumo financeiro */}
        {itens.length > 0 && (
          <div style={{
            background: '#f6fff8',
            border: '1px solid #c3e6cb',
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
            display: 'flex',
            gap: 32,
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(16,185,129,0.07)'
          }}>
            {/* Total Parcelado */}
            <div style={{ flex: 1 }}>
              <div style={{ color: colors.primary, fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Total Parcelado</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {(() => {
                  const total = itens.reduce((acc, item) => acc + (typeof item.subtotal === 'number' && !isNaN(item.subtotal) ? item.subtotal : 0), 0);
                  const nParcelas = Number(parcelas) > 0 ? Number(parcelas) : 1;
                  const valorParcela = total / nParcelas;
                  return `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${nParcelas}x de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
                })()}
              </div>
            </div>
            {/* Valor do Desconto */}
            <div style={{ flex: 1 }}>
              <div style={{ color: colors.primary, fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Desconto</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>
                {(() => {
                  const total = itens.reduce((acc, item) => acc + (typeof item.subtotal === 'number' && !isNaN(item.subtotal) ? item.subtotal : 0), 0);
                  const descontoNum = Number(desconto) > 0 ? Number(desconto) : 0;
                  const valorDesconto = total * (descontoNum / 100);
                  return `R$ ${valorDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                })()}
              </div>
            </div>
            {/* Valor à Vista */}
            <div style={{ flex: 1 }}>
              <div style={{ color: colors.primary, fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Valor à Vista (com desconto)</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>
                {(() => {
                  const total = itens.reduce((acc, item) => acc + (typeof item.subtotal === 'number' && !isNaN(item.subtotal) ? item.subtotal : 0), 0);
                  const descontoNum = Number(desconto) > 0 ? Number(desconto) : 0;
                  const valorVista = total * (1 - descontoNum / 100);
                  return `R$ ${valorVista.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Botão de salvar orçamento */}
      <button
        style={{ background: colors.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '12px 0', fontWeight: 700, fontSize: 17, cursor: 'pointer', width: '100%', letterSpacing: 1 }}
        onClick={handleSalvarOrcamento}
      >
        {editandoOrcamentoId ? 'Salvar Alterações' : 'Salvar Orçamento'}
      </button>
      <Modal
        isOpen={modalMsg.open}
        onClose={() => setModalMsg({ ...modalMsg, open: false })}
        title={modalMsg.title}
        message={modalMsg.message}
        type={modalMsg.type}
        showCancel={false}
        confirmText="OK"
        onConfirm={modalMsg.onConfirm}
      />
    </ModalForm>
  );
}

export default OrcamentoModal; 