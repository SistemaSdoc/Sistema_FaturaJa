'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthProvider";


// ---------------- SPINNER ----------------
const Spinner = () => (
  <div className="flex flex-col justify-center items-center space-y-4">
    <div className="w-16 h-16 border-4 border-t-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="text-gray-700 text-lg font-medium">Carregando seu dashboard...</p>
  </div>
);

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading] = useState(true);

  // ---------------- USE EFFECT ----------------
  useEffect(() => {
    if (authLoading) return;

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
  }, [user, authLoading, router]);

  // ---------------- RENDER ----------------
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-2">
        <Spinner />
        <p className="text-red-500 text-lg font-medium">
          Usuário não encontrado. Redirecionando...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-2">
      <Spinner />
      <p className="text-gray-700 text-lg font-medium">Redirecionando para seu dashboard...</p>
    </div>
  );
}
