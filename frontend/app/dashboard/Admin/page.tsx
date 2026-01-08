'use client';

import React, { useEffect, useState } from 'react';
import MainEmpresa from '@/app/components/MainEmpresa';
import api from '@/app/services/axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

interface ReceitaSemana {
  dia: string;
  receita: number;
}

interface KPI {
  totalEmpresas: number;
  totalUsuarios: number;
  ativos: number;
  inativos: number;
  receitaSemana: ReceitaSemana[];
}

interface Empresa {
  id: string;
  name: string;
  subdomain: string;
  email?: string;
  telefone?: string;
  logo?: string;
  status: 'Ativo' | 'Inativo';
}

export default function EmpresaDashboard() {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ✅ Filtra empresas por nome ou subdomínio
  const filteredEmpresas = empresas.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.subdomain.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Buscar KPIs e Empresas do backend
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // KPIs da empresa
      const { data: kpiData } = await api.get<KPI>('/empresa/kpis');
      setKpis(kpiData);

      // Lista de empresas (ou clientes) relacionados à empresa logada
      const { data: empresasData } = await api.get<Empresa[]>('/empresa/lista');
      setEmpresas(empresasData);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <MainEmpresa>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#123859]">Dashboard Empresa</h1>
        <input
          type="text"
          placeholder="Pesquisar empresas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded w-64"
        />
      </div>

      {loading && <p>Carregando dados...</p>}

      {!loading && kpis && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow flex flex-col items-center">
              <p className="text-gray-500">Total de Empresas</p>
              <p className="text-xl font-bold text-[#123859]">{kpis.totalEmpresas}</p>
            </div>
            <div className="bg-white p-4 rounded shadow flex flex-col items-center">
              <p className="text-gray-500">Total de Usuários</p>
              <p className="text-xl font-bold text-[#123859]">{kpis.totalUsuarios}</p>
            </div>
            <div className="bg-white p-4 rounded shadow flex flex-col items-center">
              <p className="text-gray-500">Ativos</p>
              <p className="text-xl font-bold text-green-500">{kpis.ativos}</p>
            </div>
            <div className="bg-white p-4 rounded shadow flex flex-col items-center">
              <p className="text-gray-500">Inativos</p>
              <p className="text-xl font-bold text-red-500">{kpis.inativos}</p>
            </div>
          </div>

          {/* Receita da Semana */}
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

          {/* Empresas / Clientes */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold text-[#123859] mb-2">Empresas / Clientes</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E5E5E5] text-left">
                  <th className="p-2">Nome</th>
                  <th className="p-2">Subdomínio</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Telefone</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmpresas.map(e => (
                  <tr key={e.id} className="border-t hover:bg-gray-50">
                    <td className="p-2 text-[#123859] font-medium">{e.name}</td>
                    <td className="p-2">{e.subdomain}</td>
                    <td className="p-2">{e.email || '-'}</td>
                    <td className="p-2">{e.telefone || '-'}</td>
                    <td className={`p-2 font-semibold ${e.status === 'Ativo' ? 'text-green-500' : 'text-red-500'}`}>
                      {e.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </MainEmpresa>
  );
}
