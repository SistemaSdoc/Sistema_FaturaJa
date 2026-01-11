'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainEmpresa';
import api from '../../../../services/api';

/* ================= TIPOS ================= */

interface LineItem {
  id: number;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  imposto_percent: number;
}

interface Fatura {
  id: number;
  numero: string;
  cliente: string;
  data: string;
  vencimento: string;
  status: 'Pago' | 'Pendente' | 'Cancelada';
  total: number;
  items: LineItem[];
}

/* ================= COMPONENTE ================= */

export default function EditarFaturaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  /* ================= BUSCAR FATURA ================= */

  useEffect(() => {
    async function fetchFatura(): Promise<void> {
      try {
        const response = await api.get<Fatura>(`/faturas/${id}`);
        setFatura(response.data);
      } catch {
        setError('Erro ao carregar a fatura');
      } finally {
        setLoading(false);
      }
    }

    fetchFatura();
  }, [id]);

  /* ================= HANDLERS ================= */

  const handleChange = (field: keyof Fatura, value: string): void => {
    if (!fatura) return;
    setFatura({ ...fatura, [field]: value });
  };

  const handleItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ): void => {
    if (!fatura) return;

    const items = [...fatura.items];
    items[index] = { ...items[index], [field]: value };
    setFatura({ ...fatura, items });
  };

  const addItem = (): void => {
    if (!fatura) return;

    const novoItem: LineItem = {
      id: Date.now(),
      descricao: '',
      quantidade: 1,
      preco_unitario: 0,
      imposto_percent: 0,
    };

    setFatura({ ...fatura, items: [...fatura.items, novoItem] });
  };

  const removeItem = (index: number): void => {
    if (!fatura) return;

    const items = [...fatura.items];
    items.splice(index, 1);
    setFatura({ ...fatura, items });
  };

  const totalPreview = (): number => {
    if (!fatura) return 0;

    return fatura.items.reduce(
      (acc, item) =>
        acc +
        item.quantidade *
          item.preco_unitario *
          (1 + item.imposto_percent / 100),
      0
    );
  };

  /* ================= SALVAR ================= */

  const saveFatura = async (): Promise<void> => {
    if (!fatura) return;

    try {
      await api.put(`/faturas/${fatura.id}`, fatura);
      alert('Fatura atualizada com sucesso!');
      router.push('/dashboard/Faturas');
    } catch {
      alert('Erro ao salvar a fatura');
    }
  };

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <MainLayout>
        <p>Carregando fatura...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="text-red-500">{error}</p>
      </MainLayout>
    );
  }

  if (!fatura) return null;

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-[#123859] mb-4">
        Editar Fatura {fatura.numero}
      </h1>

      {/* ================= DADOS DA FATURA ================= */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="cliente" className="block font-semibold">
            Cliente
          </label>
          <input
            id="cliente"
            type="text"
            value={fatura.cliente}
            onChange={e => handleChange('cliente', e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="data" className="block font-semibold">
            Data
          </label>
          <input
            id="data"
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

      {/* ================= ITENS ================= */}
      <h2 className="text-xl font-semibold text-[#123859] mb-2">Itens</h2>

      <div className="bg-white p-4 rounded shadow mb-4">
        {fatura.items.map((item, index) => {
          const descId = `descricao-${item.id}`;
          const qtdId = `quantidade-${item.id}`;
          const precoId = `preco-${item.id}`;
          const impostoId = `imposto-${item.id}`;

          return (
            <div key={item.id} className="grid grid-cols-6 gap-2 mb-2 items-end">
              <div>
                <label htmlFor={descId} className="block text-sm">
                  Descrição
                </label>
                <input
                  id={descId}
                  type="text"
                  value={item.descricao}
                  onChange={e =>
                    handleItemChange(index, 'descricao', e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label htmlFor={qtdId} className="block text-sm">
                  Quantidade
                </label>
                <input
                  id={qtdId}
                  type="number"
                  value={item.quantidade}
                  onChange={e =>
                    handleItemChange(
                      index,
                      'quantidade',
                      Number(e.target.value)
                    )
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label htmlFor={precoId} className="block text-sm">
                  Preço Unit.
                </label>
                <input
                  id={precoId}
                  type="number"
                  value={item.preco_unitario}
                  onChange={e =>
                    handleItemChange(
                      index,
                      'preco_unitario',
                      Number(e.target.value)
                    )
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label htmlFor={impostoId} className="block text-sm">
                  Imposto %
                </label>
                <input
                  id={impostoId}
                  type="number"
                  value={item.imposto_percent}
                  onChange={e =>
                    handleItemChange(
                      index,
                      'imposto_percent',
                      Number(e.target.value)
                    )
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className="text-right font-semibold">
                €
                {(
                  item.quantidade *
                  item.preco_unitario *
                  (1 + item.imposto_percent / 100)
                ).toFixed(2)}
              </div>

              <button
                type="button"
                aria-label="Remover item"
                onClick={() => removeItem(index)}
                className="text-red-500 font-bold"
              >
                X
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addItem}
          className="mt-3 bg-[#F9941F] text-white px-4 py-2 rounded"
        >
          Adicionar Item
        </button>
      </div>

      {/* ================= TOTAL ================= */}
      <p className="mb-4 text-lg">
        <strong>Total:</strong> € {totalPreview().toFixed(2)}
      </p>

      <button
        type="button"
        onClick={saveFatura}
        className="bg-[#123859] text-white px-5 py-2 rounded"
      >
        Salvar Fatura
      </button>
    </MainLayout>
  );
}
