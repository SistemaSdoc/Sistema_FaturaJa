import api from './axios';

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  tipo_cliente: 'empresa' | 'consumidor_final';
  nif: string;
}

export async function getClientes(): Promise<Cliente[]> {
  const response = await api.get('/clientes');
  return response.data?.data ?? response.data ?? [];
}

export const createCliente = async (
  cliente: Omit<Cliente, 'id'>
): Promise<Cliente> => {
  const res = await api.post('/clientes', cliente);
  return res.data.data;
};

export const updateCliente = async (
  id: string,
  cliente: Omit<Cliente, 'id'>
): Promise<Cliente> => {
  const res = await api.put(`/clientes/${id}`, cliente);
  return res.data.data;
};

export const deleteCliente = async (id: string): Promise<void> => {
  await api.delete(`/clientes/${id}`);
};
