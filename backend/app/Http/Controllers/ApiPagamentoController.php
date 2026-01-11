<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pagamento;
use App\Models\Fatura;

class ApiPagamentoController extends Controller
{
    /**
     * Retorna o tenant atual
     */
    private function tenantId(): string
    {
        return app('tenant')->id;
    }

    /**
     * Buscar pagamento garantindo tenant
     */
    private function findPagamento(string $id)
    {
        return Pagamento::where('id', $id)
            ->where('tenant_id', $this->tenantId())
            ->firstOrFail();
    }

    /**
     * Pagamentos de uma fatura
     */
    public function index(string $faturaId)
    {
        $fatura = Fatura::where('id', $faturaId)
            ->where('tenant_id', $this->tenantId())
            ->firstOrFail();

        return response()->json($fatura->pagamentos);
    }

    /**
     * Todos os pagamentos do tenant
     */
    public function all()
    {
        $pagamentos = Pagamento::where('tenant_id', $this->tenantId())
            ->with('fatura')
            ->get();

        return response()->json($pagamentos);
    }

    /**
     * Criar pagamento
     */
    public function store(Request $request, string $faturaId)
    {
        $fatura = Fatura::where('id', $faturaId)
            ->where('tenant_id', $this->tenantId())
            ->firstOrFail();

        $data = $request->validate([
            'data_pagamento' => 'required|date',
            'valor_pago' => 'required|numeric|min:0',
            'metodo_pagamento' => 'required|in:dinheiro,transferencia,cartao,pix',
        ]);

        $totalPago = $fatura->pagamentos()->sum('valor_pago') + $data['valor_pago'];
        $troco = max(0, $totalPago - $fatura->valor_total);

        $pagamento = $fatura->pagamentos()->create([
            'tenant_id' => $this->tenantId(),
            'data_pagamento' => $data['data_pagamento'],
            'valor_pago' => $data['valor_pago'],
            'valor_troco' => $troco,
            'valor_desconto' => 0,
            'metodo_pagamento' => $data['metodo_pagamento'],
            'status' => 'confirmado',
        ]);

        if ($totalPago >= $fatura->valor_total) {
            $fatura->update(['status' => 'pago']);
        }

        return response()->json($pagamento, 201);
    }

    /**
     * Mostrar pagamento
     */
    public function show(string $faturaId, string $id)
    {
        return response()->json(
            $this->findPagamento($id)->load('fatura')
        );
    }

    /**
     * Atualizar pagamento
     */
    public function update(Request $request, string $faturaId, string $id)
    {
        $pagamento = $this->findPagamento($id);

        $data = $request->validate([
            'data_pagamento' => 'required|date',
            'valor_pago' => 'required|numeric|min:0',
            'metodo_pagamento' => 'required|in:dinheiro,transferencia,cartao,pix',
            'status' => 'required|in:pendente,confirmado,cancelado',
        ]);

        $pagamento->update($data);

        return response()->json($pagamento);
    }

    /**
     * Remover pagamento
     */
    public function destroy(string $faturaId, string $id)
    {
        $pagamento = $this->findPagamento($id);
        $fatura = $pagamento->fatura;

        $pagamento->delete();

        // Atualiza status da fatura
        $totalPago = $fatura->pagamentos()->sum('valor_pago');
        if ($totalPago < $fatura->valor_total) {
            $fatura->update(['status' => 'pendente']);
        }

        return response()->json(['message' => 'Pagamento removido com sucesso']);
    }
}
