'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainEmpresa'; // mesmo layout do dashboard

interface Pagamento {
  id: string;
  fatura_id: string;
  data_pagamento: string;
  valor_pago: number;
  valor_troco?: number;
  valor_total_desconto?: number;
  status: 'pendente' | 'pago' | 'cancelado';
  metodo_pagamento: 'boleto' | 'cartão' | 'pix';
  fatura?: {
    id: string;
    numero: string;
    valor_total: number;
  };
}

export default function VerPagamento() {
  const { id } = useParams();
  const router = useRouter();
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);

 useEffect(() => {
  const fetchPagamento = async () => {
    // Aqui você buscaria do backend com fetch/axios
    const mockPagamento: Pagamento = {
      id: id ?? '1',
      fatura_id: '101',
      data_pagamento: '2025-11-20',
      valor_pago: 150,
      status: 'pendente',
      metodo_pagamento: 'pix',
      fatura: { id: '101', numero: 'FAT-2025-001', valor_total: 200 }
    };
    setPagamento(mockPagamento);
  };

  fetchPagamento();
}, [id]);

  if (!pagamento) return <MainLayout><p>Carregando...</p></MainLayout>;

  return (
    <MainLayout>
      <div className="p-4 max-w-xl mx-auto bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">Pagamento #{pagamento.id}</h1>

        <div className="space-y-2">
          <p><strong>Fatura:</strong> {pagamento.fatura ? `${pagamento.fatura.numero} (€${pagamento.fatura.valor_total.toFixed(2)})` : '—'}</p>
          <p><strong>Data:</strong> {pagamento.data_pagamento}</p>
          <p><strong>Valor Pago:</strong> € {pagamento.valor_pago.toFixed(2)}</p>
          {pagamento.valor_troco !== undefined && <p><strong>Troco:</strong> € {pagamento.valor_troco.toFixed(2)}</p>}
          {pagamento.valor_total_desconto !== undefined && <p><strong>Desconto:</strong> € {pagamento.valor_total_desconto.toFixed(2)}</p>}
          <p><strong>Status:</strong> <span className={pagamento.status === 'pago' ? 'text-green-500' : pagamento.status === 'pendente' ? 'text-yellow-500' : 'text-red-500'}>{pagamento.status}</span></p>
          <p><strong>Método de Pagamento:</strong> {pagamento.metodo_pagamento}</p>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 border rounded">Voltar</button>
          {/* futuramente pode adicionar botão para editar ou conciliar */}
        </div>
      </div>
    </MainLayout>
  );
}
