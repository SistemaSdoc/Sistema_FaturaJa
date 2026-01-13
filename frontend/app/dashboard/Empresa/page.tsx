'use client';

import React, { useEffect, useState, useCallback } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

import MainEmpresa from "../../components/MainEmpresa";
import Modal from "@/app/components/Modal";
import ProdutoForm from "@/app/components/ProdutoForm";
import FaturaForm from "@/app/components/FaturaForm";

import { useAuth } from "../../context/AuthProvider";

import {
  fetchTenantMe,
  fetchTenantKpis,
  fetchVendasCategorias,
  Tenant,
  TenantKpis,
  VendaCategoria
} from "@/app/services/axios";

import { getFaturasAll, Fatura, createFatura } from "@/app/services/faturas";
import { getPagamentosAll, PagamentoApi as Pagamento } from "@/app/services/pagamentos";
import {
  getProdutosAll,
  ProdutoApi as Produto,
  createProduto,
  updateProduto,
  deleteProduto
} from "@/app/services/produtos";

/* ================= TIPOS ================= */

interface ProdutoSelecionado {
  id: string;
  quantidade: number;
}

interface FaturaCreate {
  cliente_id: string;
  nome_cliente: string;
  produtos: ProdutoSelecionado[];
  valor_total: number;
  data_emissao: string;
  data_vencimento: string;
  nifCliente?: string;
  status: "pendente" | "pago" | "cancelado";
  tipo: "fatura" | "proforma" | "recibo";
}

/* ================= COMPONENT ================= */

export default function DashboardEmpresa() {
  const { tenant, loading: authLoading } = useAuth();

  const [empresa, setEmpresa] = useState<Tenant | null>(null);
  const [kpis, setKpis] = useState<TenantKpis | null>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendasCategorias, setVendasCategorias] = useState<VendaCategoria[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showFaturaModal, setShowFaturaModal] = useState(false);

  /* ================= FILTRO FATURAS ================= */
  const filteredFaturas = faturas.filter(f =>
    f.numero.toLowerCase().includes(search.toLowerCase()) ||
    f.cliente?.nome?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= FETCH DASHBOARD ================= */
  const fetchDashboardData = useCallback(async () => {
    if (!tenant) return;

    setLoading(true);

    try {
      // 🔐 BUSCA O TENANT PRIMEIRO
      const empresaRes = await fetchTenantMe();

      if (!empresaRes) {
        console.warn("Tenant não encontrado, dashboard não carregado");
        setEmpresa(null);
        setLoading(false);
        return;
      }

      // 📊 BUSCA DADOS DO DASHBOARD
      const [
        kpisRes,
        faturasRes,
        pagamentosRes,
        produtosRes,
        vendasCatRes
      ] = await Promise.all([
        fetchTenantKpis(),
        getFaturasAll(),
        getPagamentosAll(),
        getProdutosAll(),
        fetchVendasCategorias()
      ]);

      setEmpresa(empresaRes);
      setKpis(kpisRes);
      setFaturas(faturasRes);
      setPagamentos(pagamentosRes);
      setProdutos(produtosRes);
      setVendasCategorias(vendasCatRes);

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setEmpresa(null);
      setKpis(null);
      setFaturas([]);
      setPagamentos([]);
      setProdutos([]);
      setVendasCategorias([]);
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  /* ================= INIT ================= */
  useEffect(() => {
    if (!authLoading && tenant) {
      fetchDashboardData();
    }
  }, [authLoading, tenant, fetchDashboardData]);

  /* ================= PRODUTOS ================= */
  const handleAddProduto = async (
    produto: Omit<Produto, "id" | "tenant_id" | "created_at" | "updated_at">
  ) => {
    const novo = await createProduto(produto);
    setProdutos(prev => [...prev, novo]);
    setShowProdutoModal(false);
  };

  const handleUpdateProduto = async (id: string, data: Partial<Produto>) => {
    const atualizado = await updateProduto(id, data);
    setProdutos(prev => prev.map(p => (p.id === id ? atualizado : p)));
  };

  const handleDeleteProduto = async (id: string) => {
    await deleteProduto(id);
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  /* ================= FATURAS ================= */
  const handleAddFatura = async (data: FaturaCreate) => {
    const nova = await createFatura(data);
    setFaturas(prev => [nova, ...prev]);
    setShowFaturaModal(false);
  };

  /* ================= RENDER ================= */
  if (authLoading) return <p>Carregando autenticação...</p>;

  return (
    <MainEmpresa empresa={empresa}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#123859]">
          Dashboard da Empresa
        </h1>

        <input
          type="text"
          placeholder="Pesquisar faturas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded w-64"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowProdutoModal(true)}
          className="bg-green-500 px-4 py-2 rounded text-white font-bold"
        >
          Cadastrar Produto
        </button>

        <button
          onClick={() => setShowFaturaModal(true)}
          className="bg-orange-500 px-4 py-2 rounded text-white font-bold"
        >
          Criar Fatura
        </button>
      </div>

      {(loading || authLoading) && <p>Carregando dados...</p>}

      {!loading && kpis && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Kpi label="Total de Faturas" value={kpis.totalFaturas} />
            <Kpi label="Total Recebido" value={`€ ${kpis.totalPagamentos}`} />
            <Kpi label="Dias com Receita" value={kpis.receitaSemana.length} />
          </div>

          {/* Receita semanal */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold mb-2">Receita da Última Semana</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={kpis.receitaSemana}>
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="receita" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Vendas por Categoria */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold mb-2">Vendas por Categoria</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vendasCategorias}>
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vendas" fill="#F9941F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* MODAIS */}
      <Modal show={showProdutoModal} onClose={() => setShowProdutoModal(false)}>
        <ProdutoForm onSubmit={handleAddProduto} />
      </Modal>

      <Modal show={showFaturaModal} onClose={() => setShowFaturaModal(false)}>
        <FaturaForm produtos={produtos} onSubmit={handleAddFatura} />
      </Modal>
    </MainEmpresa>
  );
}

/* ================= KPI ================= */
function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-[#123859]">{value}</p>
    </div>
  );
}
