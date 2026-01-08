// services/itensFatura.ts
import api from './axios';

// ================= TIPAGENS =================
export interface ItemFatura {
  id: string;
  produto_id?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  imposto: number;
  fatura_id?: string;
  created_at?: string;
  updated_at?: string;
  valor_desconto_unitario?: number;
}

// ================= MÉTODOS =================

/**
 * Listar todos os itens de uma fatura
 */
export const getItensFatura = async (faturaId: string): Promise<ItemFatura[]> => {
  const { data } = await api.get<ItemFatura[]>(`/faturas/${faturaId}/itens`);
  return data;
};

/**
 * Criar item de fatura
 */
export const createItemFatura = async (
  faturaId: string,
  item: Omit<ItemFatura, 'id'>
): Promise<ItemFatura> => {
  const { data } = await api.post<ItemFatura>(`/faturas/${faturaId}/itens`, item);
  return data;
};

/**
 * Atualizar item de fatura
 */
export const updateItemFatura = async (
  faturaId: string,
  itemId: string,
  item: Partial<Omit<ItemFatura, 'id'>>
): Promise<ItemFatura> => {
  const { data } = await api.put<ItemFatura>(`/faturas/${faturaId}/itens/${itemId}`, item);
  return data;
};

/**
 * Deletar item de fatura
 */
export const deleteItemFatura = async (faturaId: string, itemId: string): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`/faturas/${faturaId}/itens/${itemId}`);
  return data;
};
