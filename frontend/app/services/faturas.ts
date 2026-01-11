// services/faturas.ts
import api from './axios';

/* ================= TIPAGENS ================= */

export interface FaturaCreate {
  cliente_id: string;
  data_emissao: string;
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'cancelado';
  tipo: 'proforma' | 'fatura' | 'recibo';
}

export interface Cliente {
  id: string;
  nome: string;
  nif: string;
}

export interface Produto {
  id: string;
  nome: string;
  preco_unitario: number;
  imposto_percent: number;
}

export interface ItemFatura {
  id: string;
  quantidade: number;
  produto: Produto;
  created_at: string;
  updated_at: string;
}

export interface Fatura {
  id: string;
  numero: string;
  status: 'pendente' | 'pago' | 'cancelado';
  tipo: 'proforma' | 'fatura' | 'recibo';
  data_emissao: string;
  data_vencimento: string;
  valor_total: number; // fornecido pelo backend
  cliente: Cliente;
  itens: ItemFatura[];
  created_at: string;
  updated_at: string;
  nota?: string;
}



/* ================= ENVIO DE FATURA ================= */

export interface EnviarFaturaPayload {
  to: string;
  subject: string;
  message: string;
}


/* ================= FUNÇÕES ================= */

export async function enviarFatura(
  id: string,
  payload: EnviarFaturaPayload
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `/faturas/${id}/send`,
    payload
  );
  return data;
}

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
export async function getFatura(id: string): Promise<Fatura> {
  const { data } = await api.get<Fatura>(`/faturas/${id}`);
  return data;
}

/**
 * Criar uma nova fatura
 */
export async function createFatura(data: FaturaCreate): Promise<Fatura> {
  const { data: fatura } = await api.post<Fatura>('/faturas', data);
  return fatura;
}

/**
 * Atualizar dados da fatura
 */
export async function updateFatura(
  id: string,
  payload: Partial<FaturaCreate>
): Promise<Fatura> {
  const { data } = await api.put<Fatura>(`/faturas/${id}`, payload);
  return data;
}

/**
 * Deletar fatura
 */
export async function deleteFatura(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/faturas/${id}`);
  return data;
}

/* ================= ITENS DA FATURA ================= */

/**
 * Adicionar item à fatura
 */
export async function createItemFatura(
  faturaId: string,
  produto_id: string,
  quantidade: number
) {
  const { data } = await api.post(`/faturas/${faturaId}/itens`, {
    produto_id,
    quantidade,
  });
  return data;
}

/**
 * Remover item da fatura
 */
export async function deleteItemFatura(itemId: string) {
  const { data } = await api.delete(`/faturas/itens/${itemId}`);
  return data;
}

/* ================= NOVO: PAGAR FATURA ================= */
export async function pagarFatura(
  id: string,
  payload: { metodo: 'pix' | 'card' | 'boleto' | 'multicaixa' }
): Promise<{ message: string; fatura: Fatura }> {
  const { data } = await api.post<{ message: string; fatura: Fatura }>(
    `/faturas/${id}/pagar`,
    payload
  );
  return data;
}

/**
 * Obter fatura por ID
 */
export async function getFaturaById(id: string): Promise<Fatura> {
  const { data } = await api.get<Fatura>(`/faturas/${id}`);
  return data;
}

/**
 * Cancelar fatura
 */
export async function cancelarFatura(
  id: string
): Promise<{ message: string; fatura: Fatura }> {
  const { data } = await api.post<{ message: string; fatura: Fatura }>(
    `/faturas/${id}/cancelar`
  );
  return data;
}
