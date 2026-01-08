'use client';

import MainAdmin from '../../../components/MainEmpresa';
import {
    Building2,
    FileText,
    DollarSign,
    TrendingUp,
    Users,
    Download,
} from 'lucide-react';

export default function AdminRelatoriosPage() {
    return (
        <MainAdmin>
            <div className="space-y-6">

                {/* ===== CABEÇALHO ===== */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--primary)]">
                            Relatórios do Sistema
                        </h1>
                        <p className="text-sm text-gray-500">
                            Visão global de todas as empresas registadas
                        </p>
                    </div>

                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--accent)] text-white hover:opacity-90 transition">
                        <Download size={18} />
                        Exportar relatório
                    </button>
                </div>

                {/* ===== CARDS GERAIS ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                    <div className="bg-[var(--surface)] rounded shadow p-4 flex items-center gap-4">
                        <div className="p-3 rounded bg-[var(--accent)]/20 text-[#F9941F]">
                            <Building2 />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Empresas</p>
                            <h3 className="text-xl font-bold">28</h3>
                        </div>
                    </div>

                    <div className="bg-[var(--surface)] rounded shadow p-4 flex items-center gap-4">
                        <div className="p-3 rounded bg-[var(--accent)]/20 text-[#F9941F]">
                            <Users />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Clientes</p>
                            <h3 className="text-xl font-bold">1.420</h3>
                        </div>
                    </div>

                    <div className="bg-[var(--surface)] rounded shadow p-4 flex items-center gap-4">
                        <div className="p-3 rounded bg-[var(--accent)]/20 text-[#F9941F]">
                            <FileText />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Faturas</p>
                            <h3 className="text-xl font-bold">9.384</h3>
                        </div>
                    </div>

                    <div className="bg-[var(--surface)] rounded shadow p-4 flex items-center gap-4">
                        <div className="p-3 rounded bg-[var(--accent)]/20 text-[#F9941F]">
                            <DollarSign />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Volume Total</p>
                            <h3 className="text-xl font-bold">Kz 1.2 B</h3>
                        </div>
                    </div>

                    <div className="bg-[var(--surface)] rounded shadow p-4 flex items-center gap-4">
                        <div className="p-3 rounded bg-[var(--accent)]/20 text-[#F9941F]">
                            <TrendingUp />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Crescimento</p>
                            <h3 className="text-xl font-bold">+24%</h3>
                        </div>
                    </div>

                </div>

                {/* ===== TABELA POR EMPRESA ===== */}
                <div className="bg-[var(--surface)] rounded shadow overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left">Empresa</th>
                                <th className="px-4 py-3 text-left">Faturas</th>
                                <th className="px-4 py-3 text-left">Receita</th>
                                <th className="px-4 py-3 text-left">Clientes</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr className="border-t">
                                <td className="px-4 py-3 font-medium">AngoTech Lda</td>
                                <td className="px-4 py-3">1.245</td>
                                <td className="px-4 py-3">Kz 185.000.000</td>
                                <td className="px-4 py-3">320</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                                        Ativa
                                    </span>
                                </td>
                            </tr>

                            <tr className="border-t">
                                <td className="px-4 py-3 font-medium">FarmaVida</td>
                                <td className="px-4 py-3">842</td>
                                <td className="px-4 py-3">Kz 96.300.000</td>
                                <td className="px-4 py-3">210</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                                        Ativa
                                    </span>
                                </td>
                            </tr>

                            <tr className="border-t">
                                <td className="px-4 py-3 font-medium">Comercial X</td>
                                <td className="px-4 py-3">412</td>
                                <td className="px-4 py-3">Kz 42.800.000</td>
                                <td className="px-4 py-3">98</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                                        Teste
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </MainAdmin>
    );
}
