// services/produtos.ts
import api from "./axios";

/* ================= TIPAGENS ================= */

export interface ProdutoApi {
  id: string;
  nome: string;
  descricao: string | null;
  valor_unitario: number;
  estoque: number | null;
  imposto: number;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}



/* ================= MÉTODOS ================= */

/**
 * Listar produtos do tenant
 */
export async function getProdutosAll(): Promise<ProdutoApi[]> {
  const { data } = await api.get<ProdutoApi[]>("/produtos");
  return data;
}

/**
 * Criar produto
 */
export async function createProduto(produto: {
  nome: string;
  descricao?: string | null;
  valor_unitario: number;
  estoque?: number | null;
  imposto: number;
}): Promise<ProdutoApi> {
  const { data } = await api.post<ProdutoApi>("/produtos", produto);
  return data;
}

/**
 * Atualizar produto
 */
export async function updateProduto(
  produtoId: string,
  produto: Partial<{
    nome: string;
    descricao?: string | null;
    valor_unitario: number;
    estoque?: number | null;
    imposto: number;
  }>
): Promise<ProdutoApi> {
  const { data } = await api.put<ProdutoApi>(`/produtos/${produtoId}`, produto);
  return data;
}

/**
 * Deletar produto
 */
export async function deleteProduto(produtoId: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/produtos/${produtoId}`);
  return data;
}
