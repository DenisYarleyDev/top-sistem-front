import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrcamentos, getItensOrcamento } from '../controllers/orcamentosController';
import { getClients } from '../controllers/clientsController';
import { getVendedores } from '../controllers/vendedoresController';
import { getProdutos } from '../controllers/produtosController';

// Utilitários de formatação
function formatarTelefone(telefone) {
  if (!telefone) return '-';
  const num = telefone.replace(/\D/g, '');
  if (num.length === 11) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
  } else if (num.length === 10) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
  }
  return telefone;
}
function formatarCNPJ(cnpj) {
  if (!cnpj) return '-';
  const num = cnpj.replace(/\D/g, '');
  if (num.length === 14) {
    return `${num.slice(0,2)}.${num.slice(2,5)}.${num.slice(5,8)}/${num.slice(8,12)}-${num.slice(12)}`;
  }
  return cnpj;
}
function formatarCPF(cpf) {
  if (!cpf) return '-';
  const num = cpf.replace(/\D/g, '');
  if (num.length === 11) {
    return `${num.slice(0,3)}.${num.slice(3,6)}.${num.slice(6,9)}-${num.slice(9)}`;
  }
  return cpf;
}
function formatarReais(valor) {
  if (valor == null || valor === '') return '-';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function identificarCpfCnpj(doc) {
  if (!doc) return '-';
  const num = doc.replace(/\D/g, '');
  if (num.length === 11) return formatarCPF(num);
  if (num.length === 14) return formatarCNPJ(num);
  return doc;
}

const DADOS_LOJA = {
  nome: 'Top Alumínio e Vidraçaria',
  cnpj: '46252787000180',
  endereco: 'Av. José dos Santos e Silva, 1205A - Centro (Sul) - Teresina, Piauí',
  contato: '86981782681',
};

export default function OrcamentoPrint() {
  const { id } = useParams();
  const [orcamento, setOrcamento] = useState(null);
  const [itens, setItens] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [showPdfBtn, setShowPdfBtn] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const orcRes = await getOrcamentos();
      const orc = orcRes.success && Array.isArray(orcRes.data) ? orcRes.data.find(o => String(o.id) === String(id)) : null;
      setOrcamento(orc);
      if (orc) {
        const itensRes = await getItensOrcamento(orc.id);
        setItens(itensRes.success ? itensRes.data : []);
        const clientesRes = await getClients();
        setCliente(clientesRes.success ? clientesRes.data.find(c => c.id === orc.clienteFK || c.id === Number(orc.clienteFK)) : null);
        const vendedoresRes = await getVendedores();
        setVendedor(vendedoresRes.success ? vendedoresRes.data.find(v => v.id === orc.vendedorFK || v.id === Number(orc.vendedorFK)) : null);
        const produtosRes = await getProdutos();
        setProdutos(produtosRes.success ? produtosRes.data : []);
      }
    }
    fetchData();
  }, [id]);

  if (!orcamento) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Carregando orçamento...</div>;
  }

  // Cálculos
  const total = itens.reduce((acc, item) => {
    const prod = produtos.find(p => p.id === item.produtoFK || p.id === Number(item.produtoFK));
    const preco = prod ? Number(prod.preco) : 0;
    if (prod && prod.medida) {
      return acc + preco * (Number(item.quantidade) || 0) * (Number(item.area) || 0);
    } else {
      return acc + preco * (Number(item.quantidade) || 0);
    }
  }, 0);
  const nParcelas = Number(orcamento.parcelas) > 0 ? Number(orcamento.parcelas) : 1;
  const valorParcela = total / nParcelas;
  const descontoNum = Number(orcamento.desconto) > 0 ? Number(orcamento.desconto) : 0;
  const valorDesconto = total * (descontoNum / 100);
  const valorVista = total * (1 - descontoNum / 100);

  // Função para baixar PDF
  function handleDownloadPDF() {
    // Usa a função de impressão do navegador
    window.print();
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 40, fontFamily: 'Segoe UI, Arial, sans-serif', color: '#222', position: 'relative' }}>
      {/* Botão retrátil (menu hambúrguer) */}
      <div className="no-print" style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={() => setShowPdfBtn(v => !v)}
          style={{
            background: 'transparent',
            color: '#b5b5b5',
            border: 'none',
            borderRadius: '50%',
            width: 12,
            height: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0.5,
            transition: 'opacity 0.2s',
            fontSize: 12,
            outline: 'none',
            marginBottom: 4
          }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.9}
          onMouseOut={e => e.currentTarget.style.opacity = 0.5}
          aria-label="Menu PDF"
        >
          <span style={{ display: 'block', lineHeight: 0 }}>&#8942;</span>
        </button>
        {showPdfBtn && (
          <button
            onClick={handleDownloadPDF}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 500,
              fontSize: 15,
              cursor: 'pointer',
              marginTop: 6,
              boxShadow: '0 2px 8px rgba(16,185,129,0.07)',
              width: 'auto',
              display: 'block',
              opacity: 0.95
            }}
          >
            Baixar PDF
          </button>
        )}
      </div>
      {/* Identificação do layout */}
      <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, letterSpacing: 1, color: '#10b981', marginBottom: 16 }}>
        ORÇAMENTO
      </div>
      {/* Cabeçalho da loja */}
      <div style={{ borderBottom: '2px solid #10b981', marginBottom: 24, paddingBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#10b981', letterSpacing: 1 }}>{DADOS_LOJA.nome}</div>
          <div style={{ fontSize: 15, color: '#444', marginTop: 4 }}>CNPJ: {formatarCNPJ(DADOS_LOJA.cnpj)}</div>
          <div style={{ fontSize: 15, color: '#444' }}>{DADOS_LOJA.endereco}</div>
          <div style={{ fontSize: 15, color: '#444' }}>Contato: {formatarTelefone(DADOS_LOJA.contato)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#10b981' }}>Orçamento #{orcamento.id}</div>
          <div style={{ fontSize: 14, color: '#666' }}>{orcamento.data ? new Date(orcamento.data).toLocaleDateString('pt-BR') : ''}</div>
        </div>
      </div>
      {/* Cliente e vendedor */}
      <div style={{ display: 'flex', gap: 40, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 4 }}>Cliente</div>
          <div><b>Nome:</b> {cliente?.nome || '-'}</div>
          <div><b>Telefone:</b> {formatarTelefone(cliente?.telefone)}</div>
          <div><b>Endereço:</b> {cliente?.rua || '-'} {cliente?.numero ? ', ' + cliente.numero : ''} {cliente?.bairro ? '- ' + cliente.bairro : ''} {cliente?.cidade ? '- ' + cliente.cidade : ''}</div>
          <div><b>CPF/CNPJ:</b> {identificarCpfCnpj(cliente?.cpfoucnpj)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 4 }}>Vendedor</div>
          <div><b>Nome:</b> {vendedor?.nome || '-'}</div>
          <div><b>Telefone:</b> {formatarTelefone(vendedor?.numero)}</div>
          <div><b>ID:</b> {vendedor?.id || '-'}</div>
        </div>
      </div>
      {/* Produtos */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 600, color: '#10b981', fontSize: 17, marginBottom: 8 }}>Produtos</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#f9fafb', borderRadius: 8, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#e6f7ef' }}>
              <th style={{ padding: 8, borderBottom: '1px solid #d1fae5' }}>Produto</th>
              <th style={{ padding: 8, borderBottom: '1px solid #d1fae5' }}>Qtd</th>
              <th style={{ padding: 8, borderBottom: '1px solid #d1fae5' }}>Valor</th>
              <th style={{ padding: 8, borderBottom: '1px solid #d1fae5' }}>Largura</th>
              <th style={{ padding: 8, borderBottom: '1px solid #d1fae5' }}>Altura</th>
              <th style={{ padding: 8, borderBottom: '1px solid #d1fae5' }}>Área</th>
              <th style={{ padding: 8, borderBottom: '1px solid #d1fae5' }}>Valor Unitário</th>
              <th style={{ padding: 8, borderBottom: '1px solid #d1fae5' }}>Subtotal</th>
              <th style={{ padding: 8, borderBottom: '1px solid #d1fae5' }}>Medida</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, idx) => {
              const prod = produtos.find(p => p.id === item.produtoFK || p.id === Number(item.produtoFK));
              const preco = prod ? Number(prod.preco) : 0;
              const area = Number(item.area) || 0;
              const quantidade = Number(item.quantidade) || 0;
              const valorUnitario = prod && prod.medida ? preco * area : preco;
              const subtotal = valorUnitario * quantidade;
              const formatMedida = (valor, sufixo = 'm') => (valor !== undefined && valor !== null && !isNaN(valor)) ? `${Number(valor).toFixed(2).replace('.', ',')} ${sufixo}` : '-';
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 8 }}>{prod ? prod.nome : '-'}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{item.quantidade}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{prod && prod.medida ? `${formatarReais(preco)} / m²` : formatarReais(preco)}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{prod && prod.medida ? formatMedida(item.largura) : '-'}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{prod && prod.medida ? formatMedida(item.altura) : '-'}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{prod && prod.medida ? formatMedida(item.area, 'm²') : '-'}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{formatarReais(valorUnitario)}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{formatarReais(subtotal)}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{prod && prod.medida ? 'Sim' : 'Não'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Resumo financeiro */}
      <div style={{
        background: '#f6fff8',
        border: '1px solid #c3e6cb',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(16,185,129,0.07)',
        padding: 20,
        marginBottom: 24,
        display: 'flex',
        gap: 32,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        fontSize: 15,
        color: '#222',
      }}>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 2 }}>Total Parcelado</div>
          <div>{`R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
          <div style={{ fontSize: 13, color: '#666' }}>{`${nParcelas}x de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
        </div>
        <div style={{ minWidth: 120 }}>
          <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 2 }}>Desconto</div>
          <div style={{ color: '#ef4444' }}>{formatarReais(valorDesconto)}</div>
        </div>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 2 }}>Valor à Vista</div>
          <div style={{ color: '#059669', fontWeight: 600 }}>{formatarReais(valorVista)}</div>
        </div>
      </div>
      <footer style={{
        marginTop: 40,
        paddingTop: 16,
        borderTop: '1px solid #e5e7eb',
        color: '#888',
        fontSize: 13,
        textAlign: 'center',
        letterSpacing: 0.2,
        opacity: 0.85
      }}>
        Sistema desenvolvido por <b>Denis Yarley</b> &bull; Contato: (86) 98133-8017 / (86) 98871-4108<br/>
        E-mail: <a href="mailto:feitodenis@gmail.com" style={{ color: '#10b981', textDecoration: 'none' }}>feitodenis@gmail.com</a> &bull; Instagram: <a href="https://instagram.com/denisftosa" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'none' }}>@denisftosa</a>
      </footer>
    </div>
  );
}

/* CSS para esconder o botão na impressão */
<style>{`
  @media print {
    .no-print { display: none !important; }
  }
`}</style> 