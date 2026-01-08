'use client';

import { useAuth } from "@/app/context/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só tenta redirecionar quando carregou user
    if (!loading) {
      if (!user) {
        // Usuário não autenticado → login
        router.replace("/login");
        return;
      }

      // Redireciona de acordo com a role
      switch (user.role) {
        case "admin":
          router.replace("/dashboard/Admin");
          break;
        case "empresa":
          router.replace("/dashboard/Empresa");
          break;
        case "cliente":
          router.replace("/dashboard/Clientes");
          break;
        default:
          router.replace("/login"); // role inválida
          break;
      }
    }
  }, [user, loading, router]);

  // Enquanto carrega user
  if (loading) {
    return <p className="p-6">Carregando...</p>;
  }

  // Se não encontrou user, mostra mensagem rápida antes do redirecionamento
  if (!user) {
    return <p className="p-6 text-red-500">Usuário não encontrado. Redirecionando...</p>;
  }

  // Redirecionando
  return <p className="p-6">Redirecionando para seu dashboard...</p>;
}
