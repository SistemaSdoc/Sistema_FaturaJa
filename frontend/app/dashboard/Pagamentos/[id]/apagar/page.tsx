'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainEmpresa'; // corrigido para MainEmpresa

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

export default function ApagarPagamento() {
  const { id } = useParams();
  const router = useRouter();

  const handleApagar = () => {
    // Aqui você faria a chamada real para o backend, ex:
    // await fetch(`/api/pagamentos/${id}`, { method: 'DELETE' });
    alert(`Pagamento ${id} apagado!`);
    router.push('/dashboard/Pagamentos'); // volta para a lista
  };

  return (
    <MainLayout>
      <div className="p-4 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">Apagar Pagamento #{id}</h1>
        <p className="mb-4">Tem certeza que deseja apagar este pagamento?</p>
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleApagar}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Apagar
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
