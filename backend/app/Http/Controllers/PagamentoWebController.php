<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pagamento;
use App\Models\Fatura;
use Illuminate\Support\Str;

class PagamentoWebController extends Controller
{
    /**
     * Listar pagamentos de uma fatura
     */
    public function index($fatura_id)
    {
        $fatura = $this->findTenantFatura($fatura_id);
        $pagamentos = $fatura->pagamentos()->get();

        return view('tenant.pagamentos.index', compact('pagamentos', 'fatura'));
    }

    /**
     * Formulário para criar pagamento
     */
    public function create($fatura_id = null)
    {
        $tenantId = app('tenant')->id;
        $faturas = $fatura_id ? [] : Fatura::where('tenant_id', $tenantId)->get();

        return view('tenant.pagamentos.create', compact('fatura_id', 'faturas'));
    }

    /**
     * Salvar novo pagamento
     */
    public function store(Request $request, $fatura_id)
    {
        $fatura = $this->findTenantFatura($fatura_id);
        $tenantId = app('tenant')->id;

        $request->validate([
            'data_pagamento' => 'required|date',
            'valor_pago' => 'required|numeric|min:0',
            'valor_troco' => 'nullable|numeric|min:0',
            'valor_total_desconto' => 'nullable|numeric|min:0',
            'metodo_pagamento' => 'required|in:dinheiro,transferencia,cartao,pix,boleto',
        ]);

        $fatura->pagamentos()->create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'data_pagamento' => $request->data_pagamento,
            'valor_pago' => $request->valor_pago,
            'valor_troco' => $request->valor_troco ?? 0,
            'valor_total_desconto' => $request->valor_total_desconto ?? 0,
            'metodo_pagamento' => $request->metodo_pagamento,
            'status' => 'pendente',
        ]);

        return redirect()
            ->route('tenant.faturas.pagamentos.index', $fatura_id)
            ->with('success', 'Pagamento registrado com sucesso!');
    }

    /**
     * Formulário para editar pagamento
     */
    public function edit($fatura_id, $id)
    {
        $this->findTenantFatura($fatura_id);
        $pagamento = $this->findTenantPagamento($id);

        return view('tenant.pagamentos.edit', compact('pagamento', 'fatura_id'));
    }

    /**
     * Atualizar pagamento
     */
    public function update(Request $request, $fatura_id, $id)
    {
        $this->findTenantFatura($fatura_id);
        $pagamento = $this->findTenantPagamento($id);

        $request->validate([
            'data_pagamento' => 'required|date',
            'valor_pago' => 'required|numeric|min:0',
            'valor_troco' => 'nullable|numeric|min:0',
            'valor_total_desconto' => 'nullable|numeric|min:0',
            'metodo_pagamento' => 'required|in:dinheiro,transferencia,cartao,pix,boleto',
            'status' => 'nullable|in:pendente,confirmado,cancelado',
        ]);

        $pagamento->update([
            'data_pagamento' => $request->data_pagamento,
            'valor_pago' => $request->valor_pago,
            'valor_troco' => $request->valor_troco ?? $pagamento->valor_troco,
            'valor_total_desconto' => $request->valor_total_desconto ?? $pagamento->valor_total_desconto,
            'metodo_pagamento' => $request->metodo_pagamento,
            'status' => $request->status ?? $pagamento->status,
        ]);

        return redirect()
            ->route('tenant.faturas.pagamentos.index', $fatura_id)
            ->with('success', 'Pagamento atualizado com sucesso!');
    }

    /**
     * Remover pagamento
     */
    public function destroy($fatura_id, $id)
    {
        $this->findTenantFatura($fatura_id);
        $pagamento = $this->findTenantPagamento($id);
        $pagamento->delete();

        return redirect()
            ->route('tenant.faturas.pagamentos.index', $fatura_id)
            ->with('success', 'Pagamento removido com sucesso!');
    }

    /**
     * Listar todos os pagamentos do tenant
     */
    public function all()
    {
        $tenantId = app('tenant')->id;
        $pagamentos = Pagamento::where('tenant_id', $tenantId)->get();

        return view('tenant.pagamentos.index', compact('pagamentos'));
    }

    /**
     * MÉTODO PRIVADO: Buscar fatura do tenant atual
     */
    private function findTenantFatura($id)
    {
        $tenantId = app('tenant')->id;
        return Fatura::where('tenant_id', $tenantId)->where('id', $id)->firstOrFail();
    }

    /**
     * MÉTODO PRIVADO: Buscar pagamento do tenant atual
     */
    private function findTenantPagamento($id)
    {
        $tenantId = app('tenant')->id;
        return Pagamento::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();
    }
}
