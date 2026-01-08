'use client';

import Link from 'next/link';
import React, { ReactNode, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  LogOut,
  Bell,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  FileText,
  CreditCard,
  Package,
  BarChart2,
  Settings,
  UserCircle,
  Building2,
} from 'lucide-react';

import { useAuth } from '../context/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';

/* ================= TIPAGENS ================= */

type UserRole = 'admin' | 'empresa' | 'cliente';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  exact?: boolean;
}

interface MainEmpresaProps {
  children: ReactNode;
  empresa?: {
    logo?: string | null;
    email?: string;
    nif?: string;
    name?: string;
  } | null;
}

/* ================= MENUS ================= */

const adminMenu: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard/Admin', icon: <Home size={18} />, exact: true },
  { label: 'Empresas', path: '/dashboard/Admin/empresas', icon: <Building2 size={18} /> },
  { label: 'Relatórios', path: '/dashboard/Admin/relatorios', icon: <BarChart2 size={18} /> },
  { label: 'Configurações', path: '/dashboard/Admin/configuracoes', icon: <Settings size={18} /> },
];

const empresaMenu: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <Home size={18} />, exact: true },
  { label: 'Faturas', path: '/dashboard/Faturas', icon: <FileText size={18} /> },
  { label: 'Perfil', path: '/dashboard/Clientes', icon: <UserCircle size={18} /> },
  { label: 'Produtos', path: '/dashboard/Produtos', icon: <Package size={18} /> },
  { label: 'Pagamentos', path: '/dashboard/Pagamentos', icon: <CreditCard size={18} /> },
  { label: 'Relatórios', path: '/dashboard/Relatorios', icon: <BarChart2 size={18} /> },
  { label: 'Configurações', path: '/dashboard/Configuracoes', icon: <Settings size={18} /> },
];

const clienteMenu: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard/cliente', icon: <Home size={18} />, exact: true },
  { label: 'Faturas', path: '/dashboard/cliente/faturas', icon: <FileText size={18} /> },
  { label: 'Pagamentos', path: '/dashboard/cliente/pagamentos', icon: <CreditCard size={18} /> },
  { label: 'Perfil', path: '/dashboard/cliente/perfil', icon: <UserCircle size={18} /> },
];

/* ================= COMPONENT ================= */

export default function MainEmpresa({ children, empresa }: MainEmpresaProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { user, tenant, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = useMemo<MenuItem[]>(() => {
    if (user?.role === 'admin') return adminMenu;
    if (user?.role === 'cliente') return clienteMenu;
    return empresaMenu;
  }, [user?.role]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--primary)]">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          h-screen flex flex-col
          bg-[var(--surface)] shadow-md
          transition-all duration-300
          ${collapsed ? 'md:w-20' : 'md:w-64'}
          w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* TOPO */}
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6">
            {empresa?.logo && (
              <img
                src={empresa.logo}
                alt={empresa.name ?? 'Logo'}
                className="h-12 w-12 rounded-full"
              />
            )}
            {!collapsed && (
              <div>
                <span className="font-bold text-lg hidden md:block">
                  {empresa?.name ?? tenant ?? 'Minha Empresa'}
                </span>
                {empresa?.email && (
                  <span className="text-gray-600 hidden md:block text-sm">
                    {empresa.email}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => setCollapsed(v => !v)}
              className="ml-auto hidden md:flex p-1 rounded hover:bg-gray-200"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* MENU */}
          <nav className="flex flex-col gap-2">
            {menuItems.map(item => {
              const isActive = item.exact
                ? pathname === item.path
                : pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 p-2 rounded transition
                    ${collapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'bg-[var(--accent)] text-white'
                      : 'hover:bg-[var(--accent)]/10'}
                  `}
                >
                  <span className="text-[#F9941F]">{item.icon}</span>
                  {!collapsed && <span className="hidden md:inline">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* LOGOUT EM BAIXO */}
        <div className="mt-auto p-4">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded bg-[var(--accent)] text-white flex items-center justify-center gap-2"
          >
            <LogOut size={16} className="text-[#F9941F]" />
            {!collapsed && <span className="hidden md:inline">Logout</span>}
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
        <header className="flex items-center bg-[var(--surface)] shadow px-4 py-3">
          <button
          
  aria-label="Remover item"
            onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden p-2 rounded hover:bg-[var(--accent)]/20"
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <button onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Bell size={20} className="hidden sm:block" />

            <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
              {user?.name?.[0] ?? 'U'}
            </div>

            <span className="font-medium hidden md:block">{user?.name}</span>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
