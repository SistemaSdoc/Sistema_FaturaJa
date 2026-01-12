'use client';

import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import MainEmpresa from "../../components/MainEmpresa";
import Modal from "@/app/components/Modal";
import ProdutoForm from "@/app/components/ProdutoForm";
import FaturaForm from "@/app/components/FaturaForm";

import { useAuth } from "../../context/AuthProvider";
import api, {
  fetchTenantKpis,
  fetchTenantMe,
  Tenant,
  TenantKpis
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

interface VendaCategoria {
  categoria: string;
  vendas: number;
}

/* ================= COMPONENT ================= */

export default function DashboardEmpresa() {
  const { tenant } = useAuth();

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

  const pieColors = ["#4ade80", "#f87171", "#60a5fa", "#facc15"];

  /* ================= FILTRO FATURAS ================= */
  const filteredFaturas = faturas.filter(f =>
    f.numero.toLowerCase().includes(search.toLowerCase()) ||
    f.cliente?.nome?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= FETCH DASHBOARD ================= */
  const fetchDashboardData = async () => {
    if (!tenant) return;

    setLoading(true);
    try {
      const [
        empresaRes,
        kpisRes,
        faturasRes,
        pagamentosRes,
        produtosRes,
        vendasCatRes
      ] = await Promise.all([
        fetchTenantMe(),
        fetchTenantKpis(),
        getFaturasAll(),
        getPagamentosAll(),
        getProdutosAll(),
        api.get<{ data: VendaCategoria[] }>("/empresa/vendas-categorias")
      ]);

      setEmpresa(empresaRes);
      setKpis(kpisRes);

      setFaturas(Array.isArray(faturasRes) ? faturasRes : []);
      setPagamentos(Array.isArray(pagamentosRes) ? pagamentosRes : []);
      setProdutos(Array.isArray(produtosRes) ? produtosRes : []);

      setVendasCategorias(Array.isArray(vendasCatRes.data?.data)
        ? vendasCatRes.data.data
        : []
      );

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setFaturas([]);
      setPagamentos([]);
      setProdutos([]);
      setVendasCategorias([]);
      setKpis(null);
      setEmpresa(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tenant]);

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

      {loading && <p>Carregando dados...</p>}

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

          {/* Pagamentos */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold mb-2">Pagamentos</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pagamentos.map(p => ({
                    status: p.fatura?.status ?? "pendente",
                    valor: Number(p.valor_pago) || 0
                  }))}
                  dataKey="valor"
                  nameKey="status"
                  outerRadius={70}
                  label
                >
                  {pagamentos.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Faturas */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Faturas Recentes</h2>

            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Número</th>
                  <th className="p-2">Cliente</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaturas.map(f => (
                  <tr key={f.id} className="border-t">
                    <td className="p-2">{f.numero}</td>
                    <td className="p-2">{f.cliente?.nome}</td>
                    <td className="p-2">€ {f.valor_total}</td>
                    <td className="p-2">{f.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

/* ================= KPI COMPONENT ================= */
function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-[#123859]">{value}</p>
    </div>
  );
}
