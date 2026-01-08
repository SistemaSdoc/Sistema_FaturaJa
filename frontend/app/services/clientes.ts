// services/clientes.ts
import axios from "./axios"; // seu axios configurado com baseURL e headers

/* ===================== TIPOS ===================== */

export interface Cliente {
  id: string;          // UUID
  nome: string;
  email?: string;
  telefone?: string;
  tipo_cliente: "empresa" | "consumidor_final";
  nif: string;
}

/* ===================== FUNÇÕES ===================== */

/**
 * Listar todos os clientes do tenant atual
 */
export const getClientes = async (): Promise<Cliente[]> => {
  const res = await axios.get("/clientes");
  return res.data;
};

/**
 * Criar novo cliente
 */
export const createCliente = async (cliente: Omit<Cliente, "id">): Promise<Cliente> => {
  const res = await axios.post("/clientes", cliente);
  return res.data.data; // conforme seu controller, o cliente vem em res.data.data
};

/**
 * Atualizar cliente existente
 */
export const updateCliente = async (id: string, cliente: Omit<Cliente, "id">): Promise<Cliente> => {
  const res = await axios.put(`/clientes/${id}`, cliente);
  return res.data.data;
};

/**
 * Remover cliente
 */
export const deleteCliente = async (id: string): Promise<void> => {
  await axios.delete(`/clientes/${id}`);
};
