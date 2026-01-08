'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainEmpresa';
import { Fatura, getFatura, ItemFatura } from '../../../../services/faturas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function VerFaturaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFatura() {
      try {
        const data = await getFatura(id);

        const formatted: Fatura = {
          ...data,
          itens: (data.itens ?? []).map((item: ItemFatura) => ({
            id: item.id,
            descricao: item.descricao ?? 'Produto',
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
            imposto: item.imposto ?? 0,
          })),
        };

        setFatura(formatted);
      } catch (err) {
        console.error('Erro ao carregar fatura', err);
      } finally {
        setLoading(false);
      }
    }

    loadFatura();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <p>Carregando fatura...</p>
      </MainLayout>
    );
  }

  if (!fatura) {
    return (
      <MainLayout>
        <p>Fatura não encontrada.</p>
      </MainLayout>
    );
  }

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Fatura ${fatura.numero}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Cliente: ${fatura.cliente.nome}`, 14, 30);
    doc.text(
      `Data: ${fatura.data_emissao} | Vencimento: ${fatura.data_vencimento}`,
      14,
      36
    );
    doc.text(`Status: ${fatura.status} | Série: ${fatura.serie}`, 14, 42);

    autoTable(doc, {
      head: [['Descrição', 'Qtd', 'Preço Unit.', 'Imposto', 'Total']],
      body: fatura.itens.map(it => [
        it.descricao,
        it.quantidade.toString(),
        `Kz ${it.valor_unitario.toFixed(2)}`,
        `${it.imposto}%`,
        `Kz ${(it.quantidade * it.valor_unitario * (1 + it.imposto / 100)).toFixed(2)}`,
      ]),
      startY: 50,
    });

    const finalY = doc.lastAutoTable?.finalY ?? 60;
    doc.text(`Total: Kz ${fatura.valor_total.toFixed(2)}`, 14, finalY + 10);

    doc.save(`fatura_${fatura.numero}.pdf`);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#123859]">
            Fatura {fatura.numero}
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/Faturas/${fatura.id}/editar`)}
              className="px-3 py-2 bg-orange-500 text-white rounded"
              aria-label="Editar fatura"
            >
              Editar
            </button>

            <button
              onClick={exportPDF}
              className="px-3 py-2 bg-[#123859] text-white rounded"
              aria-label="Exportar fatura em PDF"
            >
              Exportar PDF
            </button>

            <button
              onClick={() => router.push('/dashboard/Faturas')}
              className="px-3 py-2 border rounded"
              aria-label="Voltar à lista de faturas"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-white p-6 rounded shadow">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">
                Status:{' '}
                <span
                  className={`font-semibold ${
                    fatura.status === 'pago'
                      ? 'text-green-500'
                      : fatura.status === 'pendente'
                      ? 'text-yellow-500'
                      : 'text-red-500'
                  }`}
                >
                  {fatura.status}
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Data: {fatura.data_emissao}
              </p>
              <p className="text-sm text-gray-500">
                Vencimento: {fatura.data_vencimento}
              </p>
              <p className="text-lg font-bold text-[#123859]">
                Kz {fatura.valor_total.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Cliente</h3>
            <p>{fatura.cliente.nome}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Itens</h3>
            <div className="space-y-2">
              {fatura.itens.map(it => (
                <div key={it.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">{it.descricao}</div>
                    <div className="text-sm text-gray-500">
                      {it.quantidade} × Kz {it.valor_unitario.toFixed(2)} ({it.imposto}%)
                    </div>
                  </div>
                  <div className="font-medium">
                    Kz {(it.quantidade * it.valor_unitario * (1 + it.imposto / 100)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {fatura.notas && (
            <div>
              <h3 className="font-semibold mb-2">Notas</h3>
              <p>{fatura.notas}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
