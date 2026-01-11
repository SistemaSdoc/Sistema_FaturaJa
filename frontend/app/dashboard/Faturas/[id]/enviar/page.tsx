'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '../../../../components/MainEmpresa';
import { getFatura, Fatura } from '../../../../services/faturas';
import api from '../../../../services/axios';

export default function EnviarFaturaPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  /* ================= LOAD FATURA ================= */
  useEffect(() => {
    async function load() {
      try {
        const data = await getFatura(id);
        setFatura(data);

        setSubject(`Fatura ${data.numero} — FacturaJá`);
        setMessage(
          `Olá ${data.cliente.nome},\n\nSegue em anexo a fatura nº ${data.numero}.\n\nAtenciosamente,\nFacturaJá`
        );
      } catch {
        setError('Erro ao carregar fatura.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  /* ================= ENVIAR ================= */
  const handleSend = async () => {
    setError('');
    setSuccess('');

    if (!toEmail) {
      setError('Informe um email válido.');
      return;
    }

    try {
      setSending(true);

      await api.post(`/faturas/${id}/enviar`, {
        to: toEmail,
        subject,
        message,
      });

      setSuccess('Fatura enviada com sucesso.');
      setTimeout(() => router.push('/dashboard/Faturas'), 1500);
    } catch {
      setError('Erro ao enviar fatura.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p>Carregando...</p>
      </MainLayout>
    );
  }

  if (!fatura) {
    return (
      <MainLayout>
        <p>Fatura não encontrada.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">

        {/* CABEÇALHO */}
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#123859]">
              Enviar Fatura {fatura.numero}
            </h1>
            <p className="text-sm text-gray-500">
              Envio da fatura por email ao cliente
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard/Faturas')}
            className="px-3 py-2 border rounded"
            aria-label="Voltar"
            title="Voltar"
          >
            Voltar
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* FORM */}
        <div className="bg-white p-6 rounded shadow space-y-4">

          {/* EMAIL */}
          <div>
            <label htmlFor="toEmail" className="block font-medium">
              Email do cliente
            </label>
            <input
              id="toEmail"
              type="email"
              value={toEmail}
              onChange={e => setToEmail(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="cliente@exemplo.com"
              title="Email do cliente"
              aria-label="Email do cliente"
              required
            />
          </div>

          {/* ASSUNTO */}
          <div>
            <label htmlFor="subject" className="block font-medium">
              Assunto
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Assunto do email"
              title="Assunto do email"
              aria-label="Assunto do email"
              required
            />
          </div>

          {/* MENSAGEM */}
          <div>
            <label htmlFor="message" className="block font-medium">
              Mensagem
            </label>
            <textarea
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              className="w-full border p-2 rounded"
              placeholder="Mensagem enviada ao cliente"
              title="Mensagem do email"
              aria-label="Mensagem do email"
              required
            />
          </div>

          {/* BOTÕES */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/Faturas/${fatura.id}/editar`)
              }
              className="px-4 py-2 border rounded"
              title="Editar fatura"
              aria-label="Editar fatura"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="px-4 py-2 bg-[#F9941F] text-white rounded disabled:opacity-60"
              title="Enviar fatura por email"
              aria-label="Enviar fatura"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
