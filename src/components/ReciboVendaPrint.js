import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getOrcamentos, getItensOrcamento } from '../controllers/orcamentosController';
import { getClients } from '../controllers/clientsController';
import { getVendedores } from '../controllers/vendedoresController';
import { getProdutos } from '../controllers/produtosController';

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

export default function ReciboVendaPrint() {
  const { id } = useParams();
  const location = useLocation();
  const [orcamento, setOrcamento] = useState(null);
  const [itens, setItens] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const reciboRef = useRef();

  function handleDownloadPDF() {
    setMenuOpen(false);
    // Função de download PDF removida - use a função de impressão do navegador
    window.print();
  }

  // Extrair parâmetros da query string
  const searchParams = new URLSearchParams(location.search);
  const tipoPagamento = searchParams.get('tipo');
  const entrada = searchParams.get('entrada');
  const entradaTipo = searchParams.get('entradaTipo');
  const dataEntrega = searchParams.get('dataEntrega');
  // Função para formatar data yyyy-mm-dd para dd/mm/aaaa
  function formatarDataEntrega(data) {
    if (!data) return '__/__/____';
    const [ano, mes, dia] = data.split('-');
    if (!ano || !mes || !dia) return '__/__/____';
    return `${dia}/${mes}/${ano}`;
  }

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
    return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Carregando recibo...</div>;
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
  const nParcelas = Number(orcamento?.parcelas) > 0 ? Number(orcamento.parcelas) : 1;
  const valorParcela = total / nParcelas;
  const descontoNum = Number(orcamento?.desconto) > 0 ? Number(orcamento.desconto) : 0;
  const valorDesconto = total * (descontoNum / 100);
  const valorVista = total * (1 - descontoNum / 100);

  // Cálculo para entrada e saldo se à vista
  let valorEntrada = 0;
  if (tipoPagamento === 'avista' && entrada) {
    if (entradaTipo === 'porcentagem') {
      valorEntrada = total * (Number(entrada) / 100);
    } else {
      valorEntrada = Number(entrada);
    }
  }
  const saldoRestante = tipoPagamento === 'avista' ? Math.max(0, valorVista - valorEntrada) : 0;

  return (
    <div ref={reciboRef} style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 40, fontFamily: 'Segoe UI, Arial, sans-serif', color: '#222', position: 'relative' }}>
      {/* Botão de 3 pontos para menu PDF */}
      <div className="no-print" style={{ position: 'absolute', top: 18, right: 18, zIndex: 10 }}>
        <button
          onClick={() => setMenuOpen(m => !m)}
          style={{
            background: 'none',
            border: 'none',
            color: '#10b981',
            fontSize: 26,
            cursor: 'pointer',
            opacity: 0.5,
            padding: 2,
            borderRadius: 6,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
          }}
          title="Mais opções"
        >
          &#8942;
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: 36,
            right: 0,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            minWidth: 120,
            padding: '4px 0',
            zIndex: 20
          }}>
            <button
              onClick={handleDownloadPDF}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#222',
                fontSize: 15,
                padding: '8px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 4,
                transition: 'background 0.2s',
                opacity: 0.85
              }}
            >
              Baixar PDF
            </button>
          </div>
        )}
      </div>
      {/* Identificação do layout */}
      <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, letterSpacing: 1, color: '#10b981', marginBottom: 16 }}>
        RECIBO DE COMPRA
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
          <div style={{ fontSize: 18, fontWeight: 600, color: '#10b981' }}>Recibo #{orcamento.id}</div>
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
      {tipoPagamento === 'parcelado' ? (
        <div style={{
          background: '#f6fff8',
          border: '1px solid #c3e6cb',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(16,185,129,0.07)',
          padding: '10px 18px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          fontSize: 14,
          color: '#222',
          gap: 32,
          minHeight: 0
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: '#10b981', fontSize: 15, marginBottom: 2 }}>Compra Parcelada</div>
            <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 0 }}>Total Parcelado</div>
            <div style={{ fontSize: 15 }}>{`R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
            <div style={{ fontSize: 13, color: '#666' }}>{`${nParcelas}x de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
          </div>
        </div>
      ) : tipoPagamento === 'avista' ? (
        <div style={{
          background: '#f6fff8',
          border: '1px solid #c3e6cb',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(16,185,129,0.07)',
          padding: '10px 18px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          fontSize: 14,
          color: '#222',
          gap: 32,
          minHeight: 0
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: '#10b981', fontSize: 15, marginBottom: 2 }}>Compra à Vista</div>
            <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 0 }}>Valor de Entrada Pago</div>
            <div style={{ color: '#059669', fontWeight: 600, fontSize: 15 }}>{formatarReais(valorEntrada)}</div>
            <div style={{ fontWeight: 600, color: '#10b981', margin: '8px 0 0 0' }}>Saldo Restante</div>
            <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 15 }}>{formatarReais(saldoRestante)}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>Total: {formatarReais(total)} &nbsp;|&nbsp; Desconto: {formatarReais(valorDesconto)} &nbsp;|&nbsp; À Vista: {formatarReais(valorVista)}</div>
          </div>
        </div>
      ) : null}
      {/* Campo para data de entrega */}
      <div style={{ margin: '32px 0 24px 0', display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ fontWeight: 600, color: '#10b981', minWidth: 140 }}>Data de Entrega:</div>
        <div style={{ borderBottom: '1px solid #222', minWidth: 120, height: 28, fontSize: 18, letterSpacing: 6, color: '#888', paddingLeft: 8 }}>{formatarDataEntrega(dataEntrega)}</div>
      </div>
      {/* Assinaturas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, marginBottom: 24 }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ borderBottom: '1px solid #222', width: 260, margin: '0 auto', height: 28 }}></div>
          <div style={{ marginTop: 8, color: '#444', fontSize: 15 }}>Assinatura do Cliente</div>
        </div>
        <div style={{ flex: 0.1 }}></div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ borderBottom: '1px solid #222', width: 260, margin: '0 auto', height: 28 }}></div>
          <div style={{ marginTop: 8, color: '#444', fontSize: 15 }}>Assinatura do Vendedor</div>
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
    body, html { background: #fff !important; }
  }
`}</style> 