import axios, { InternalAxiosRequestConfig, AxiosRequestHeaders } from "axios";

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
}

export interface AuthResponse {
  user?: User;
  tenant?: Tenant;
  token?: string;
  redirect?: string;
  message?: string;
}

export interface TenantKpis {
  faturamentoMensal: number;
  totalClientes: number;
  pagamentosPendentes: number;
  novasFaturas: number;
  receitaSemana: { dia: string; receita: number }[];
}

/* ================= AXIOS LOGIN (LANDLORD) ================= */
export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 190000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ================= AXIOS TENANT ================= */
const api = axios.create({
  timeout: 550000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ================= INTERCEPTOR ================= */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window === "undefined") return config;

    const token = localStorage.getItem("token");
    const tenant = localStorage.getItem("tenant");

    if (!tenant) {
      console.warn("Tenant não definido. Redirecionando para login.");
      window.location.href = "/login";
      return config;
    }

    // BaseURL dinâmico pelo tenant
    config.baseURL = `http://${tenant}.faturaja.sdoca:8000/api`;

    // Adiciona token
    if (!config.headers) config.headers = {} as AxiosRequestHeaders;
    if (token) (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;

    // ⚡ Adiciona X-Tenant
    (config.headers as AxiosRequestHeaders)["X-Tenant"] = tenant;

    return config;
  },
  (error) => Promise.reject(error)
);


/* ================= LOGIN ================= */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await authApi.post<AuthResponse>("/login", { email, password });

  if (!data.token || !data.tenant?.subdomain) {
    throw new Error("Login inválido");
  }

  // Salva dados no localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("tenant", data.tenant.subdomain);
  localStorage.setItem("user", JSON.stringify(data.user));
  if (data.user?.role) localStorage.setItem("role", data.user.role);

  return {
    ...data,
    redirect: `http://${data.tenant.subdomain}.app.faturaja.sdoca:3000/dashboard`,
  };
}

/* ================= LOGOUT ================= */
export async function logout() {
  try {
    await api.post("/logout");
  } finally {
    localStorage.clear();
    window.location.href = "/login";
  }
}

/* ================= FETCH ME ================= */
export async function fetchTenantMe(): Promise<Tenant> {
  const { data } = await api.get<{ tenant: Tenant }>("/empresa/me");
  return data.tenant;
}

/* ================= FETCH KPIS ================= */
export async function fetchTenantKpis(): Promise<TenantKpis> {
  const { data } = await api.get<{ kpis: TenantKpis }>("/empresa/kpis");
  return data.kpis;
}

export default api;
