import axios, { InternalAxiosRequestConfig  } from "axios";

/* ================= TIPAGENS ================= */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "empresa" | "cliente";
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  logo:string;
  nif: string;
}

export interface AuthResponse {
  user?: User;
  tenant?: Tenant;
  token?: string;
  redirect?: string;
  message?: string;
}

export interface TenantKpis {
  totalFaturas: number;
  totalPagamentos: number;
  receitaSemana: { dia: string; receita: number }[];
}

export interface Fatura {
  id: number;
  numero: string;
  cliente?: { id: string; nome: string };
  valor_total: number;
  status: "pendente" | "pago" | "cancelado";
  data_emissao: string;
  data_vencimento: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: string;
}

export interface Pagamento {
  id: number;
  fatura?: Fatura;
  valor_pago: number;
  status: "pendente" | "pago" | "cancelado";
}

export interface VendaCategoria {
  categoria: string;
  vendas: number;
}

/* ================= AXIOS LOGIN (LANDLORD) ================= */
export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // ex: http://faturaja.sdoca:8000/api
  timeout: 990000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ================= AXIOS TENANT ================= */
const api = axios.create({
  timeout: 990000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ================= INTERCEPTOR (CORRETO) ================= */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window === "undefined") return config;

    const token = localStorage.getItem("token");
    const tenant = localStorage.getItem("tenant");

    // 🔹 Prioriza tenant do localStorage
    if (tenant) {
      config.baseURL = `http://${tenant}.faturaja.sdoca:8000/api`;
      config.headers?.set("X-Tenant", tenant); // caso o backend use header
    } else {
      // se não houver tenant, pega do hostname
      const host = window.location.hostname;
      const subdomain = host.split(".")[0];
      if (subdomain === "app") {
        config.baseURL = process.env.NEXT_PUBLIC_API_URL;
      } else {
        config.baseURL = `http://${subdomain}.faturaja.sdoca:8000/api`;
      }
    }

    if (token) {
      config.headers?.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= LOGIN ================= */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await authApi.post<AuthResponse>("/login", {
    email,
    password,
  });

  console.log("Login response:", data);
  return data;
}

/* ================= LOGOUT ================= */
export async function logout(): Promise<void> {
  await api.post("/logout");
}

/* ================= FETCH TENANT ME ================= */
export async function fetchTenantMe(): Promise<Tenant> {
  const { data } = await api.get<{ tenant: Tenant }>("/empresa/me");

  if (!data?.tenant) {
    throw new Error("Tenant não encontrado");
  }

  return data?.tenant ?? null;
}

/* ================= FETCH KPIS ================= */
export async function fetchTenantKpis(): Promise<TenantKpis> {
  const { data } = await api.get<{ kpis: TenantKpis }>("/empresa/kpis");

  if (!data?.kpis) {
    throw new Error("KPIs não encontrados");
  }

  return data.kpis;
}

/* ================= FETCH VENDAS POR CATEGORIA ================= */
export async function fetchVendasCategorias(): Promise<VendaCategoria[]> {
  const { data } = await api.get<{ data: VendaCategoria[] }>(
    "/empresa/vendas-categorias"
  );

  return Array.isArray(data?.data) ? data.data : [];
}

/* ================= FETCH FATURAS ================= */
export async function getFaturasAll(): Promise<Fatura[]> {
  const { data } = await api.get<{ data: Fatura[] }>("/faturas");
  return Array.isArray(data?.data) ? data.data : [];
}

/* ================= FETCH PAGAMENTOS ================= */
export async function getPagamentosAll(): Promise<Pagamento[]> {
  const { data } = await api.get<{ data: Pagamento[] }>("/pagamentos/all");
  return Array.isArray(data?.data) ? data.data : [];
}

/* ================= FETCH PRODUTOS ================= */
export async function getProdutosAll(): Promise<Produto[]> {
  const { data } = await api.get<{ data: Produto[] }>("/produtos");
  return Array.isArray(data?.data) ? data.data : [];
}

/* ================= CREATE PRODUTO ================= */
export async function createProduto(
  payload: Omit<Produto, "id">
): Promise<Produto> {
  const { data } = await api.post<Produto>("/produtos", payload);
  return data;
}

/* ================= UPDATE PRODUTO ================= */
export async function updateProduto(
  id: string,
  payload: Partial<Produto>
): Promise<Produto> {
  const { data } = await api.put<Produto>(`/produtos/${id}`, payload);
  return data;
}

/* ================= DELETE PRODUTO ================= */
export async function deleteProduto(id: string): Promise<void> {
  await api.delete(`/produtos/${id}`);
}

export default api;