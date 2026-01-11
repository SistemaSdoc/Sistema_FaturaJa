'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainEmpresa from '../../../components/MainEmpresa';

import { createFatura } from '../../../services/faturas';
import { createItemFatura } from '../../../services/itemFatura';
import { getClientes } from '../../../services/clientes';
import { getProdutosAll, ProdutoApi } from '../../../services/produtos';

/* ===================== TIPOS ===================== */

interface Cliente {
  id: string;
  nome: string;
}

interface ItemForm {
  id: string;
  produtoId: string;
  quantidade: number;
}

interface FormFatura {
  clienteId: string;
  dataEmissao: string;
  dataVencimento: string;
  status: 'pendente' | 'pago' | 'cancelado';
  tipo: 'proforma' | 'fatura' | 'recibo';
}

/* ===================== COMPONENTE ===================== */

export default function NovaFaturaPage() {
  const router = useRouter();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<ProdutoApi[]>([]);
  const [itens, setItens] = useState<ItemForm[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormFatura>({
    clienteId: '',
    dataEmissao: '',
    dataVencimento: '',
    status: 'pendente',
    tipo: 'fatura',
  });

  /* ===================== LOAD DADOS ===================== */

  useEffect(() => {
    async function loadData() {
      try {
        const [c, p] = await Promise.all([
          getClientes(),
          getProdutosAll(),
        ]);
        setClientes(c);
        setProdutos(p);
      } catch (error) {
        console.error('Erro ao carregar dados', error);
      }
    }
    loadData();
  }, []);

  /* ===================== FORM HELPERS ===================== */

  const handleChange = <K extends keyof FormFatura>(
    field: K,
    value: FormFatura[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setItens(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        produtoId: '',
        quantidade: 1,
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof ItemForm,
    value: string | number
  ) => {
    const copy = [...itens];
    copy[index] = { ...copy[index], [field]: value };
    setItens(copy);
  };

  const removeItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  /* ===================== TOTAL ===================== */

  const total = itens.reduce((acc, item) => {
    const prod = produtos.find(p => p.id === item.produtoId);
    if (!prod) return acc;

    return (
      acc +
      item.quantidade *
        prod.valor_unitario *
        (1 + prod.imposto / 100)
    );
  }, 0);

  /* ===================== SALVAR ===================== */

 const salvarFatura = async () => {
  if (!form.clienteId || !form.dataEmissao || !form.dataVencimento) {
    alert('Preencha todos os campos obrigatórios');
    return;
  }

  if (itens.length === 0) {
    alert('Adicione pelo menos um item');
    return;
  }

  setLoading(true);

  try {
    const fatura = await createFatura({
      cliente_id: form.clienteId,
      data_emissao: form.dataEmissao,
      data_vencimento: form.dataVencimento,
      status: form.status,
      tipo: form.tipo,
    });

    for (const item of itens) {
      await createItemFatura(fatura.id, {
        produto_id: item.produtoId,
        quantidade: item.quantidade,
      });
    }

    alert('Fatura criada com sucesso');
    router.push('/dashboard/Faturas');
  } catch (error) {
    console.error(error);
    alert('Erro ao criar fatura');
  } finally {
    setLoading(false);
  }
};

  /* ===================== UI ===================== */

  return (
    <MainEmpresa>
      <div className="max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold text-[#123859]">
          Criar Fatura
        </h1>

        {/* FORMULÁRIO */}
        <div className="bg-white p-6 rounded shadow space-y-4">
          {/* CLIENTE */}
          <div className="flex flex-col">
            <label htmlFor="clienteId" className="font-semibold">
              Cliente
            </label>
            <select
              id="clienteId"
              className="border p-2 rounded"
              value={form.clienteId}
              onChange={e =>
                handleChange('clienteId', e.target.value)
              }
            >
              <option value="">Selecione o cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* DATAS */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="dataEmissao" className="font-semibold">
                Data de Emissão
              </label>
              <input
                id="dataEmissao"
                type="date"
                className="border p-2 rounded"
                value={form.dataEmissao}
                onChange={e =>
                  handleChange('dataEmissao', e.target.value)
                }
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="dataVencimento" className="font-semibold">
                Data de Vencimento
              </label>
              <input
                id="dataVencimento"
                type="date"
                className="border p-2 rounded"
                value={form.dataVencimento}
                onChange={e =>
                  handleChange('dataVencimento', e.target.value)
                }
              />
            </div>
          </div>

          {/* STATUS & TIPO */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="statusFatura" className="font-semibold">
                Status
              </label>
              <select
                id="statusFatura"
                className="border p-2 rounded"
                value={form.status}
                onChange={e =>
                  handleChange(
                    'status',
                    e.target.value as FormFatura['status']
                  )
                }
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="tipoFatura" className="font-semibold">
                Tipo
              </label>
              <select
                id="tipoFatura"
                className="border p-2 rounded"
                value={form.tipo}
                onChange={e =>
                  handleChange(
                    'tipo',
                    e.target.value as FormFatura['tipo']
                  )
                }
              >
                <option value="proforma">Proforma</option>
                <option value="fatura">Fatura</option>
                <option value="recibo">Recibo</option>
              </select>
            </div>
          </div>
        </div>

        {/* ITENS */}
        <div className="bg-white p-6 rounded shadow space-y-3">
          <h2 className="font-semibold text-lg">
            Itens da Fatura
          </h2>

          {itens.map((item, i) => {
            const produto = produtos.find(
              p => p.id === item.produtoId
            );

            return (
              <div
                key={item.id}
                className="grid grid-cols-6 gap-2 items-center"
              >
                <label htmlFor={`produto-${i}`} className="sr-only">
                  Produto
                </label>
                <select
                  id={`produto-${i}`}
                  className="border p-2 rounded col-span-2"
                  value={item.produtoId}
                  onChange={e =>
                    updateItem(i, 'produtoId', e.target.value)
                  }
                >
                  <option value="">Selecione o produto</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (€{p.valor_unitario.toFixed(2)} +{' '}
                      {p.imposto}%)
                    </option>
                  ))}
                </select>

                <label htmlFor={`quantidade-${i}`} className="sr-only">
                  Quantidade
                </label>
                <input
                  id={`quantidade-${i}`}
                  type="number"
                  min={1}
                  className="border p-2 rounded"
                  value={item.quantidade}
                  onChange={e =>
                    updateItem(
                      i,
                      'quantidade',
                      Number(e.target.value)
                    )
                  }
                />

                <div className="flex justify-between col-span-2">
                  <span className="font-medium">
                    {produto
                      ? `€${(
                          item.quantidade *
                          produto.valor_unitario *
                          (1 + produto.imposto / 100)
                        ).toFixed(2)}`
                      : '—'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-red-500 font-bold"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addItem}
            className="bg-[#F9941F] text-white px-4 py-2 rounded"
          >
            Adicionar Item
          </button>
        </div>

        {/* TOTAL */}
        <div className="text-xl font-bold">
          Total: € {total.toFixed(2)}
        </div>

        {/* AÇÕES */}
        <div className="flex gap-3">
          <button
            onClick={salvarFatura}
            className="bg-[#123859] text-white px-6 py-2 rounded"
          >
            {loading ? 'Salvando...' : 'Criar Fatura'}
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-400 text-white px-6 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </MainEmpresa>
  );
}
