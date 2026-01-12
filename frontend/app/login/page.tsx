'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthProvider";

const COLOR_PRIMARY = "#123859";

/* ---------------- ICON ---------------- */
const InvoiceIcon = ({
  sizeClass = "w-10 h-10",
  color = COLOR_PRIMARY,
}: {
  sizeClass?: string;
  color?: string;
}) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    className={sizeClass}
    style={{ color }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    whileHover={{ scale: 1.1, rotate: 10 }}
    transition={{ type: "spring", stiffness: 200 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </motion.svg>
);

/* ---------------- INPUT ---------------- */
const InputField = ({
  type,
  placeholder,
  value,
  onChange,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required
    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9941F]"
  />
);

/* ---------------- PAGE ---------------- */
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await login(email, password);

      // ✅ Validar tenant e token
      if (!response.token || !response.tenant?.subdomain) {
        setError(response.message ?? "Falha no login");
        return;
      }

      // 🔹 Redirecionar para dashboard interno do Next.js
      router.replace("/dashboard");
    } catch (err) {
      setError("Erro ao efetuar login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-[#123859] via-[#F9941F] to-[#123859] opacity-20 z-0" />

      <motion.div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 p-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <InvoiceIcon sizeClass="w-16 h-16 mb-4 mx-auto" />

        <h2 className="text-2xl font-bold text-center text-[#123859] mb-2">
          Login
        </h2>

        <p className="text-sm text-gray-500 text-center mb-4">
          Entre com seu email e senha
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <InputField
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputField
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-xl font-semibold bg-[#123859] text-white hover:bg-[#0f2b4c] disabled:opacity-50 transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {error && (
          <p className="text-red-600 mt-3 text-center text-sm">{error}</p>
        )}

        <div className="mt-4 text-center text-sm">
          <Link
            href="/register"
            className="text-[#123859] hover:text-[#F9941F]"
          >
            Não tem conta? Cadastre-se
          </Link>
        </div>
      </motion.div>
    </div>
  );
}