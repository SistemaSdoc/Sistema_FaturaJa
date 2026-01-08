// services/pagamentos.ts
import api from './axios';

/* ================= TIPAGENS ================= */

export interface PagamentoApi {
  id: string;
  fatura_id: string;
  data_pagamento: string;
  valor_pago: number;
  valor_troco: number;
  valor_desconto: number;
  metodo_pagamento: 'dinheiro' | 'transferencia' | 'cartao' | 'pix';
  status: 'pendente' | 'confirmado' | 'cancelado';

  fatura?: {
    id: string;
    numero: string;
    valor_total: number;
  };

  created_at?: string;
  updated_at?: string;
}

/* ================= MÉTODOS ================= */

/**
 * Listar pagamentos do tenant
 */
export async function getPagamentosAll(): Promise<PagamentoApi[]> {
  const { data } = await api.get<PagamentoApi[]>('/pagamentos');
  return data;
}

/**
 * Pagamentos de uma fatura
 */
export async function getPagamentosByFatura(
  faturaId: string
): Promise<PagamentoApi[]> {
  const { data } = await api.get<PagamentoApi[]>(
    `/faturas/${faturaId}/pagamentos`
  );
  return data;
}

/**
 * Criar pagamento
 */
export async function createPagamento(
  faturaId: string,
  pagamento: {
    data_pagamento: string;
    valor_pago: number;
    metodo_pagamento: 'dinheiro' | 'transferencia' | 'cartao' | 'pix';
  }
): Promise<PagamentoApi> {
  const { data } = await api.post<PagamentoApi>(
    `/faturas/${faturaId}/pagamentos`,
    pagamento
  );
  return data;
}

/**
 * Atualizar pagamento
 */
export async function updatePagamento(
  faturaId: string,
  pagamentoId: string,
  pagamento: Partial<{
    data_pagamento: string;
    valor_pago: number;
    metodo_pagamento: 'dinheiro' | 'transferencia' | 'cartao' | 'pix';
    status: 'pendente' | 'confirmado' | 'cancelado';
  }>
): Promise<PagamentoApi> {
  const { data } = await api.put<PagamentoApi>(
    `/faturas/${faturaId}/pagamentos/${pagamentoId}`,
    pagamento
  );
  return data;
}

/**
 * Deletar pagamento
 */
export async function deletePagamento(
  faturaId: string,
  pagamentoId: string
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/faturas/${faturaId}/pagamentos/${pagamentoId}`
  );
  return data;
}
