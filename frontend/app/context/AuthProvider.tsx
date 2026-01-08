'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, logout as apiLogout, AuthResponse, User, Tenant } from '../services/axios';

/* ================= TIPOS ================= */

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

/* ================= CONTEXT ================= */

export interface AuthContextType {
  user: AuthUser | null;
  empresa: EmpresaInfo | null;
  tenant: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= TYPE GUARDS ================= */

function hasValidTenant(tenant: Tenant | undefined): tenant is Tenant & { subdomain: string } {
  return typeof tenant?.subdomain === 'string' && tenant.subdomain.length > 0;
}

function hasValidUser(user: User | undefined): user is User {
  return typeof user?.id === 'string' && typeof user?.name === 'string' && typeof user?.role === 'string';
}

function hasValidToken(token: string | undefined): token is string {
  return typeof token === 'string' && token.length > 0;
}

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);
  const [tenant, setTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOGIN ================= */
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);

      if (!data.success) throw new Error(data.message ?? 'Falha no login');
      if (!hasValidUser(data.user)) throw new Error('Usuário inválido retornado pela API');
      if (!hasValidTenant(data.tenant)) throw new Error('Tenant inválido retornado pela API');
      if (!hasValidToken(data.token)) throw new Error('Token inválido retornado pela API');

      // ✅ USER
      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };
      setUser(authUser);

      // ✅ TENANT
      setTenant(data.tenant.subdomain);

      // ✅ EMPRESA
      const empresaFromTenant: EmpresaInfo = {
        logo: data.tenant.logo ?? null,
        email: data.tenant.email ?? undefined,
        nif: data.tenant.nif ?? undefined,
      };
      setEmpresa(empresaFromTenant);

      // 🔐 STORAGE
      localStorage.setItem('token', data.token);
      localStorage.setItem('tenant', data.tenant.subdomain);
      localStorage.setItem('empresa', JSON.stringify(empresaFromTenant));
      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('role', authUser.role);

      return data;
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setEmpresa(null);
      setTenant(null);
      localStorage.removeItem('token');
      localStorage.removeItem('tenant');
      localStorage.removeItem('empresa');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setLoading(false);
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const tenantSubdomain = localStorage.getItem('tenant');
    const empresaStr = localStorage.getItem('empresa');
    const userStr = localStorage.getItem('user');
    const roleStr = localStorage.getItem('role');

    if (token && tenantSubdomain && userStr && roleStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        parsedUser.role = roleStr; // garante role consistente
        setUser(parsedUser as AuthUser);
      } catch {
        setUser(null);
      }

      setTenant(tenantSubdomain);

      if (empresaStr) {
        try {
          const parsedEmpresa = JSON.parse(empresaStr);
          if (parsedEmpresa && typeof parsedEmpresa === 'object') {
            setEmpresa(parsedEmpresa as EmpresaInfo);
          }
        } catch {
          setEmpresa(null);
        }
      }
    }

    setLoading(false);
  }, []);

  /* ================= PROVIDER ================= */
  return (
    <AuthContext.Provider value={{ user, empresa, tenant, loading, login, logout }}>
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
