'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainEmpresa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Fatura, getFaturasAll, ItemFatura } from '../../services/faturas';

/* ================= TIPAGEM jsPDF SEM ANY ================= */
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export default function FaturasPage() {
  const router = useRouter();

  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchCliente, setSearchCliente] = useState('');
  const [filterStatus, setFilterStatus] =
    useState<'pendente' | 'pago' | 'cancelado' | ''>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [modalExport, setModalExport] = useState(false);

  /* ================= CARREGAR FATURAS ================= */
  useEffect(() => {
    async function loadFaturas() {
      try {
        const data = await getFaturasAll();
        setFaturas(data);
      } catch (error) {
        console.error('Erro ao carregar faturas', error);
      }
    }
    loadFaturas();
  }, []);

  /* ================= FILTROS ================= */
  const filtered = useMemo(() => {
    let data = [...faturas];

    if (searchCliente) {
      data = data.filter(f =>
        f.cliente.nome.toLowerCase().includes(searchCliente.toLowerCase())
      );
    }

    if (filterStatus) {
      data = data.filter(f => f.status === filterStatus);
    }

    if (startDate) {
      data = data.filter(f => new Date(f.data_emissao) >= startDate);
    }

    if (endDate) {
      data = data.filter(f => new Date(f.data_emissao) <= endDate);
    }

    return data;
  }, [faturas, searchCliente, filterStatus, startDate, endDate]);

  /* ================= SELEÇÃO ================= */
  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  /* ================= NAVEGAÇÃO ================= */
  const openCreate = () => router.push('/dashboard/Faturas/nova-fatura');
  const openEdit = (id: string) =>
    router.push(`/dashboard/Faturas/${id}/editar`);

  /* ================= EXPORTAR PDF ================= */
  const exportFatura = () => {
    if (selected.length === 0) {
      alert('Selecione pelo menos uma fatura.');
      return;
    }
    setModalExport(true);
  };

  const confirmExport = () => {
    selected.forEach(faturaId => {
      const fatura = faturas.find(f => f.id === faturaId);
      if (!fatura) return;

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
        head: [['Produto', 'Qtd', 'Preço Unit.', 'Imposto', 'Total']],
        body: fatura.itens.map((item: ItemFatura) => {
          const preco = item.produto.preco_unitario;
          const imposto = item.produto.imposto_percent;
          const totalItem = item.quantidade * preco * (1 + imposto / 100);

          return [
            item.produto.nome,
            item.quantidade.toString(),
            `€ ${preco.toFixed(2)}`,
            `${imposto}%`,
            `€ ${totalItem.toFixed(2)}`,
          ];
        }),
      });

      const finalY = pdf.lastAutoTable?.finalY ?? 70;
      doc.text(`Total: € ${fatura.valor_total.toFixed(2)}`, 14, finalY + 10);

      doc.save(`fatura_${fatura.numero}.pdf`);
    });

    setModalExport(false);
  };

  /* ================= RENDER ================= */
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-[#123859]">Faturas</h1>
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="bg-[#F9941F] text-white px-4 py-2 rounded"
          >
            + Nova Fatura
          </button>
          <button
            onClick={exportFatura}
            className="bg-[#123859] text-white px-4 py-2 rounded"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* ================= FILTROS ================= */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col w-full md:w-1/4">
          <label htmlFor="searchCliente" className="text-sm font-medium">
            Cliente
          </label>
          <input
            id="searchCliente"
            type="text"
            value={searchCliente}
            onChange={e => setSearchCliente(e.target.value)}
            className="border p-2 rounded"
            placeholder="Pesquisar cliente"
          />
        </div>

        <div className="flex flex-col w-full md:w-1/6">
          <label htmlFor="filterStatus" className="text-sm font-medium">
            Status
          </label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={e =>
              setFilterStatus(e.target.value as typeof filterStatus)
            }
            className="border p-2 rounded"
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-sm font-medium">
            Data inicial
          </label>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={setStartDate}
            className="border p-2 rounded"
            placeholderText="Selecionar data inicial"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-sm font-medium">
            Data final
          </label>
          <DatePicker
            id="endDate"
            selected={endDate}
            onChange={setEndDate}
            className="border p-2 rounded"
            placeholderText="Selecionar data final"
          />
        </div>
      </div>

      {/* ================= TABELA ================= */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">
                <input
                  aria-label="Selecionar todas as faturas"
                  type="checkbox"
                  checked={
                    selected.length === filtered.length && filtered.length > 0
                  }
                  onChange={e =>
                    setSelected(e.target.checked ? filtered.map(f => f.id) : [])
                  }
                />
              </th>
              <th className="p-2 text-left">Número</th>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2">Emissão</th>
              <th className="p-2">Vencimento</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  <input
                    aria-label={`Selecionar fatura ${f.numero}`}
                    type="checkbox"
                    checked={selected.includes(f.id)}
                    onChange={() => toggleSelect(f.id)}
                  />
                </td>
                <td className="p-2 font-semibold">{f.numero}</td>
                <td className="p-2">{f.cliente.nome}</td>
                <td className="p-2">{f.data_emissao}</td>
                <td className="p-2">{f.data_vencimento}</td>
                <td className="p-2">€ {f.valor_total.toFixed(2)}</td>
                <td className="p-2 capitalize">{f.status}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/dashboard/Faturas/${f.id}/ver`)
                    }
                    className="text-blue-600"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => openEdit(f.id)}
                    className="text-blue-600"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  Nenhuma fatura encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL EXPORT ================= */}
      {modalExport && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="font-bold mb-3">Confirmar exportação</h3>
            <p className="mb-4">
              Exportar {selected.length} fatura(s) para PDF?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalExport(false)}
                className="border px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmExport}
                className="bg-[#F9941F] text-white px-4 py-2 rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
