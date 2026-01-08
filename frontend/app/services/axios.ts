// services/axios.ts
import axios, { InternalAxiosRequestConfig } from "axios";

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
  subdomain: string; // 🔴 STRING OBRIGATÓRIA
  logo?: string | null;
  email?: string;
  nif?: string;
  permissions?: string[]; // adiciona permissões da empresa
}

export interface AuthResponse {
  success?: boolean;
  user?: User;
  tenant?: Tenant;
  token?: string;
  redirect?: string;
  message?: string;
  empresa?: string;
}

/* ================= ENV ================= */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL; // http://app.faturaja.sdoca:3000

if (!APP_URL) throw new Error("NEXT_PUBLIC_APP_URL não definida");

/* ================= AXIOS BASE ================= */
const tenant = typeof window !== "undefined"
  ? localStorage.getItem("tenant") || "public"
  : "public";

const api = axios.create({
  baseURL: `http://${tenant}.faturaja.sdoca:8000/api`,
  timeout: 190000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ================= INTERCEPTORS ================= */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === "undefined") return config;

  const token = localStorage.getItem("token");
  const tenant = localStorage.getItem("tenant");
  const role = localStorage.getItem("role");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenant) config.headers["X-Tenant"] = tenant;

  console.log(" REQUEST", config.url, { token, tenant, role });

  return config;
});

/* ================= LOGIN ================= */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/login", {
    email,
    password,
  });

  console.log("🔐 LOGIN RESPONSE:", data);

  if (!data.token || !data.tenant?.subdomain) {
    throw new Error("Resposta inválida do login");
  }

  // ✅ GUARDA NO LOCALSTORAGE
  
  localStorage.setItem("token", data.token);
  localStorage.setItem("tenant", data.tenant.subdomain);
  if (data.user?.role) {
    localStorage.setItem("role", data.user.role); // 🔹 adiciona role
  }
  localStorage.setItem("user", JSON.stringify(data.user));

  const redirect = `http://${data.tenant.subdomain}.app.faturaja.sdoca:3000/dashboard`;
  console.log("➡️ REDIRECT FINAL:", redirect);

  return {
    ...data,
    redirect,
  };
}

/* ================= LOGOUT ================= */
export async function logout() {
  await api.post("/logout");
  localStorage.clear();
  window.location.href = "/login";
}

/* ================= FUNÇÃO ME ================= */
export async function fetchTenantMe(): Promise<Tenant> {
  const { data } = await api.get<{ tenant: Tenant }>("/empresa/me");
  return data.tenant;
}

export default api;
/* ================= TIPOS DE KPIS ================= */
export interface TenantKpis {
  faturamentoMensal: number;     // Ex: total faturado no mês
  totalClientes: number;          // Ex: número de clientes
  pagamentosPendentes: number;    // Ex: pagamentos pendentes
  novasFaturas: number;           // Ex: faturas criadas recentemente
  
}

/* ================= FUNÇÃO KPIS ================= */
export async function fetchTenantKpis(): Promise<TenantKpis> {
  const { data } = await api.get<{ kpis: TenantKpis }>("/empresa/kpis");
  return data.kpis;
}