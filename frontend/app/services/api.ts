import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  timeout: 550000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window === "undefined") return config;

    const token = localStorage.getItem("token");
    const tenant = localStorage.getItem("tenant");

    if (!token || !tenant) {
      console.warn("Token ou tenant ausente. Redirecionando para login.");
      window.location.href = "/login";
      throw new Error("Token ou tenant ausente");
    }

    // 🌐 subdomínio dinâmico
    config.baseURL = `http://${tenant}.faturaja.sdoca:8000/api`;

    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }

    config.headers.Authorization = `Bearer ${token}`;
    config.headers["X-Tenant"] = tenant;

    return config;
  }
);

export default api;
