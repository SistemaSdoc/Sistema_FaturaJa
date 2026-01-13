'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, AuthResponse, User, Tenant } from '../services/axios';

export type UserRole = 'admin' | 'empresa' | 'cliente';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}

export interface EmpresaInfo {
  logo?: string | null;
  email?: string;
  nif?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  empresa: EmpresaInfo | null;
  tenant: string | null;
  loading: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);
  const [tenant, setTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  /* ================= LOGIN ================= */
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      setLoading(true);
      try {
        const data = await apiLogin(email, password);

        if (!data.user || !data.tenant || !data.token) {
          throw new Error("Login inválido");
        }

        const authUser: AuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role as UserRole,
        };

        const tenantExtra = data.tenant;

        const empresaInfo: EmpresaInfo = {
          logo: tenantExtra.logo ?? null,
          email: tenantExtra.email ?? undefined,
          nif: tenantExtra.nif ?? undefined,
        };

        // Salva no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('tenant', tenantExtra.subdomain);
        localStorage.setItem('user', JSON.stringify(authUser));
        localStorage.setItem('empresa', JSON.stringify(empresaInfo));
        localStorage.setItem('role', authUser.role);

        // Atualiza estados React
        setUser(authUser);
        setTenant(tenantExtra.subdomain);
        setEmpresa(empresaInfo);

        // 🔹 Redireciona para o subdomínio do tenant
        if (window.location.hostname.startsWith('app.')) {
          window.location.href = `http://${tenantExtra.subdomain}.app.faturaja.sdoca:3000/dashboard/Empresa`;
        }

        return data;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ================= LOGOUT ================= */
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await apiLogout();
    } finally {
      localStorage.clear();
      setUser(null);
      setTenant(null);
      setEmpresa(null);
      setLoading(false);
    }
  }, []);

  /* ================= REHYDRATE ================= */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const tenantStored = localStorage.getItem('tenant');
    const userStored = localStorage.getItem('user');
    const empresaStored = localStorage.getItem('empresa');
    const roleStored = localStorage.getItem('role');

    if (token && tenantStored && userStored && roleStored) {
      try {
        const parsedUser: AuthUser = JSON.parse(userStored);
        parsedUser.role = roleStored as UserRole;

        setUser(parsedUser);
        setTenant(tenantStored);
        setEmpresa(empresaStored ? JSON.parse(empresaStored) : null);
      } catch {
        localStorage.clear();
      }
    } else {
      localStorage.clear();
    }

    setLoading(false);
    setIsReady(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        empresa,
        tenant,
        loading,
        isReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro do AuthProvider');
  return ctx;
}
