'use client';
import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainEmpresa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';

interface Fatura {
  id: string;
  numero: string;
  valor_total: number;
}

interface Pagamento {
  id: string;
  fatura_id: string;
  data_pagamento: string; // yyyy-mm-dd
  valor_pago: number;
  valor_troco?: number;
  valor_total_desconto?: number;
  status: 'pendente' | 'pago' | 'cancelado';
  metodo_pagamento: 'boleto' | 'cartão' | 'pix';
  fatura?: Fatura;
}

export default function PagamentosPage() {
  const router = useRouter();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const initialMock: Pagamento[] = [
    { id: 1, fatura_id: '1001', data_pagamento: '2025-11-20', valor_pago: 150, status: 'pendente', metodo_pagamento: 'pix', fatura: { id: '1001', numero: 'FAT-2025-001', valor_total: 200 } },
    { id: 2, fatura_id: '1002', data_pagamento: '2025-11-18', valor_pago: 320.5, status: 'pago', metodo_pagamento: 'cartão', fatura: { id: '1002', numero: 'FAT-2025-002', valor_total: 320.5 } },
  ];

  const fetchPagamentos = async () => {
    setLoading(true);
    setError('');
    try {
      if (!token) {
        setPagamentos(initialMock);
        return;
      }
      const res = await fetch('/api/pagamentos', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao buscar pagamentos');
      const data = await res.json();
      setPagamentos(Array.isArray(data) ? data : data.items ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro desconhecido');
      setPagamentos(initialMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPagamentos(); }, []);

  const filtered = useMemo(() => {
    return pagamentos.filter((p) => {
      if (search && !(`${p.fatura?.numero ?? ''} ${p.fatura_id}`).toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (methodFilter && p.metodo_pagamento !== methodFilter) return false;
      if (startDate && new Date(p.data_pagamento) < startDate) return false;
      if (endDate && new Date(p.data_pagamento) > endDate) return false;
      return true;
    });
  }, [pagamentos, search, statusFilter, methodFilter, startDate, endDate]);

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-[#123859]">Pagamentos</h1>
        <div className="flex gap-3">
          <button onClick={() => router.push(`/dashboard/Pagamentos/novo`)} className="bg-[#F9941F] text-white px-4 py-2 rounded">+ Registrar Pagamento</button>
          <button onClick={fetchPagamentos} className="px-4 py-2 border rounded">Atualizar</button>
        </div>
      </div>

      {/* filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center">
        <input placeholder="Procurar fatura..." value={search} onChange={e => setSearch(e.target.value)} className="border p-2 rounded md:w-1/3" />
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="border p-2 rounded">
          <option value="">Todos os métodos</option>
          <option value="pix">PIX</option>
          <option value="cartão">Cartão</option>
          <option value="boleto">Boleto</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border p-2 rounded">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <div className="flex gap-2 items-center">
          <DatePicker selected={startDate} onChange={d => setStartDate(d)} placeholderText="Data inicial" className="border p-2 rounded" />
          <DatePicker selected={endDate} onChange={d => setEndDate(d)} placeholderText="Data final" className="border p-2 rounded" />
        </div>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full">
          <thead className="bg-[#E5E5E5]">
            <tr>
              <th className="p-2 text-left">Fatura</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-right">Valor Pago</th>
              <th className="p-2 text-right">Troco</th>
              <th className="p-2 text-right">Desconto</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Método</th>
              <th className="p-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{p.fatura?.numero || `#${p.fatura_id}`}</td>
                <td className="p-2">{p.data_pagamento}</td>
                <td className="p-2 text-right">€ {p.valor_pago.toFixed(2)}</td>
                <td className="p-2 text-right">{p.valor_troco?.toFixed(2) || '-'}</td>
                <td className="p-2 text-right">{p.valor_total_desconto?.toFixed(2) || '-'}</td>
                <td className={`p-2 font-semibold ${p.status === 'pago' ? 'text-green-500' : p.status === 'pendente' ? 'text-yellow-500' : 'text-red-500'}`}>{p.status}</td>
                <td className="p-2">{p.metodo_pagamento}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => router.push(`/dashboard/Pagamentos/${p.id}/conciliar`)} className="text-gray-600 ">Conciliar</button>
                  <button onClick={() => router.push(`/dashboard/Pagamentos/${p.id}/ver`)} className="text-gray-600">Ver</button>
                  <button onClick={() => router.push(`/dashboard/Pagamentos/${p.id}/apagar`)} className="text-red-500">Apagar</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">Nenhum pagamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
