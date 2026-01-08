// services/faturas.ts
import api from './axios';

/* ================= TIPAGENS ================= */

export interface Cliente {
  id: string;
  nome: string;
  nif: string;
}

export interface ItemFatura {
  id: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  imposto: number;
}

export interface Fatura {
  id: string;
  numero: string;
  serie: string;
  status: 'pendente' | 'pago' | 'cancelado';
  data_emissao: string;
  data_vencimento: string;
  valor_total: number;
  notas?: string; 

  cliente: Cliente;
  itens: ItemFatura[];

  created_at: string;
  updated_at: string;
}
export interface produtos {
  id: string;
  nome: string;
  quantidade: number;
  preco_unitario: number;
  imposto: number;
}

/* ================= FUNÇÕES ================= */

/**
 * Listar todas as faturas do tenant
 */
export async function getFaturasAll(): Promise<Fatura[]> {
  const { data } = await api.get<Fatura[]>('/faturas');
  return data;
}

/**
 * Obter uma fatura específica
 */
export async function getFatura(faturaId: string): Promise<Fatura> {
  const { data } = await api.get<Fatura>(`/faturas/${faturaId}`);
  return data;
}

/**
 * Criar nova fatura
 */
export async function createFatura(fatura: {
  cliente_id: string;
  numero: string;
  data_emissao: string;
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'cancelado';
  tipo: 'proforma' | 'fatura' | 'recibo';
}): Promise<Fatura> {
  const { data } = await api.post<Fatura>('/faturas', fatura);
  return data;
}

/**
 * Atualizar fatura
 */
export async function updateFatura(
  faturaId: string,
  fatura: Partial<{
    data_emissao: string;
    data_vencimento: string;
    status: 'pendente' | 'pago' | 'cancelado';
    tipo: 'proforma' | 'fatura' | 'recibo';
  }>
): Promise<Fatura> {
  const { data } = await api.put<Fatura>(`/faturas/${faturaId}`, fatura);
  return data;
}

/**
 * Deletar fatura
 */
export async function deleteFatura(
  faturaId: string
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/faturas/${faturaId}`);
  return data;
}
