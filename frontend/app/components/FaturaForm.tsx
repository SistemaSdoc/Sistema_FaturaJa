'use client';

import React, { useState } from "react";
import { ProdutoApi } from "@/app/services/produtos";

export interface ProdutoSelecionado {
  id: string;
  quantidade: number;
}

export interface FaturaCreate {
  cliente_id: string;
  nome_cliente: string;
  produtos: ProdutoSelecionado[];
  valor_total: number;
  data_emissao: string;
  data_vencimento: string;
  nifCliente?: string;
  status: "pendente" | "pago" | "cancelado";
  tipo: "fatura" | "proforma" | "recibo";
}

interface FaturaFormProps {
  produtos: ProdutoApi[];
  nifCliente?: string; // se quiser preencher previamente
  onSubmit: (fatura: FaturaCreate) => void;
}

export default function FaturaForm({ produtos, nifCliente, onSubmit }: FaturaFormProps) {
  const [clienteId, setClienteId] = useState<string>("");
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([]);
  const [nif, setNif] = useState<string>(nifCliente ?? "");

  const handleProdutoChange = (produtoId: string, quantidade: number) => {
    setProdutosSelecionados(prev => {
      const exists = prev.find(p => p.id === produtoId);
      if (exists) {
        return prev.map(p => p.id === produtoId ? { ...p, quantidade } : p);
      } else {
        return [...prev, { id: produtoId, quantidade }];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || produtosSelecionados.length === 0) return;

    const valorTotal = produtosSelecionados.reduce((acc, p) => {
      const produto = produtos.find(prod => prod.id === p.id);
      return produto ? acc + produto.valor_unitario * p.quantidade : acc;
    }, 0);

    const novaFatura: FaturaCreate = {
      cliente_id: clienteId,
      nome_cliente: "Cliente", // aqui você pode buscar o nome real do cliente
      produtos: produtosSelecionados,
      valor_total: valorTotal,
      data_emissao: new Date().toISOString().split("T")[0],
      data_vencimento: new Date().toISOString().split("T")[0],
      status: "pendente",
      tipo: "fatura",
      nifCliente: nif, // inclui o NIF
    };

    onSubmit(novaFatura);

    // Limpar formulário
    setClienteId("");
    setProdutosSelecionados([]);
    setNif("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-[#123859] mb-2">Criar Fatura</h2>

      <label htmlFor="clienteId" className="sr-only">ID do Cliente</label>
      <input
        id="clienteId"
        type="text"
        placeholder="ID do Cliente"
        value={clienteId}
        onChange={e => setClienteId(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <label htmlFor="nifCliente" className="sr-only">NIF do Cliente</label>
      <input
        id="nifCliente"
        type="text"
        placeholder="NIF do Cliente"
        value={nif}
        onChange={e => setNif(e.target.value)}
        className="border p-2 rounded"
      />

      <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border p-2 rounded">
        {produtos.map(prod => {
          const quantidadeSelecionada = produtosSelecionados.find(p => p.id === prod.id)?.quantidade ?? "";
          return (
            <div key={prod.id} className="flex justify-between items-center">
              <span>{prod.nome} (€{prod.valor_unitario.toFixed(2)})</span>
              <input
                type="number"
                min={0}
                placeholder="Qtd"
                aria-label={`Quantidade de ${prod.nome}`}
                value={quantidadeSelecionada}
                onChange={e => handleProdutoChange(prod.id, Number(e.target.value) || 0)}
                className="border p-1 rounded w-20"
              />
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        className="bg-[#F9941F] p-2 rounded text-white font-bold mt-2"
      >
        Criar Fatura
      </button>
    </form>
  );
}
