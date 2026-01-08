'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainEmpresa';

interface LineItem {
  id: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  impostoPercent: number;
}

interface Fatura {
  id: number;
  numero: string;
  cliente: string;
  data: string;
  vencimento: string;
  total: number;
  status: 'Pago' | 'Pendente' | 'Cancelada';
  serie: string;
  items?: LineItem[];
  notas?: string;
}

export default function EditarFaturaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [error, setError] = useState<string>('');

  // Carregar faturas do localStorage de forma segura
  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('faturas');
      const list: Fatura[] = saved ? JSON.parse(saved) : [];

      setTimeout(() => {
        setFaturas(list);

        const f = list.find(f => f.id === Number(id));
        if (f) setFatura(f);
        else setError('Fatura não encontrada (mock)');
      }, 0);
    };

    loadData();
  }, [id]);

  const handleChange = (field: keyof Fatura, value: string) => {
    if (!fatura) return;
    setFatura({ ...fatura, [field]: value });
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    if (!fatura || !fatura.items) return;
    const updatedItems = [...fatura.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFatura({ ...fatura, items: updatedItems });
  };

  const addItem = () => {
    if (!fatura) return;
    const newItem: LineItem = {
      id: Date.now(),
      descricao: '',
      quantidade: 1,
      precoUnitario: 0,
      impostoPercent: 0,
    };
    setFatura({ ...fatura, items: [...(fatura.items || []), newItem] });
  };

  const removeItem = (index: number) => {
    if (!fatura || !fatura.items) return;
    const updatedItems = [...fatura.items];
    updatedItems.splice(index, 1);
    setFatura({ ...fatura, items: updatedItems });
  };

  const computeTotal = () => {
    if (!fatura || !fatura.items) return 0;
    return fatura.items.reduce(
      (acc, item) => acc + item.quantidade * item.precoUnitario * (1 + item.impostoPercent / 100),
      0
    );
  };

  const saveFatura = () => {
    if (!fatura) return;
    const updated = faturas.map(f => (f.id === fatura.id ? { ...fatura, total: computeTotal() } : f));
    localStorage.setItem('faturas', JSON.stringify(updated));
    alert('Fatura salva com sucesso!');
    router.push('/dashboard/Faturas');
  };

  if (error)
    return (
      <MainLayout>
        <p className="text-red-500">{error}</p>
      </MainLayout>
    );

  if (!fatura)
    return (
      <MainLayout>
        <p>Carregando fatura...</p>
      </MainLayout>
    );

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-[#123859] mb-4">Editar Fatura {fatura.numero}</h1>

      {/* Dados da fatura */}
      <div className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cliente" className="block font-semibold">
            Cliente
          </label>
          <input
            id="cliente"
            title="Cliente"
            type="text"
            value={fatura.cliente}
            onChange={e => handleChange('cliente', e.target.value)}
            placeholder="Nome do cliente"
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="data" className="block font-semibold">
            Data
          </label>
          <input
            id="data"
            title="Data da fatura"
            type="date"
            value={fatura.data}
            onChange={e => handleChange('data', e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="vencimento" className="block font-semibold">
            Vencimento
          </label>
          <input
            id="vencimento"
            title="Data de vencimento"
            type="date"
            value={fatura.vencimento}
            onChange={e => handleChange('vencimento', e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="status" className="block font-semibold">
            Status
          </label>
          <select
            id="status"
            title="Status da fatura"
            value={fatura.status}
            onChange={e => handleChange('status', e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Itens da fatura */}
      <h2 className="text-xl font-semibold text-[#123859] mb-2">Itens</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        {fatura.items &&
          fatura.items.map((item, index) => (
            <div key={item.id} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                value={item.descricao}
                onChange={e => handleItemChange(index, 'descricao', e.target.value)}
                placeholder="Descrição"
                title="Descrição do item"
                className="border p-2 rounded w-1/3"
              />
              <input
                type="number"
                value={item.quantidade}
                onChange={e => handleItemChange(index, 'quantidade', Number(e.target.value))}
                placeholder="Quantidade"
                title="Quantidade"
                className="border p-2 rounded w-1/6"
              />
              <input
                type="number"
                value={item.precoUnitario}
                onChange={e => handleItemChange(index, 'precoUnitario', Number(e.target.value))}
                placeholder="Preço Unitário"
                title="Preço Unitário"
                className="border p-2 rounded w-1/6"
              />
              <input
                type="number"
                value={item.impostoPercent}
                onChange={e => handleItemChange(index, 'impostoPercent', Number(e.target.value))}
                placeholder="% Imposto"
                title="Percentual de imposto"
                className="border p-2 rounded w-1/6"
              />
              <div className="w-1/6 text-right">
                € {(item.quantidade * item.precoUnitario * (1 + item.impostoPercent / 100)).toFixed(2)}
              </div>
              <button
                onClick={() => removeItem(index)}
                title="Remover item"
                className="text-red-500 font-bold"
              >
                X
              </button>
            </div>
          ))}
        <button
          onClick={addItem}
          title="Adicionar item"
          className="mt-2 bg-[#F9941F] text-white px-3 py-1 rounded"
        >
          Adicionar Item
        </button>
      </div>

      {/* Total */}
      <div className="mb-4">
        <strong>Total: </strong> € {computeTotal().toFixed(2)}
      </div>

      {/* Botão salvar */}
      <button
        onClick={saveFatura}
        title="Salvar fatura"
        className="bg-[#123859] text-white px-4 py-2 rounded"
      >
        Salvar Fatura
      </button>
    </MainLayout>
  );
}
