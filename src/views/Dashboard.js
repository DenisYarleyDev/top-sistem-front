import React, { useEffect, useState } from 'react';
import { getOrcamentos } from '../controllers/orcamentosController';
import { getSales } from '../controllers/salesController';
import { getVendedores } from '../controllers/vendedoresController';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orcamentos, setOrcamentos] = useState([]);
  const [vendasData, setVendasData] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Buscar vendas reais
        const vendasRes = await getSales();
        if (!vendasRes.success) throw new Error(vendasRes.message);
        const vendasData = vendasRes.data || [];
        setVendasData(vendasData);
        // Buscar vendedores
        const vendedoresRes = await getVendedores();
        if (vendedoresRes.success) setVendedores(vendedoresRes.data || []);
        // Buscar orçamentos
        const orcamentosRes = await getOrcamentos();
        if (orcamentosRes.success) setOrcamentos(orcamentosRes.data || []);
        // Total de vendas (todas)
        const canceladas = vendasData.filter(v => v.status === 'cancelada');
        const totalCanceladasValor = canceladas.reduce((acc, v) => acc + (Number(v.valor_total) || 0), 0);
        const totalCanceladasQtd = canceladas.length;
        // Vendas faturadas (não canceladas)
        const faturadas = vendasData.filter(v => v.status !== 'cancelada');
        const totalVendasValor = faturadas.reduce((acc, v) => acc + (Number(v.valor_total) || 0), 0);
        const totalVendasQtd = faturadas.length;
        // Vendas do mês (faturadas)
        const now = new Date();
        const vendasMes = faturadas.filter(v => {
          const dataStr = v.created_at || v.data;
          if (!dataStr) return false;
          const data = new Date(dataStr);
          return !isNaN(data) && data.getMonth() === now.getMonth() && data.getFullYear() === now.getFullYear();
        });
        const totalVendasMesValor = vendasMes.reduce((acc, v) => acc + (Number(v.valor_total) || 0), 0);
        const totalVendasMesQtd = vendasMes.length;
        setStats({
          totalVendasValor,
          totalVendasQtd,
          totalCanceladasValor,
          totalCanceladasQtd,
          totalVendasMesValor,
          totalVendasMesQtd,
          totalOrcamentos: totalVendasQtd // agora representa vendas reais
        });
      } catch (err) {
        setError(err.message || 'Erro ao carregar estatísticas');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Função para vendas diárias (últimos 30 dias)
  function getVendasDiariasData() {
    const dias = [];
    const hoje = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() - i);
      dias.push(d);
    }
    return dias.map(dia => {
      const diaStr = dia.toISOString().slice(0, 10);
      const qtd = orcamentos.filter(o => {
        if (o.status !== 'faturado') return false;
        const dataOrcStr = o.data;
        if (!dataOrcStr) return false;
        const dataOrc = new Date(dataOrcStr);
        if (isNaN(dataOrc)) return false;
        return dataOrc.toISOString().slice(0, 10) === diaStr;
      }).length;
      return {
        dia: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        vendas: qtd
      };
    });
  }

  // Função para vendas semanais (últimas 8 semanas)
  function getVendasSemanaisData() {
    const semanas = [];
    const hoje = new Date();
    for (let i = 7 * 7; i >= 0; i -= 7) {
      const inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - i);
      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 6);
      semanas.push({ inicio, fim });
    }
    return semanas.map(({ inicio, fim }) => {
      const vendasSemana = orcamentos.filter(o => {
        if (o.status !== 'faturado') return false;
        const dataOrcStr = o.data;
        if (!dataOrcStr) return false;
        const dataOrc = new Date(dataOrcStr);
        if (isNaN(dataOrc)) return false;
        return dataOrc >= inicio && dataOrc <= fim;
      });
      return {
        semana: `${inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${fim.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
        vendas: vendasSemana.length
      };
    });
  }

  // Função para vendas mensais (últimos 12 meses)
  function getVendasMensaisData() {
    const meses = [];
    const hoje = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      meses.push(d);
    }
    return meses.map(mes => {
      const ano = mes.getFullYear();
      const mesNum = mes.getMonth();
      const vendasMes = orcamentos.filter(o => {
        if (o.status !== 'faturado') return false;
        const dataOrcStr = o.data;
        if (!dataOrcStr) return false;
        const dataOrc = new Date(dataOrcStr);
        if (isNaN(dataOrc)) return false;
        return dataOrc.getFullYear() === ano && dataOrc.getMonth() === mesNum;
      });
      return {
        mes: mes.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }),
        vendas: vendasMes.length
      };
    });
  }

  // Função para vendas semestrais (últimos 3 anos)
  function getVendasSemestraisData() {
    const semestres = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const ano = hoje.getFullYear() - Math.floor(i / 2);
      const semestre = i % 2 === 0 ? 1 : 2;
      semestres.push({ ano, semestre });
    }
    return semestres.map(({ ano, semestre }) => {
      const vendasSemestre = orcamentos.filter(o => {
        if (o.status !== 'faturado') return false;
        const dataOrcStr = o.data;
        if (!dataOrcStr) return false;
        const dataOrc = new Date(dataOrcStr);
        if (isNaN(dataOrc)) return false;
        return dataOrc.getFullYear() === ano && ((semestre === 1 && dataOrc.getMonth() < 6) || (semestre === 2 && dataOrc.getMonth() >= 6));
      });
      return {
        semestre: `${semestre}º/${ano}`,
        vendas: vendasSemestre.length
      };
    });
  }

  // Ranking de vendedores (geral)
  function getRankingVendedoresGeral() {
    const ranking = {};
    orcamentos.forEach(o => {
      if (o.status !== 'faturado') return;
      const nome = o.vendedores?.nome || 'Desconhecido';
      ranking[nome] = (ranking[nome] || 0) + 1;
    });
    return Object.entries(ranking).map(([nome, vendas]) => ({ nome, vendas })).sort((a, b) => b.vendas - a.vendas);
  }

  // Ranking de vendedores (mês)
  function getRankingVendedoresMes() {
    const ranking = {};
    const now = new Date();
    orcamentos.forEach(o => {
      if (o.status !== 'faturado') return;
      const dataOrcStr = o.data;
      if (!dataOrcStr) return;
      const dataOrc = new Date(dataOrcStr);
      if (isNaN(dataOrc)) return;
      if (dataOrc.getMonth() !== now.getMonth() || dataOrc.getFullYear() !== now.getFullYear()) return;
      const nome = o.vendedores?.nome || 'Desconhecido';
      ranking[nome] = (ranking[nome] || 0) + 1;
    });
    return Object.entries(ranking).map(([nome, vendas]) => ({ nome, vendas })).sort((a, b) => b.vendas - a.vendas);
  }

  // Comparativo diário: orçamentos x vendas (30 dias)
  function getComparativoOrcamentosVendas() {
    const dias = [];
    const hoje = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() - i);
      dias.push(d);
    }
    return dias.map(dia => {
      const diaStr = dia.toISOString().slice(0, 10);
      const qtdOrc = orcamentos.filter(o => {
        const dataOrcStr = o.data;
        if (!dataOrcStr) return false;
        const dataOrc = new Date(dataOrcStr);
        if (isNaN(dataOrc)) return false;
        return dataOrc.toISOString().slice(0, 10) === diaStr;
      }).length;
      const qtdVendas = orcamentos.filter(o => {
        if (o.status !== 'faturado') return false;
        const dataOrcStr = o.data;
        if (!dataOrcStr) return false;
        const dataOrc = new Date(dataOrcStr);
        if (isNaN(dataOrc)) return false;
        return dataOrc.toISOString().slice(0, 10) === diaStr;
      }).length;
      return {
        dia: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        orcamentos: qtdOrc,
        vendas: qtdVendas
      };
    });
  }

  // Função auxiliar para relatório dos últimos 7 dias
  function getVendasUltimos7Dias() {
    if (!stats) return [];
    // Filtrar apenas vendas faturadas dos últimos 7 dias
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 6);
    // Agrupar vendas por data real
    const vendasFaturadas = vendasData.filter(v => v.status !== 'cancelada');
    const vendasNoPeriodo = vendasFaturadas.filter(v => {
      const dataVenda = v.data_faturada || v.created_at || v.data;
      if (!dataVenda) return false;
      let data = null;
      if (dataVenda.includes('-') && dataVenda.includes(' ')) {
        // formato '2025-07-16 04:02:27.248518+00'
        const [dataPart] = dataVenda.split(' ');
        const [ano, mes, dia] = dataPart.split('-');
        data = new Date(Number(ano), Number(mes) - 1, Number(dia));
      } else {
        // fallback para outros formatos aceitos pelo JS
        data = new Date(dataVenda);
      }
      if (!(data instanceof Date) || isNaN(data)) return false;
      const dataLocal = new Date(data.getFullYear(), data.getMonth(), data.getDate());
      return dataLocal >= new Date(seteDiasAtras.getFullYear(), seteDiasAtras.getMonth(), seteDiasAtras.getDate()) &&
             dataLocal <= new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    });
    // Agrupar por data (yyyy-mm-dd)
    const agrupado = {};
    vendasNoPeriodo.forEach(v => {
      const dataVenda = v.data_faturada || v.created_at || v.data;
      let data = null;
      if (dataVenda && dataVenda.includes('-') && dataVenda.includes(' ')) {
        const [dataPart] = dataVenda.split(' ');
        const [ano, mes, dia] = dataPart.split('-');
        data = new Date(Number(ano), Number(mes) - 1, Number(dia));
      } else if (dataVenda) {
        data = new Date(dataVenda);
      }
      if (!(data instanceof Date) || isNaN(data)) return;
      const chave = data.toISOString().slice(0, 10);
      if (!agrupado[chave]) agrupado[chave] = { valor: 0, qtd: 0, data: data };
      agrupado[chave].valor += Number(v.valor_total) || 0;
      agrupado[chave].qtd += 1;
    });
    // Gerar array ordenado decrescente por data
    return Object.entries(agrupado)
      .map(([chave, obj]) => ({
        data: obj.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valor: obj.valor,
        qtd: obj.qtd
      }))
      .sort((a, b) => b.data.localeCompare(a.data, 'pt-BR', { numeric: true }));
  }

  // Função auxiliar para relatório do mês atual
  function getVendasMesAtual() {
    if (!stats) return [];
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    // Filtrar apenas vendas faturadas do mês atual
    const vendasFaturadas = vendasData.filter(v => v.status !== 'cancelada');
    const vendasNoMes = vendasFaturadas.filter(v => {
      const dataVenda = v.data_faturada || v.created_at || v.data;
      if (!dataVenda) return false;
      let data = null;
      if (dataVenda.includes('-') && dataVenda.includes(' ')) {
        const [dataPart] = dataVenda.split(' ');
        const [ano, mes, dia] = dataPart.split('-');
        data = new Date(Number(ano), Number(mes) - 1, Number(dia));
      } else {
        data = new Date(dataVenda);
      }
      if (!(data instanceof Date) || isNaN(data)) return false;
      return data.getFullYear() === anoAtual && data.getMonth() === mesAtual;
    });
    // Agrupar por dia do mês
    const agrupado = {};
    vendasNoMes.forEach(v => {
      const dataVenda = v.data_faturada || v.created_at || v.data;
      let data = null;
      if (dataVenda && dataVenda.includes('-') && dataVenda.includes(' ')) {
        const [dataPart] = dataVenda.split(' ');
        const [ano, mes, dia] = dataPart.split('-');
        data = new Date(Number(ano), Number(mes) - 1, Number(dia));
      } else if (dataVenda) {
        data = new Date(dataVenda);
      }
      if (!(data instanceof Date) || isNaN(data)) return;
      const chave = data.toISOString().slice(0, 10);
      if (!agrupado[chave]) agrupado[chave] = { valor: 0, qtd: 0, data: data };
      agrupado[chave].valor += Number(v.valor_total) || 0;
      agrupado[chave].qtd += 1;
    });
    // Gerar array ordenado decrescente por data
    return Object.entries(agrupado)
      .map(([chave, obj]) => ({
        data: obj.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valor: obj.valor,
        qtd: obj.qtd
      }))
      .sort((a, b) => b.data.localeCompare(a.data, 'pt-BR', { numeric: true }));
  }

  // Função auxiliar para nome do mês atual
  function getNomeMesAtual() {
    const hoje = new Date();
    return hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }
  // Função auxiliar para total do mês atual
  function getTotalMesAtual() {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    const vendasFaturadas = vendasData.filter(v => v.status !== 'cancelada');
    let valor = 0;
    let qtd = 0;
    vendasFaturadas.forEach(v => {
      const dataVenda = v.data_faturada || v.created_at || v.data;
      let data = null;
      if (dataVenda && dataVenda.includes('-') && dataVenda.includes(' ')) {
        const [dataPart] = dataVenda.split(' ');
        const [ano, mes, dia] = dataPart.split('-');
        data = new Date(Number(ano), Number(mes) - 1, Number(dia));
      } else if (dataVenda) {
        data = new Date(dataVenda);
      }
      if (!(data instanceof Date) || isNaN(data)) return;
      if (data.getFullYear() === anoAtual && data.getMonth() === mesAtual) {
        valor += Number(v.valor_total) || 0;
        qtd += 1;
      }
    });
    return { valor, qtd };
  }

  // Função auxiliar para relatório do mês atual por vendedor
  function getVendasMesPorVendedor() {
    if (!stats) return [];
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    const vendasFaturadas = vendasData.filter(v => v.status !== 'cancelada');
    // Filtrar vendas do mês
    const vendasNoMes = vendasFaturadas.filter(v => {
      const dataVenda = v.data_faturada || v.created_at || v.data;
      if (!dataVenda) return false;
      let data = null;
      if (dataVenda.includes('-') && dataVenda.includes(' ')) {
        const [dataPart] = dataVenda.split(' ');
        const [ano, mes, dia] = dataPart.split('-');
        data = new Date(Number(ano), Number(mes) - 1, Number(dia));
      } else {
        data = new Date(dataVenda);
      }
      if (!(data instanceof Date) || isNaN(data)) return false;
      return data.getFullYear() === anoAtual && data.getMonth() === mesAtual;
    });
    // Agrupar por vendedor
    const agrupado = {};
    vendasNoMes.forEach(v => {
      let nomeVendedor = '-';
      if (v.vendedor_nome) {
        nomeVendedor = v.vendedor_nome;
      } else if (v.orcamentos && v.orcamentos.vendedores && v.orcamentos.vendedores.nome) {
        nomeVendedor = v.orcamentos.vendedores.nome;
      } else if (v.orcamentos && v.orcamentos.vendedor_nome) {
        nomeVendedor = v.orcamentos.vendedor_nome;
      } else if (v.vendedor_id) {
        const vendedorObj = vendedores.find(vend => String(vend.id) === String(v.vendedor_id));
        nomeVendedor = vendedorObj ? vendedorObj.nome : '-';
      } else if (v.vendedorFK) {
        const vendedorObj = vendedores.find(vend => String(vend.id) === String(v.vendedorFK));
        nomeVendedor = vendedorObj ? vendedorObj.nome : '-';
      }
      if (!agrupado[nomeVendedor]) agrupado[nomeVendedor] = { valor: 0, qtd: 0 };
      agrupado[nomeVendedor].valor += Number(v.valor_total) || 0;
      agrupado[nomeVendedor].qtd += 1;
    });
    // Gerar array ordenado decrescente por valor
    return Object.entries(agrupado)
      .map(([vendedor, obj]) => ({ vendedor, valor: obj.valor, qtd: obj.qtd }))
      .sort((a, b) => b.valor - a.valor);
  }

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', marginBottom: 24 }}>Dashboard de Vendas</h1>
      {loading ? (
        <div style={{ color: '#888', fontSize: 18, textAlign: 'center', margin: 40 }}>Carregando dados...</div>
      ) : error ? (
        <div style={{ color: '#ef4444', fontSize: 18, textAlign: 'center', margin: 40 }}>{error}</div>
      ) : (
      <>
      {/* Cards de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 15, color: '#64748b', marginBottom: 6 }}>Total de Vendas (Faturadas)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{stats?.totalVendasValor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}</div>
          <div style={{ fontSize: 13, color: '#888' }}>Quantidade: {stats?.totalVendasQtd || 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 15, color: '#64748b', marginBottom: 6 }}>Vendas Canceladas</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{stats?.totalCanceladasValor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}</div>
          <div style={{ fontSize: 13, color: '#888' }}>Quantidade: {stats?.totalCanceladasQtd || 0}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 15, color: '#64748b', marginBottom: 6 }}>Total de Orçamentos Faturados</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{stats?.totalVendasQtd || 0}</div>
          <div style={{ fontSize: 13, color: '#888' }}>No período</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 15, color: '#64748b', marginBottom: 6 }}>Vendas no Mês (Faturadas) - {getNomeMesAtual()}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{stats?.totalVendasMesValor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}</div>
          <div style={{ fontSize: 13, color: '#888' }}>Quantidade: {stats?.totalVendasMesQtd || 0}</div>
        </div>
      </div>
      {/* Tabela de Relatório de Vendas dos Últimos 7 Dias */}
      {stats && (
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Relatório de Vendas - Últimos 7 Dias</h3>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#f6fff8' }}>
                  <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Data</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Valor Total</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {getVendasUltimos7Dias().map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: 8 }}>{row.data}</td>
                    <td style={{ padding: 8, textAlign: 'right', color: row.valor > 0 ? '#218838' : '#888', fontWeight: row.valor > 0 ? 600 : 400 }}>{row.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{row.qtd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Tabela de Relatório de Vendas do Mês Atual */}
      {stats && (
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Relatório de Vendas - Mês Atual ({getNomeMesAtual()})
          </h3>
          <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 500 }}>
            Total do mês: <span style={{ color: '#218838', fontWeight: 700 }}>{getTotalMesAtual().valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            {' '}| Quantidade: <span style={{ color: '#218838', fontWeight: 700 }}>{getTotalMesAtual().qtd}</span>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#f6fff8' }}>
                  <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Data</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Valor Total</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {getVendasMesAtual().map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: 8 }}>{row.data}</td>
                    <td style={{ padding: 8, textAlign: 'right', color: row.valor > 0 ? '#218838' : '#888', fontWeight: row.valor > 0 ? 600 : 400 }}>{row.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{row.qtd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Tabela de Relatório de Vendas do Mês Atual por Vendedor */}
      {stats && (
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Relatório de Vendas do Mês por Vendedor ({getNomeMesAtual()})
          </h3>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#f6fff8' }}>
                  <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Vendedor</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Valor Total</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {getVendasMesPorVendedor().map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: 8 }}>{row.vendedor}</td>
                    <td style={{ padding: 8, textAlign: 'right', color: row.valor > 0 ? '#218838' : '#888', fontWeight: row.valor > 0 ? 600 : 400 }}>{row.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{row.qtd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Tabela de Relatório de Vendas do Ano Atual por Vendedor */}
      {stats && (
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Relatório de Vendas do Ano Atual por Vendedor ({new Date().getFullYear()})
          </h3>
          <RelatorioAnualVendasPorVendedor vendasData={vendasData} vendedores={vendedores} />
        </div>
      )}
      {/* Relatório de Vendas Canceladas do Mês Atual por Dia */}
      {stats && (
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Vendas Canceladas do Mês Atual (por Dia)
          </h3>
          <RelatorioCanceladasMesAtual vendasData={vendasData} />
        </div>
      )}
      {/* Relatório Comparativo Diário: Orçamentos x Vendas (30 dias) */}
      {stats && (
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Comparativo Diário: Orçamentos x Vendas (últimos 30 dias)
          </h3>
          <RelatorioComparativoOrcamentosVendas orcamentos={orcamentos} vendasData={vendasData} />
        </div>
      )}
      {/* Todas as tabelas de relatórios removidas conforme solicitado */}
      </>
      )}
    </div>
  );
}

function RelatorioAnualVendasPorVendedor({ vendasData, vendedores }) {
  // Pega o ano atual
  const anoAtual = new Date().getFullYear();
  // Filtra vendas faturadas do ano
  const vendasAno = (vendasData || []).filter(v => {
    if (v.status === 'cancelada') return false;
    const dataVenda = v.data_faturada || v.created_at || v.data;
    if (!dataVenda) return false;
    let data = null;
    if (dataVenda.includes('-') && dataVenda.includes(' ')) {
      const [dataPart] = dataVenda.split(' ');
      const [ano, mes, dia] = dataPart.split('-');
      data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    } else {
      data = new Date(dataVenda);
    }
    if (!(data instanceof Date) || isNaN(data)) return false;
    return data.getFullYear() === anoAtual;
  });
  // Descobre todos os vendedores que tiveram vendas no ano
  const vendedoresNoAno = Array.from(new Set(
    vendasAno.map(v => {
      if (v.vendedor_nome) return v.vendedor_nome;
      if (v.orcamentos && v.orcamentos.vendedores && v.orcamentos.vendedores.nome) return v.orcamentos.vendedores.nome;
      if (v.orcamentos && v.orcamentos.vendedor_nome) return v.orcamentos.vendedor_nome;
      if (v.vendedor_id) {
        const vendedorObj = vendedores.find(vend => String(vend.id) === String(v.vendedor_id));
        return vendedorObj ? vendedorObj.nome : '-';
      }
      if (v.vendedorFK) {
        const vendedorObj = vendedores.find(vend => String(vend.id) === String(v.vendedorFK));
        return vendedorObj ? vendedorObj.nome : '-';
      }
      return '-';
    })
  ));
  // Gera matriz mês x vendedor
  const meses = Array.from({ length: 12 }, (_, i) => new Date(anoAtual, i, 1));
  const matriz = meses.map((mes, idx) => {
    const mesNum = mes.getMonth();
    const linha = { mes: mes.toLocaleDateString('pt-BR', { month: 'long' }), total: 0 };
    vendedoresNoAno.forEach(vendedor => {
      linha[vendedor] = 0;
    });
    vendasAno.forEach(v => {
      const dataVenda = v.data_faturada || v.created_at || v.data;
      let data = null;
      if (dataVenda && dataVenda.includes('-') && dataVenda.includes(' ')) {
        const [dataPart] = dataVenda.split(' ');
        const [ano, mes, dia] = dataPart.split('-');
        data = new Date(Number(ano), Number(mes) - 1, Number(dia));
      } else if (dataVenda) {
        data = new Date(dataVenda);
      }
      if (!(data instanceof Date) || isNaN(data)) return;
      if (data.getMonth() !== mesNum) return;
      let nomeVendedor = '-';
      if (v.vendedor_nome) {
        nomeVendedor = v.vendedor_nome;
      } else if (v.orcamentos && v.orcamentos.vendedores && v.orcamentos.vendedores.nome) {
        nomeVendedor = v.orcamentos.vendedores.nome;
      } else if (v.orcamentos && v.orcamentos.vendedor_nome) {
        nomeVendedor = v.orcamentos.vendedor_nome;
      } else if (v.vendedor_id) {
        const vendedorObj = vendedores.find(vend => String(vend.id) === String(v.vendedor_id));
        nomeVendedor = vendedorObj ? vendedorObj.nome : '-';
      } else if (v.vendedorFK) {
        const vendedorObj = vendedores.find(vend => String(vend.id) === String(v.vendedorFK));
        nomeVendedor = vendedorObj ? vendedorObj.nome : '-';
      }
      if (linha[nomeVendedor] !== undefined) {
        linha[nomeVendedor] += Number(v.valor_total) || 0;
        linha.total += Number(v.valor_total) || 0;
      }
    });
    return linha;
  });
  // Total acumulado do ano
  const totalAno = matriz.reduce((acc, linha) => acc + linha.total, 0);
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 600 }}>
        <thead>
          <tr style={{ background: '#f6fff8' }}>
            <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Mês</th>
            {vendedoresNoAno.map((v, idx) => (
              <th key={idx} style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{v}</th>
            ))}
            <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Total do Mês</th>
          </tr>
        </thead>
        <tbody>
          {matriz.map((linha, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: 8 }}>{linha.mes.charAt(0).toUpperCase() + linha.mes.slice(1)}</td>
              {vendedoresNoAno.map((v, i) => (
                <td key={i} style={{ padding: 8, textAlign: 'right', color: linha[v] > 0 ? '#218838' : '#888', fontWeight: linha[v] > 0 ? 600 : 400 }}>{linha[v].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              ))}
              <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>{linha.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: '#f6fff8', fontWeight: 700 }}>
            <td style={{ padding: 8 }}>Total do Ano</td>
            {vendedoresNoAno.map((v, idx) => {
              const totalVendedor = matriz.reduce((acc, linha) => acc + linha[v], 0);
              return <td key={idx} style={{ padding: 8, textAlign: 'right' }}>{totalVendedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>;
            })}
            <td style={{ padding: 8, textAlign: 'right', color: '#218838' }}>{totalAno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function RelatorioCanceladasMesAtual({ vendasData }) {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();
  // Filtra vendas canceladas do mês atual
  const vendasCanceladas = (vendasData || []).filter(v => {
    if (v.status !== 'cancelada') return false;
    const dataVenda = v.data_faturada || v.created_at || v.data;
    if (!dataVenda) return false;
    let data = null;
    if (dataVenda.includes('-') && dataVenda.includes(' ')) {
      const [dataPart] = dataVenda.split(' ');
      const [ano, mes, dia] = dataPart.split('-');
      data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    } else {
      data = new Date(dataVenda);
    }
    if (!(data instanceof Date) || isNaN(data)) return false;
    return data.getFullYear() === anoAtual && data.getMonth() === mesAtual;
  });
  // Agrupa por dia
  const agrupado = {};
  vendasCanceladas.forEach(v => {
    const dataVenda = v.data_faturada || v.created_at || v.data;
    let data = null;
    if (dataVenda && dataVenda.includes('-') && dataVenda.includes(' ')) {
      const [dataPart] = dataVenda.split(' ');
      const [ano, mes, dia] = dataPart.split('-');
      data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    } else if (dataVenda) {
      data = new Date(dataVenda);
    }
    if (!(data instanceof Date) || isNaN(data)) return;
    const chave = data.toISOString().slice(0, 10);
    if (!agrupado[chave]) agrupado[chave] = { valor: 0, qtd: 0, data: data, vendas: [] };
    agrupado[chave].valor += Number(v.valor_total) || 0;
    agrupado[chave].qtd += 1;
    agrupado[chave].vendas.push(Number(v.valor_total) || 0);
  });
  // Gera array ordenado por data crescente
  const linhas = Object.entries(agrupado)
    .map(([chave, obj]) => ({
      data: obj.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      valor: obj.valor,
      qtd: obj.qtd,
      vendas: obj.vendas
    }))
    .sort((a, b) => a.data.localeCompare(b.data, 'pt-BR', { numeric: true }));
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 400 }}>
        <thead>
          <tr style={{ background: '#f6fff8' }}>
            <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Data</th>
            <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Valor Total</th>
            <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Quantidade</th>
            <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Valores Individuais</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: 8 }}>{row.data}</td>
              <td style={{ padding: 8, textAlign: 'right', color: row.valor > 0 ? '#ef4444' : '#888', fontWeight: row.valor > 0 ? 600 : 400 }}>{row.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>{row.qtd}</td>
              <td style={{ padding: 8 }}>
                {row.vendas.map((v, i) => (
                  <span key={i} style={{ display: 'inline-block', marginRight: 8, color: '#ef4444', fontWeight: 500 }}>{v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatorioComparativoOrcamentosVendas({ orcamentos, vendasData }) {
  // Gera lista dos últimos 30 dias
  const dias = [];
  const hoje = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    dias.push(d);
  }
  // Para cada dia, conta orçamentos e vendas
  const linhas = dias.map(dia => {
    const diaStr = dia.toISOString().slice(0, 10);
    // Orçamentos criados nesse dia (independente do status)
    const qtdOrc = (orcamentos || []).filter(o => {
      const dataOrcStr = o.data;
      if (!dataOrcStr) return false;
      const dataOrc = new Date(dataOrcStr);
      if (isNaN(dataOrc)) return false;
      return dataOrc.toISOString().slice(0, 10) === diaStr;
    }).length;
    // Vendas faturadas nesse dia
    const qtdVendas = (vendasData || []).filter(v => {
      if (v.status === 'cancelada') return false;
      const dataVenda = v.data_faturada || v.created_at || v.data;
      if (!dataVenda) return false;
      let data = null;
      if (dataVenda.includes('-') && dataVenda.includes(' ')) {
        const [dataPart] = dataVenda.split(' ');
        const [ano, mes, dia] = dataPart.split('-');
        data = new Date(Number(ano), Number(mes) - 1, Number(dia));
      } else {
        data = new Date(dataVenda);
      }
      if (!(data instanceof Date) || isNaN(data)) return false;
      return data.toISOString().slice(0, 10) === diaStr;
    }).length;
    return {
      data: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      orcamentos: qtdOrc,
      vendas: qtdVendas
    };
  });
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 400 }}>
        <thead>
          <tr style={{ background: '#f6fff8' }}>
            <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Data</th>
            <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Orçamentos</th>
            <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Vendas</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: 8 }}>{row.data}</td>
              <td style={{ padding: 8, textAlign: 'right', color: row.orcamentos > 0 ? '#218838' : '#888', fontWeight: row.orcamentos > 0 ? 600 : 400 }}>{row.orcamentos}</td>
              <td style={{ padding: 8, textAlign: 'right', color: row.vendas > 0 ? '#10b981' : '#888', fontWeight: row.vendas > 0 ? 600 : 400 }}>{row.vendas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 