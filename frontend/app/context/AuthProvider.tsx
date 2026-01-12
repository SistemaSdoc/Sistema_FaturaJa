'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
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

/* Tenant com campos extras que o backend retorna */
interface TenantWithExtra extends Tenant {
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

function isValidTenant(tenant: Tenant | undefined): tenant is TenantWithExtra {
  return !!tenant && typeof tenant.subdomain === 'string' && tenant.subdomain.length > 0;
}

function isValidUser(user: User | undefined): user is User {
  return !!user && typeof user.id === 'string' && typeof user.name === 'string' && typeof user.role === 'string';
}

function isValidToken(token: string | undefined): token is string {
  return typeof token === 'string' && token.length > 0;
}

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);
  const [tenant, setTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOGIN ================= */
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      setLoading(true);

      try {
        const data = await apiLogin(email, password);

        if (!isValidUser(data.user)) throw new Error('Usuário inválido');
        if (!isValidTenant(data.tenant)) throw new Error('Tenant inválido');
        if (!isValidToken(data.token)) throw new Error('Token inválido');

        const authUser: AuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        };

        const tenantExtra = data.tenant as TenantWithExtra;

        const empresaInfo: EmpresaInfo = {
          logo: tenantExtra.logo ?? null,
          email: tenantExtra.email ?? undefined,
          nif: tenantExtra.nif ?? undefined,
        };

        // 🔐 ÚNICA ESCRITA NO STORAGE
        localStorage.setItem('token', data.token);
        localStorage.setItem('tenant', tenantExtra.subdomain);
        localStorage.setItem('user', JSON.stringify(authUser));
        localStorage.setItem('empresa', JSON.stringify(empresaInfo));
        localStorage.setItem('role', authUser.role);

        // 🧠 STATE
        setUser(authUser);
        setTenant(tenantExtra.subdomain);
        setEmpresa(empresaInfo);

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
      setUser(null);
      setEmpresa(null);
      setTenant(null);

      localStorage.removeItem('token');
      localStorage.removeItem('tenant');
      localStorage.removeItem('user');
      localStorage.removeItem('empresa');
      localStorage.removeItem('role');

      setLoading(false);
    }
  }, []);

  /* ================= INIT (REHYDRATE) ================= */
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const tenantStored = localStorage.getItem('tenant');
      const userStored = localStorage.getItem('user');
      const empresaStored = localStorage.getItem('empresa');
      const roleStored = localStorage.getItem('role');

      if (!token || !tenantStored || !userStored || !roleStored) {
        setLoading(false);
        return;
      }

      const parsedUser: AuthUser = JSON.parse(userStored);
      parsedUser.role = roleStored as UserRole;

      setUser(parsedUser);
      setTenant(tenantStored);

      if (empresaStored) {
        const parsedEmpresa: EmpresaInfo = JSON.parse(empresaStored);
        setEmpresa(parsedEmpresa);
      }
    } catch {
      setUser(null);
      setEmpresa(null);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= PROVIDER ================= */
  return (
    <AuthContext.Provider
      value={{
        user,
        empresa,
        tenant,
        loading,
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
