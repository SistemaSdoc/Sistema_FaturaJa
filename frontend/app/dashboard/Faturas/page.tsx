'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainEmpresa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Fatura, getFaturasAll, ItemFatura } from '../../services/faturas';

export default function FaturasPage() {
  const router = useRouter();

  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchCliente, setSearchCliente] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSerie, setFilterSerie] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [modalExport, setModalExport] = useState(false);

  // --- carregar faturas da API ---
  useEffect(() => {
    async function loadFaturas() {
      try {
        const data = await getFaturasAll();
        // Mapear dados da API para o tipo correto
        const formatted: Fatura[] = data.map(f => ({
          id: f.id,
          numero: f.numero,
          serie: f.serie || 'A',
          status: f.status,
          data_emissao: f.data_emissao,
          data_vencimento: f.data_vencimento,
          valor_total: f.valor_total,
          cliente: f.cliente,
          itens: f.itens || [],
          created_at: f.created_at,
          updated_at: f.updated_at,
        }));
        setFaturas(formatted);
      } catch (err) {
        console.error('Erro ao carregar faturas', err);
      }
    }
    loadFaturas();
  }, []);

  // --- filtragem ---
  const filtered = useMemo(() => {
    let data = [...faturas];
    if (searchCliente) {
      data = data.filter(f =>
        f.cliente.nome.toLowerCase().includes(searchCliente.toLowerCase())
      );
    }
    if (filterStatus) data = data.filter(f => f.status === filterStatus);
    if (filterSerie) data = data.filter(f => f.serie === filterSerie);
    if (startDate) data = data.filter(f => new Date(f.data_emissao) >= startDate);
    if (endDate) data = data.filter(f => new Date(f.data_emissao) <= endDate);
    return data;
  }, [faturas, searchCliente, filterStatus, filterSerie, startDate, endDate]);

  const toggleSelect = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  // --- abrir criação/edição ---
  const openCreateAndEdit = () =>router.push('/dashboard/Faturas/nova-fatura');
  const openEditForm = (id: string) => router.push(`/dashboard/Faturas/${id}/editar`);

  // --- exportar PDF ---
  const exportFatura = () => {
    if (selected.length === 0) {
      alert('Selecione pelo menos uma fatura para exportar.');
      return;
    }
    setModalExport(true);
  };

  const confirmExport = () => {
    selected.forEach(faturaId => {
      const f = faturas.find(f => f.id === faturaId);
      if (!f) return;

      const doc = new jsPDF();

      // Cabeçalho
      doc.setFontSize(16);
      doc.text(`Fatura ${f.numero}`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Cliente: ${f.cliente.nome}`, 14, 30);
      doc.text(`Data: ${f.data_emissao} | Vencimento: ${f.data_vencimento}`, 14, 36);
      doc.text(`Status: ${f.status} | Série: ${f.serie}`, 14, 42);

      // Tabela de itens
      autoTable(doc, {
        head: [['Descrição', 'Qtd', 'Preço Unit.', 'Imposto', 'Total']],
        body: f.itens.map((item: ItemFatura) => [
          item.descricao,
          item.quantidade.toString(),
          `€ ${item.valor_unitario.toFixed(2)}`,
          `${item.imposto?.toFixed(0) ?? 0}%`,
          `€ ${(item.quantidade * item.valor_unitario * (1 + (item.imposto ?? 0) / 100)).toFixed(2)}`
        ]),
        startY: 50,
      });

      // finalY correto usando tipagem adicionada
      const finalY = doc.lastAutoTable?.finalY ?? 60;
      doc.text(`Total: € ${f.valor_total.toFixed(2)}`, 14, finalY + 10);

      doc.save(`fatura_${f.numero}.pdf`);
    });

    setModalExport(false);
  };

return (
  <MainLayout>
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-3xl font-bold text-[#123859]">Faturas</h1>
      <div className="flex gap-2">
        <button
          onClick={openCreateAndEdit}
          className="bg-[#F9941F] text-white px-4 py-2 rounded hover:brightness-95"
        >
          + Nova Fatura
        </button>
        <button
          onClick={exportFatura}
          className="bg-[#123859] text-white px-4 py-2 rounded hover:brightness-95"
        >
          Exportar PDF
        </button>
      </div>
    </div>

    {/* filtros */}
    <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
      <input
        type="text"
        placeholder="Pesquisar cliente..."
        aria-label="Pesquisar cliente"
        value={searchCliente}
        onChange={e => setSearchCliente(e.target.value)}
        className="border p-2 rounded w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-[#F9941F]"
      />
      <select
        value={filterStatus}
        onChange={e => setFilterStatus(e.target.value)}
        aria-label="Filtrar por status"
        className="border p-2 rounded w-full md:w-1/6"
      >
        <option value="">Todos os status</option>
        <option value="pendente">Pendente</option>
        <option value="pago">Pago</option>
        <option value="cancelado">Cancelado</option>
      </select>
      <select
        value={filterSerie}
        onChange={e => setFilterSerie(e.target.value)}
        aria-label="Filtrar por série"
        className="border p-2 rounded w-full md:w-1/6"
      >
        <option value="">Todas as séries</option>
        <option value="A">Série A</option>
        <option value="B">Série B</option>
      </select>
      <DatePicker
        selected={startDate}
        onChange={setStartDate}
        placeholderText="Data inicial"
        className="border p-1 rounded w-full md:w-5/6"
        aria-label="Data inicial"
      />
      <DatePicker
        selected={endDate}
        onChange={setEndDate}
        placeholderText="Data final"
        className="border p-1 rounded w-full md:w-5/6"
        aria-label="Data final"
      />
    </div>

  {/* tabela */}
<div className="overflow-x-auto bg-white shadow rounded">
  <table className="w-full border-collapse">
    <thead className="bg-[#E5E5E5]">
      <tr>
        <th className="p-2">
          <input
            type="checkbox"
            checked={selected.length === filtered.length && filtered.length > 0}
            onChange={e => setSelected(e.target.checked ? filtered.map(f => f.id) : [])}
            aria-label="Selecionar todas as faturas"
          />
        </th>
        <th className="p-2 text-left">Número</th>
        <th className="p-2 text-left">Cliente</th>
        <th className="p-2 text-left">Data</th>
        <th className="p-2 text-left">Vencimento</th>
        <th className="p-2 text-left">Total</th>
        <th className="p-2 text-left">Status</th>
        <th className="p-2 text-left">Série</th>
        <th className="p-2 text-left">Ações</th>
      </tr>
    </thead>
    <tbody>
      {filtered.map(f => (
        <tr key={f.id} className="border-t hover:bg-gray-50">
          <td className="p-2">
            <input
              type="checkbox"
              checked={selected.includes(f.id)}
              onChange={() => toggleSelect(f.id)}
              aria-label={`Selecionar fatura ${f.numero}`}
            />
          </td>
          <td className="p-2 font-medium text-[#123859]">{f.numero}</td>
          <td className="p-2">{f.cliente.nome}</td>
          <td className="p-2">{f.data_emissao}</td>
          <td className="p-2">{f.data_vencimento}</td>
          <td className="p-2">€ {f.valor_total.toFixed(2)}</td>
          <td
            className={`p-2 font-semibold ${
              f.status === 'pago'
                ? 'text-green-500'
                : f.status === 'pendente'
                ? 'text-yellow-500'
                : 'text-red-500'
            }`}
          >
            {f.status === 'pago'
              ? 'Pago'
              : f.status === 'pendente'
              ? 'Pendente'
              : 'Cancelado'}
          </td>
          <td className="p-2">{f.serie}</td>
          <td className="p-2 flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/Faturas/${f.id}/ver`)}
              className="text-[#123859]"
              aria-label={`Ver fatura ${f.numero}`}
            >
              Ver
            </button>
            <button
              onClick={() => openEditForm(f.id)}
              className="text-[#123859]"
              aria-label={`Editar fatura ${f.numero}`}
            >
              Editar
            </button>
          </td>
        </tr>
      ))}
      {filtered.length === 0 && (
        <tr>
          <td colSpan={9} className="p-6 text-center text-gray-500">
            Nenhuma fatura encontrada.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

{/* Modal de confirmação exportação */}
{modalExport && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow w-96">
      <h3 className="text-lg font-semibold text-[#123859] mb-3">Confirmar exportação</h3>
      <p className="mb-4">
        Você selecionou {selected.length} fatura(s). Deseja exportar para PDF?
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setModalExport(false)}
          className="px-4 py-2 border rounded"
          aria-label="Cancelar exportação"
        >
          Cancelar
        </button>
        <button
          onClick={confirmExport}
          className="px-4 py-2 bg-[#F9941F] text-white rounded"
          aria-label="Confirmar exportação para PDF"
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
  