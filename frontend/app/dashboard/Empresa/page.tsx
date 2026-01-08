'use client';

import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import MainEmpresa from "../../components/MainEmpresa";
import { useAuth } from "../../context/AuthProvider";
import { fetchTenantKpis, fetchTenantMe, Tenant, TenantKpis } from "@/app/services/axios";
import { getFaturasAll, Fatura, createFatura } from "@/app/services/faturas";
import { getPagamentosAll, Pagamento } from "@/app/services/pagamentos";
import { getProdutosAll, Produto, createProduto, updateProduto, deleteProduto } from "@/app/services/produtos";
import Modal from "@/app/components/Modal";
import ProdutoForm from "@/app/components/ProdutoForm";
import FaturaForm from "@/app/components/FaturaForm";

// Novo tipo para criar fatura
export interface FaturaCreate {
  cliente_id: string;
  nome_cliente: string;
  nif_cliente: string;
  numero: string;
  produtos: { id: string; quantidade: number }[];
  valor_total: number;
  data_emissao: string;
  data_vencimento: string;
  status: "pendente" | "pago" | "cancelado";
  tipo: "fatura" | "proforma" | "recibo";
}

export default function DashboardEmpresa() {
  const { tenant } = useAuth();

  const [empresa, setEmpresa] = useState<Tenant | null>(null);
  const [kpis, setKpis] = useState<TenantKpis | null>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendasCategorias, setVendasCategorias] = useState<{categoria: string, vendas: number}[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showFaturaModal, setShowFaturaModal] = useState(false);

  const pieColors = ["#4ade80", "#f87171"];

  // Filtrar faturas
  const filteredFaturas = faturas.filter(
    f => f.numero.toLowerCase().includes(search.toLowerCase()) ||
         f.nome_cliente.toLowerCase().includes(search.toLowerCase())
  );

  // ==================== FETCH DATA ====================
  const fetchDashboardData = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      setEmpresa(await fetchTenantMe());
      setKpis(await fetchTenantKpis());
      setFaturas(await getFaturasAll());
      setPagamentos(await getPagamentosAll());
      setProdutos(await getProdutosAll());

      const res = await fetch("/empresa/vendas-categorias");
      const { data }: { data: { categoria: string; vendas: number }[] } = await res.json();
      setVendasCategorias(data);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tenant]);

  // ==================== PRODUTOS ====================
  const handleAddProduto = async (produto: Omit<Produto, "id" | "tenant_id" | "created_at" | "updated_at">) => {
    const novoProduto = await createProduto(produto);
    setProdutos([...produtos, novoProduto]);
    setShowProdutoModal(false);
  };

  const handleUpdateProduto = async (id: string, produto: Partial<Produto>) => {
    const atualizado = await updateProduto(id, produto);
    setProdutos(produtos.map(p => p.id === id ? atualizado : p));
  };

  const handleDeleteProduto = async (id: string) => {
    await deleteProduto(id);
    setProdutos(produtos.filter(p => p.id !== id));
  };

  // ==================== FATURAS ====================
  const handleAddFatura = async (faturaData: FaturaCreate) => {
    const novaFatura = await createFatura(faturaData);
    setFaturas([...faturas, novaFatura]);
    setShowFaturaModal(false);
  };

  // ==================== RENDER ====================
  return (
    <MainEmpresa empresa={empresa}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#123859]">Dashboard da Empresa</h1>
        <input
          type="text"
          placeholder="Pesquisar faturas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded w-64"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setShowProdutoModal(true)} className="bg-[#4ade80] p-2 rounded text-white font-bold">Cadastrar Produto</button>
        <button onClick={() => setShowFaturaModal(true)} className="bg-[#F9941F] p-2 rounded text-white font-bold">Criar Fatura</button>
      </div>

      {loading && <p>Carregando dados...</p>}

      {!loading && kpis && (
        <>
          {/* ================= KPIs ================= */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Vendas Mensais</p>
              <p className="text-xl font-bold text-[#123859]">€ {kpis.faturamentoMensal.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Pagamentos Pendentes</p>
              <p className="text-xl font-bold text-[#123859]">{kpis.pagamentosPendentes}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Clientes Cadastrados</p>
              <p className="text-xl font-bold text-[#123859]">{kpis.totalClientes}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Novas Faturas</p>
              <p className="text-xl font-bold text-[#123859]">{kpis.novasFaturas}</p>
            </div>
          </div>

          {/* ================= Receita da Semana ================= */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold text-[#123859] mb-2">Receita da Semana</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={kpis.receitaSemana}>
                <XAxis dataKey="dia" stroke="#123859" />
                <YAxis stroke="#123859" />
                <Tooltip />
                <Line type="monotone" dataKey="receita" stroke="#F9941F" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ================= Vendas por Categoria ================= */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold text-[#123859] mb-2">Vendas por Categoria</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vendasCategorias}>
                <XAxis dataKey="categoria" stroke="#123859" />
                <YAxis stroke="#123859" />
                <Tooltip />
                <Bar dataKey="vendas" fill="#F9941F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ================= Pagamentos ================= */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold text-[#123859] mb-2">Pagamentos</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pagamentos.map(p => ({ status: p.fatura?.status ?? 'Pendente', valor: p.valor_pago }))}
                  dataKey="valor"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {pagamentos.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ================= Faturas Recentes ================= */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold text-[#123859] mb-2">Faturas Recentes</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E5E5E5] text-left">
                  <th className="p-2">Número</th>
                  <th className="p-2">Cliente</th>
                  <th className="p-2">Data</th>
                  <th className="p-2">Vencimento</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaturas.map(f => (
                  <tr key={f.id} className="border-t">
                    <td className="p-2 text-[#123859] font-medium">{f.numero}</td>
                    <td className="p-2">{f.nome_cliente}</td>
                    <td className="p-2">{f.data_emissao}</td>
                    <td className="p-2">{f.data_vencimento}</td>
                    <td className="p-2">€ {f.valor_total.toFixed(2)}</td>
                    <td className={`p-2 font-semibold ${f.status === "pago" ? "text-green-500" : "text-red-500"}`}>{f.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ================= MODAIS ================= */}
      <Modal show={showProdutoModal} onClose={() => setShowProdutoModal(false)}>
        <ProdutoForm onSubmit={handleAddProduto} />
      </Modal>

      <Modal show={showFaturaModal} onClose={() => setShowFaturaModal(false)}>
        <FaturaForm produtos={produtos} onSubmit={handleAddFatura} />
      </Modal>
    </MainEmpresa>
  );
}
