'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainEmpresa';

interface Fatura {
  id: number;
  numero: string;
  cliente: string;
  data: string;
  vencimento: string;
  total: number;
  status: 'Pago' | 'Pendente' | 'Cancelada';
  serie: string;
}

export default function CancelarFaturaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Buscar a fatura ao carregar a página
  useEffect(() => {
    const fetchFatura = async () => {
      if (!token) {
        setMessage('Usuário não autenticado');
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Erro ao carregar fatura');
        }
        const data: Fatura = await res.json();
        setFatura(data);
      } catch (err: unknown) {
        const e = err as Error;
        console.error(e);
        setMessage(e.message || 'Erro desconhecido ao carregar fatura');
      } finally {
        setLoading(false);
      }
    };
    fetchFatura();
  }, [id, token]);

  // Cancelar fatura
  const handleCancel = async () => {
    if (!token) {
      setMessage('Usuário não autenticado');
      return;
    }
    if (!confirm('Tem certeza que deseja cancelar esta fatura? Esta ação pode ser irreversível.')) return;

    try {
      setLoading(true);
      setMessage('');
      const res = await fetch(`/api/invoices/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erro ao cancelar fatura');
      }
      setMessage('Fatura cancelada com sucesso.');
      setFatura(f => f ? { ...f, status: 'Cancelada' } : f);
      setTimeout(() => router.push('/dashboard/Faturas'), 1000);
    } catch (err: unknown) {
      const e = err as Error;
      console.error(e);
      setMessage(e.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">
          Cancelar Fatura {fatura ? `#${fatura.numero}` : ''}
        </h1>

        {loading && <div className="p-4 bg-white rounded shadow mb-4">Carregando...</div>}
        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        {fatura && (
          <div className="bg-white p-6 rounded shadow">
            <p className="mb-2">
              Cliente: <strong>{fatura.cliente}</strong>
            </p>
            <p className="mb-2">
              Data: <strong>{fatura.data}</strong> | Vencimento: <strong>{fatura.vencimento}</strong>
            </p>
            <p className="mb-4">
              Total: <strong>€ {fatura.total.toFixed(2)}</strong>
            </p>
            <p className="mb-4">
              Status atual: <strong>{fatura.status}</strong>
            </p>

            <div className="flex justify-between">
              <button
                onClick={() => router.back()}
                title="Voltar para a lista de faturas"
                className="px-4 py-2 border rounded"
              >
                Voltar
              </button>
              <button
                onClick={handleCancel}
                disabled={loading || fatura.status === 'Cancelada'}
                title="Cancelar fatura"
                className="px-4 py-2 bg-[#F9941F] text-white rounded disabled:opacity-60"
              >
                {loading ? 'Aguarde...' : 'Cancelar Fatura'}
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
