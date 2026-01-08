'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainEmpresa from '../../../components/MainEmpresa';
import { createFatura } from '../../../services/faturas';
import { ProdutoApi } from '../../../services/produtos';
import { createItemFatura } from '../../../services/itemFatura';
import { getClientes } from '../../../services/clientes';
import { getProdutosAll } from '../../../services/produtos';

/* ===================== TIPOS ===================== */

interface Cliente {
  id: string; // UUID
  nome: string;
}

interface ItemForm {
  id: string;
  produtoId: string;
  quantidade: number;
}

interface FormFatura {
  clienteId: string;
  numero: string;
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
    numero: '',
    dataEmissao: '',
    dataVencimento: '',
    status: 'pendente',
    tipo: 'fatura',
  });

  /* ===================== LOAD DADOS ===================== */

  useEffect(() => {
    async function loadData() {
      const [c, p] = await Promise.all([getClientes(), getProdutosAll()]);
    console.log(clientes);
      setClientes(c);
      setProdutos(p);
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
      item.quantidade * prod.valor_unitario * (1 + prod.imposto / 100)
    );
  }, 0);

  /* ===================== SALVAR ===================== */

  const salvarFatura = async () => {
    if (!form.clienteId || !form.numero || !form.dataEmissao || !form.dataVencimento) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (itens.length === 0) {
      alert('Adicione pelo menos um item');
      return;
    }

    if (itens.some(i => !i.produtoId || i.quantidade <= 0)) {
      alert('Todos os itens devem ter produto e quantidade válida');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Criar fatura
      const fatura = await createFatura({
        cliente_id: form.clienteId,
        numero: form.numero,
        data_emissao: form.dataEmissao,
        data_vencimento: form.dataVencimento,
        status: form.status,
        tipo: form.tipo,
      });

for (const item of itens) {
  const produto = produtos.find(p => p.id === item.produtoId);
  if (!produto) continue; // evita erro caso produto não exista

  await createItemFatura(fatura.id, {
    produto_id: produto.id,
    descricao: produto.nome,
    quantidade: item.quantidade,
    valor_unitario: produto.valor_unitario,
    imposto: produto.imposto,
  });
}


      alert('Fatura criada com sucesso');
      router.push('/dashboard/Faturas');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar fatura');
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */

  return (
    <MainEmpresa>
      <div className="max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold text-[#123859]">Criar Fatura</h1>

        {/* FORMULÁRIO */}
        <div className="bg-white p-6 rounded shadow space-y-4">
          {/* CLIENTE */}
          <div>
            <label htmlFor="clienteId" className="font-semibold">
              Cliente
            </label>
            <select
              id="clienteId"
              name="clienteId"
              className="border p-2 rounded w-full"
              value={form.clienteId}
              onChange={e => handleChange('clienteId', e.target.value)}
            >
              <option value="">Selecione o cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* NÚMERO */}
          <div>
            <label htmlFor="numeroFatura" className="font-semibold">
              Número da Fatura
            </label>
            <input
              id="numeroFatura"
              name="numero"
              type="text"
              className="border p-2 rounded w-full"
              value={form.numero}
              onChange={e => handleChange('numero', e.target.value)}
              placeholder="Número da Fatura"
            />
          </div>

          {/* DATAS */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dataEmissao" className="font-semibold">
                Data de Emissão
              </label>
              <input
                id="dataEmissao"
                name="data_emissao"
                type="date"
                className="border p-2 rounded w-full"
                value={form.dataEmissao}
                onChange={e => handleChange('dataEmissao', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="dataVencimento" className="font-semibold">
                Data de Vencimento
              </label>
              <input
                id="dataVencimento"
                name="data_vencimento"
                type="date"
                className="border p-2 rounded w-full"
                value={form.dataVencimento}
                onChange={e => handleChange('dataVencimento', e.target.value)}
              />
            </div>
          </div>

          {/* STATUS & TIPO */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="statusFatura" className="font-semibold">
                Status
              </label>
              <select
                id="statusFatura"
                name="status"
                className="border p-2 rounded w-full"
                value={form.status}
                onChange={e =>
                  handleChange('status', e.target.value as FormFatura['status'])
                }
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label htmlFor="tipoFatura" className="font-semibold">
                Tipo
              </label>
              <select
                id="tipoFatura"
                name="tipo"
                className="border p-2 rounded w-full"
                value={form.tipo}
                onChange={e =>
                  handleChange('tipo', e.target.value as FormFatura['tipo'])
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
          <h2 className="font-semibold text-lg">Itens da Fatura</h2>
          {itens.map((item, i) => {
            const produtoSelecionado = produtos.find(p => p.id === item.produtoId);
            return (
              <div key={item.id} className="grid grid-cols-6 gap-2 items-center">
                <label htmlFor={`produto-${i}`} className="sr-only">
                  Produto
                </label>
                <select
                  id={`produto-${i}`}
                  value={item.produtoId}
                  onChange={e => updateItem(i, 'produtoId', e.target.value)}
                  className="border p-2 rounded col-span-2"
                >
                  <option value="">Selecione o produto</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (€{p.valor_unitario.toFixed(2)} + {p.imposto}%)
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
                  onChange={e => updateItem(i, 'quantidade', Number(e.target.value))}
                />

                <div className="flex items-center justify-between col-span-2">
                  <span className="text-gray-700 font-medium">
                    {produtoSelecionado
                      ? `€${(item.quantidade * produtoSelecionado.valor_unitario * (1 + produtoSelecionado.imposto / 100)).toFixed(2)}`
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
            type="button"
            onClick={salvarFatura}
            className="bg-[#123859] text-white px-6 py-2 rounded"
          >
            {loading ? 'Salvando...' : 'Criar Fatura'}
          </button>
          <button
            type="button"
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
