'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainEmpresa';
import {
  getFaturaById,
  cancelarFatura,
  Fatura,
} from '../../../../services/faturas';

export default function CancelarFaturaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  /* ================= CARREGAR FATURA ================= */
  useEffect(() => {
    if (!id) return;

    const loadFatura = async () => {
      try {
        setLoading(true);
        const data = await getFaturaById(id);
        setFatura(data);
      } catch (error) {
        console.error(error);
        setMessage('Erro ao carregar a fatura.');
      } finally {
        setLoading(false);
      }
    };

    loadFatura();
  }, [id]);

  /* ================= CANCELAR FATURA ================= */
  const handleCancel = async () => {
    if (!fatura) return;

    const ok = window.confirm(
      'Tem certeza que deseja cancelar esta fatura? Esta ação é irreversível.'
    );
    if (!ok) return;

    try {
      setLoading(true);
      setMessage('');

      const res = await cancelarFatura(id);

      setMessage(res.message);

      // atualiza a fatura corretamente
      setFatura(res.fatura);

      setTimeout(() => {
        router.push('/dashboard/Faturas');
      }, 1200);
    } catch (error) {
      console.error(error);
      setMessage('Erro ao cancelar a fatura.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !fatura) {
    return <p className="p-4">Carregando fatura...</p>;
  }

  if (!fatura) {
    return <p className="p-4 text-red-600">Fatura não encontrada.</p>;
  }

 return (
    <MainLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4 text-red-600">
          Cancelar Fatura
        </h1>

        {message && (
          <div className="mb-4 text-sm text-blue-600">{message}</div>
        )}

        <div className="space-y-2 text-sm">
          <p><strong>Número:</strong> {fatura.numero}</p>
          <p><strong>Cliente:</strong> {fatura.cliente.nome}</p>
          <p><strong>Data emissão:</strong> {fatura.data_emissao}</p>
          <p><strong>Vencimento:</strong> {fatura.data_vencimento}</p>
          <p><strong>Total:</strong> {fatura.valor_total} Kz</p>
          <p><strong>Status:</strong> {fatura.status}</p>
        </div>

        {fatura.status !== 'cancelado' && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="mt-6 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Cancelando...' : 'Cancelar Fatura'}
          </button>
        )}
      </div>
    </MainLayout>
  );
}
