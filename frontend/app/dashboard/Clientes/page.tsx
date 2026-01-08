'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainEmpresa';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthProvider';
import { getFaturasCliente, Fatura } from '@/app/services/faturas';
import { getPagamentosAll, Pagamento } from '@/app/services/pagamentos';
import { BarChart, CreditCard, FileSearch } from 'lucide-react';


export default function DashboardCliente() {
  const { user, tenant, loading } = useAuth();
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loadingFaturas, setLoadingFaturas] = useState(true);
  const [loadingPagamentos, setLoadingPagamentos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Carregar faturas e pagamentos
  useEffect(() => {
    if (!user || loading) return;

    const fetchFaturas = async (): Promise<void> => {
      setLoadingFaturas(true);
      try {
        const data: Fatura[] = await getFaturasCliente();
        setFaturas(data);
      } catch (err) {
        console.error('Erro ao carregar faturas:', err);
        setError('Erro ao carregar faturas.');
      } finally {
        setLoadingFaturas(false);
      }
    };

    const fetchPagamentos = async (): Promise<void> => {
      setLoadingPagamentos(true);
      try {
        const data: Pagamento[] = await getPagamentosAll();
        setPagamentos(data);
      } catch (err) {
        console.error('Erro ao carregar pagamentos:', err);
        setError('Erro ao carregar pagamentos.');
      } finally {
        setLoadingPagamentos(false);
      }
    };

    fetchFaturas();
    fetchPagamentos();
  }, [user, loading]);

  if (loading) return <p className="p-4">Carregando informações do usuário...</p>;
  if (!user || !tenant) return <p className="p-4 text-red-500">Usuário ou tenant não encontrado.</p>;

  return (
    <MainLayout>
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Olá, {user.name}!</h1>
      <p>Subdomínio da empresa: {tenant}</p>

      {error && <p className="text-red-500">{error}</p>}

      {/* Faturas */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Minhas Faturas</h2>
        {loadingFaturas ? (
          <p>Carregando faturas...</p>
        ) : faturas.length === 0 ? (
          <p>Nenhuma fatura encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Número</th>
                  <th className="px-4 py-2 text-left">Data Emissão</th>
                  <th className="px-4 py-2 text-left">Vencimento</th>
                  <th className="px-4 py-2 text-left">Valor Total</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {faturas.map((fatura: Fatura) => (
                  <tr key={fatura.id} className="border-t">
                    <td className="px-4 py-2">{fatura.numero}</td>
                    <td className="px-4 py-2">{fatura.data_emissao}</td>
                    <td className="px-4 py-2">{fatura.data_vencimento}</td>
                    <td className="px-4 py-2">Kz {fatura.valor_total.toLocaleString()}</td>
                    <td className="px-4 py-2 capitalize">{fatura.status}</td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/dashboard/cliente/faturas/${fatura.id}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileSearch size={16} /> Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagamentos */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Meus Pagamentos</h2>
        {loadingPagamentos ? (
          <p>Carregando pagamentos...</p>
        ) : pagamentos.length === 0 ? (
          <p>Nenhum pagamento registrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Fatura</th>
                  <th className="px-4 py-2 text-left">Data Pagamento</th>
                  <th className="px-4 py-2 text-left">Valor Pago</th>
                  <th className="px-4 py-2 text-left">Método</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map((pagamento: Pagamento) => (
                  <tr key={pagamento.id} className="border-t">
                    <td className="px-4 py-2">{pagamento.fatura?.numero ?? 'N/A'}</td>
                    <td className="px-4 py-2">{pagamento.data_pagamento}</td>
                    <td className="px-4 py-2">Kz {pagamento.valor_pago.toLocaleString()}</td>
                    <td className="px-4 py-2 capitalize">{pagamento.metodo_pagamento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
    </MainLayout>
  );
}
