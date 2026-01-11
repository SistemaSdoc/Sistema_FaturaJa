'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainEmpresa';
import { getFatura, pagarFatura, Fatura } from '../../../../services/faturas';

type MetodoPagamento = 'pix' | 'card' | 'boleto' | 'multicaixa';

interface PagarFaturaResponse {
  fatura: Fatura;
  message: string;
}

export default function PagarFaturaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [method, setMethod] = useState<MetodoPagamento>('pix');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  /* ================= LOAD FATURA ================= */
  useEffect(() => {
    async function loadFatura() {
      if (!id) return;

      try {
        setLoading(true);
        const data: Fatura = await getFatura(id);
        setFatura(data);
      } catch (err) {
        console.error('Erro ao carregar fatura', err);
        setMessage('Erro ao carregar fatura.');
      } finally {
        setLoading(false);
      }
    }

    loadFatura();
  }, [id]);

  /* ================= PAGAMENTO ================= */
  const handlePay = async () => {
    if (!fatura) return;
    if (fatura.status === 'pago') {
      setMessage('Esta fatura já foi paga.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const response: PagarFaturaResponse = await pagarFatura(fatura.id, {
        metodo: method,
      });

      setFatura(response.fatura);
      setMessage(response.message || 'Pagamento efetuado com sucesso.');
    } catch (err) {
      console.error(err);
      // Se err for do tipo AxiosError, podemos acessar err.response.data.message
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('Erro inesperado ao processar pagamento.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">
          Pagar Fatura #{id}
        </h1>

        {fatura ? (
          <div className="bg-white p-6 rounded shadow space-y-4">
            <p>
              <span className="font-semibold">Cliente:</span> {fatura.cliente.nome}
            </p>
            <p>
              <span className="font-semibold">Valor Total:</span> € {fatura.valor_total.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{' '}
              <span
                className={`font-semibold capitalize ${
                  fatura.status === 'pago'
                    ? 'text-green-600'
                    : fatura.status === 'pendente'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {fatura.status}
              </span>
            </p>

            <div>
              <label htmlFor="metodoPagamento" className="block font-medium mb-2">
                Método de Pagamento
              </label>
              <select
                id="metodoPagamento"
                value={method}
                onChange={(e) => setMethod(e.target.value as MetodoPagamento)}
                className="w-full border p-2 rounded"
                disabled={fatura.status === 'pago'}
              >
                <option value="pix">Pix / Transferência</option>
                <option value="card">Cartão</option>
                <option value="boleto">Boleto</option>
                <option value="multicaixa">Multicaixa</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border rounded"
              >
                Voltar
              </button>

              <button
                onClick={handlePay}
                disabled={loading || fatura.status === 'pago'}
                className={`px-4 py-2 rounded text-white ${
                  fatura.status === 'pago' ? 'bg-gray-400' : 'bg-[#F9941F]'
                }`}
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>

            {message && (
              <div
                className={`p-3 rounded ${
                  message.includes('sucesso')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </div>
            )}
          </div>
        ) : (
          <p>Carregando fatura...</p>
        )}
      </div>
    </MainLayout>
  );
}
