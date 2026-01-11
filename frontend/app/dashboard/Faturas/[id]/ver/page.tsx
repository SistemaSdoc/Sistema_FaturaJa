'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainEmpresa';
import { Fatura, getFatura } from '../../../../services/faturas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ===== Tipagem jsPDF ===== */
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export default function VerFaturaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD FATURA ================= */
  useEffect(() => {
    async function loadFatura() {
      try {
        const data = await getFatura(id);
        setFatura(data); // ✅ total e itens já calculados pelo backend
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

  /* ================= EXPORT PDF ================= */
  const exportPDF = () => {
    const doc = new jsPDF();
    const pdf = doc as JsPDFWithAutoTable;

    doc.setFontSize(16);
    doc.text(`Fatura Nº ${fatura.numero}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Cliente: ${fatura.cliente.nome}`, 14, 30);
    doc.text(`Emissão: ${fatura.data_emissao}`, 14, 36);
    doc.text(`Vencimento: ${fatura.data_vencimento}`, 14, 42);
    doc.text(`Status: ${fatura.status}`, 14, 48);

    autoTable(doc, {
      startY: 60,
      head: [['Descrição', 'Qtd', 'Preço Unit.', 'Imposto', 'Total']],
      body: fatura.itens.map(item => [
        item.produto.nome,
        item.quantidade.toString(),
        `Kz ${item.produto.preco_unitario.toFixed(2)}`,
        `${item.produto.imposto_percent}%`,
        `Kz ${item.produto.preco_unitario.toFixed(2)}`, // ✅ usa o total já calculado
      ]),
    });

    const finalY = pdf.lastAutoTable?.finalY ?? 70;
    doc.text(`Total: Kz ${fatura.valor_total.toFixed(2)}`, 14, finalY + 10);

    doc.save(`fatura_${fatura.numero}.pdf`);
  };

  /* ================= UI ================= */
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#123859]">Fatura {fatura.numero}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/Faturas/${fatura.id}/editar`)}
              className="px-3 py-2 bg-orange-500 text-white rounded"
            >
              Editar
            </button>
            <button onClick={exportPDF} className="px-3 py-2 bg-[#123859] text-white rounded">
              Exportar PDF
            </button>
            <button onClick={() => router.push('/dashboard/Faturas')} className="px-3 py-2 border rounded">
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
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Emissão: {fatura.data_emissao}</p>
              <p className="text-sm text-gray-500">Vencimento: {fatura.data_vencimento}</p>
              <p className="text-lg font-bold text-[#123859]">Kz {fatura.valor_total.toFixed(2)}</p>
            </div>
          </div>

          {/* Cliente */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Cliente</h3>
            <p>{fatura.cliente.nome}</p>
          </div>

          {/* Itens */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Itens</h3>
            <div className="space-y-2">
              {fatura.itens.map(item => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">{item.produto.nome}</div>
                    <div className="text-sm text-gray-500">
                      {item.quantidade} × Kz {item.produto.preco_unitario.toFixed(2)} ({item.produto.imposto_percent}%)
                    </div>
                  </div>
                  <div className="font-medium">Kz {item.produto.preco_unitario.toFixed(2)}</div> {/* ✅ total backend */}
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          {fatura.nota && (
            <div>
              <h3 className="font-semibold mb-2">Notas</h3>
              <p>{fatura.nota}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
