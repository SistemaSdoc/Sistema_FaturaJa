'use client';

import React, { useEffect, useState } from "react";
import MainLayout from '../../../components/MainEmpresa';
import { useAuth } from "../../../context/AuthProvider";
import { getPagamentosAll, createPagamento } from "@/app/services/pagamentos";
import Modal from "@/app/components/Modal";

interface Fatura {
  id: string;
  numero: string;
  valor_total: number;
}

interface Pagamento {
  id: string;
  fatura_id: string;
  data_pagamento: string;
  valor_pago: number;
  valor_troco?: number;
  valor_total_desconto?: number;
  status: 'pendente' | 'pago' | 'cancelado';
  metodo_pagamento: 'boleto' | 'cartão' | 'pix';
  fatura?: Fatura;
}

interface NovoPagamentoProps {
  onSubmit: (pagamento: Omit<Pagamento, "id">) => void;
}

const NovoPagamentoForm: React.FC<NovoPagamentoProps> = ({ onSubmit }) => {
  const [faturaId, setFaturaId] = useState('');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [valorPago, setValorPago] = useState<number>(0);
  const [valorTroco, setValorTroco] = useState<number | undefined>();
  const [valorDesconto, setValorDesconto] = useState<number | undefined>();
  const [status, setStatus] = useState<'pendente' | 'pago' | 'cancelado'>('pendente');
  const [metodo, setMetodo] = useState<'boleto' | 'cartão' | 'pix'>('pix');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valorPago <= 0 || !faturaId) return;

    onSubmit({
      fatura_id: faturaId,
      data_pagamento: dataPagamento,
      valor_pago: valorPago,
      valor_troco: valorTroco,
      valor_total_desconto: valorDesconto,
      status,
      metodo_pagamento: metodo,
    });

    // Reset
    setFaturaId('');
    setDataPagamento(new Date().toISOString().split('T')[0]);
    setValorPago(0);
    setValorTroco(undefined);
    setValorDesconto(undefined);
    setStatus('pendente');
    setMetodo('pix');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="text" placeholder="ID da Fatura" value={faturaId} onChange={e => setFaturaId(e.target.value)} className="border p-2 rounded" required />
      <input type="date" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} className="border p-2 rounded" />
      <input type="number" step="0.01" placeholder="Valor Pago" value={valorPago} onChange={e => setValorPago(Number(e.target.value))} className="border p-2 rounded" required />
      <input type="number" step="0.01" placeholder="Troco (opcional)" value={valorTroco ?? ''} onChange={e => setValorTroco(e.target.value ? Number(e.target.value) : undefined)} className="border p-2 rounded" />
      <input type="number" step="0.01" placeholder="Desconto (opcional)" value={valorDesconto ?? ''} onChange={e => setValorDesconto(e.target.value ? Number(e.target.value) : undefined)} className="border p-2 rounded" />
      <select value={status} onChange={e => setStatus(e.target.value as any)} className="border p-2 rounded">
        <option value="pendente">Pendente</option>
        <option value="pago">Pago</option>
        <option value="cancelado">Cancelado</option>
      </select>
      <select value={metodo} onChange={e => setMetodo(e.target.value as any)} className="border p-2 rounded">
        <option value="boleto">Boleto</option>
        <option value="cartão">Cartão</option>
        <option value="pix">PIX</option>
      </select>
      <button type="submit" className="bg-[#F9941F] text-white p-2 rounded font-bold">Salvar Pagamento</button>
    </form>
  );
};

export default function DashboardPagamentos() {
  const { tenant } = useAuth();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPagamentos = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const data = await getPagamentosAll();
      setPagamentos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagamentos();
  }, [tenant]);

  const handleAddPagamento = async (pagamento: Omit<Pagamento, "id">) => {
    const novo = await createPagamento(pagamento);
    setPagamentos([...pagamentos, novo]);
    setShowModal(false);
  };

  return (
    <MainLayout empresa={tenant}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#123859]">Pagamentos</h1>
        <button onClick={() => setShowModal(true)} className="bg-[#4ade80] p-2 rounded text-white font-bold">Novo Pagamento</button>
      </div>

      {loading && <p>Carregando pagamentos...</p>}

      {!loading && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#E5E5E5] text-left">
              <th className="p-2">Fatura</th>
              <th className="p-2">Data</th>
              <th className="p-2">Valor Pago</th>
              <th className="p-2">Troco</th>
              <th className="p-2">Desconto</th>
              <th className="p-2">Status</th>
              <th className="p-2">Método</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.fatura?.numero || '-'}</td>
                <td className="p-2">{p.data_pagamento}</td>
                <td className="p-2">€ {p.valor_pago.toFixed(2)}</td>
                <td className="p-2">{p.valor_troco?.toFixed(2) || '-'}</td>
                <td className="p-2">{p.valor_total_desconto?.toFixed(2) || '-'}</td>
                <td className={`p-2 font-semibold ${p.status === "pago" ? "text-green-500" : p.status === "pendente" ? "text-red-500" : "text-yellow-500"}`}>
                  {p.status}
                </td>
                <td className="p-2">{p.metodo_pagamento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <NovoPagamentoForm onSubmit={handleAddPagamento} />
      </Modal>
    </MainLayout>
  );
}
