'use client';

import React, { useState } from "react";
import { Produto } from "@/app/services/produtos";

interface ProdutoFormProps {
  onSubmit: (produto: Omit<Produto, "id" | "tenant_id" | "created_at" | "updated_at">) => void;
}

export default function ProdutoForm({ onSubmit }: ProdutoFormProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState<number>(0);
  const [estoque, setEstoque] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !descricao || preco <= 0) return;

    onSubmit({ nome, descricao, preco, estoque, tipo: "produto" });
    setNome("");
    setDescricao("");
    setPreco(0);
    setEstoque(0);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-[#123859] mb-2">Cadastrar Produto</h2>

      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={e => setNome(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="number"
        placeholder="Preço"
        value={preco}
        onChange={e => setPreco(Number(e.target.value))}
        className="border p-2 rounded"
        required
        min={0}
        step={0.01}
      />
      <input
        type="number"
        placeholder="Estoque"
        value={estoque}
        onChange={e => setEstoque(Number(e.target.value))}
        className="border p-2 rounded"
        required
        min={0}
      />

      <button type="submit" className="bg-[#4ade80] p-2 rounded text-white font-bold mt-2">
        Salvar Produto
      </button>
    </form>
  );
}
