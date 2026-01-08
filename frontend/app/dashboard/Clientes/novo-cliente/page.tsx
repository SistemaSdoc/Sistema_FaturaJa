// app/dashboard/clientes/criar/page.tsx
'use client';

import React from "react";
import MainLayout from "@/app/components/MainEmpresa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthProvider";
import axios from "axios";

/* ================= TIPOS ================= */
interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
}

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  cliente?: Cliente;
}

/* ================= PÁGINA ================= */
export default function CriarClientePage(): JSX.Element {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 🔹 Protege a rota: somente empresa/admin
  React.useEffect(() => {
    if (!loading) {
      if (!user || (user.role !== "empresa" && user.role !== "admin")) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <MainLayout>
        <div className="p-6 text-center">Carregando...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8 border border-[#E5E5E5]">
          <h1 className="text-2xl font-bold text-[#123859] mb-6 text-center">
            Criar Novo Cliente
          </h1>
          <ClienteForm />
        </div>
      </div>
    </MainLayout>
  );
}

/* ================= FORMULÁRIO ================= */
function ClienteForm(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = React.useState<ClienteFormData>({
    nome: "",
    email: "",
    telefone: "",
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post<ApiResponse>(
          `${baseURL}/api/clientes`,
        form,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // token do AuthProvider
          },
        }
      );

      if (!response.data.success) {
        setError(response.data.message || "Erro ao criar cliente");
        return;
      }

      alert("Cliente criado com sucesso!");
      router.push("/dashboard/clientes");
    } catch (err) {
      console.error(err);
      setError("Erro de rede ou servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Nome */}
      <div>
        <label className="block text-sm font-semibold text-[#123859] mb-1">Nome do Cliente</label>
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          type="text"
          className="w-full p-3 rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#123859]"
          placeholder="Digite o nome completo"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-[#123859] mb-1">Email</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          className="w-full p-3 rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#123859]"
          placeholder="exemplo@email.com"
          required
        />
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-sm font-semibold text-[#123859] mb-1">Número de Telefone</label>
        <input
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
          type="tel"
          className="w-full p-3 rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#123859]"
          placeholder="Digite o número"
          required
        />
      </div>

      {/* Botões */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => router.push("/dashboard/clientes")}
          className="px-4 py-2 rounded-xl border font-semibold text-[#F9941F] hover:bg-[#FFF4E6]"
        >
          Voltar
        </button>

        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-[#123859] text-white font-semibold hover:bg-[#0f2d46] transition"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar Cliente"}
        </button>
      </div>
    </form>
  );
}
