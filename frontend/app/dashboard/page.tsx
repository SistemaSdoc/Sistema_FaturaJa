'use client';

import { useAuth } from "@/app/context/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }

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
          router.replace("/login");
          break;
      }
    }
  }, [user, loading, router]);

  // Spinner moderno com degradê
  const Spinner = () => (
    <div className="flex flex-col justify-center items-center space-y-4">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-700 text-lg font-medium">Carregando seu dashboard...</p>
    </div>
  );

  // Estado de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  // Usuário não encontrado
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-2">
        <Spinner />
        <p className="text-red-500 text-lg font-medium">Usuário não encontrado. Redirecionando...</p>
      </div>
    );
  }

  // Redirecionando
  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-2">
      <Spinner />
      <p className="text-gray-700 text-lg font-medium">Redirecionando para seu dashboard...</p>
    </div>
  );
}
