<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ItemFatura;
use App\Models\Fatura;

class ApiItemFaturaController extends Controller
{
    /**
     * Retorna o tenant atual
     */
    private function tenantId(): string
    {
        return app('tenant')->id;
    }

    /**
     * Listar itens de uma fatura
     */
    public function index(string $faturaId)
    {
        $fatura = Fatura::where('tenant_id', $this->tenantId())
            ->with('itens')
            ->findOrFail($faturaId);

        return response()->json($fatura->itens);
    }

    /**
     * Criar item na fatura
     */
    public function store(Request $request, string $faturaId)
    {
        $fatura = Fatura::where('tenant_id', $this->tenantId())
            ->findOrFail($faturaId);

        $request->validate([
            'produto_id'     => 'nullable|uuid',
            'descricao'      => 'required|string|max:255',
            'quantidade'     => 'required|integer|min:1',
            'valor_unitario' => 'required|numeric|min:0',
        ]);

        $item = $fatura->itens()->create($request->only([
            'produto_id',
            'descricao',
            'quantidade',
            'valor_unitario'
        ]));

        $fatura->recalcularTotal();

        return response()->json($item, 201);
    }

    /**
     * Atualizar item da fatura
     */
    public function update(Request $request, string $faturaId, string $itemId)
    {
        $tenantId = $this->tenantId();

        $item = ItemFatura::where('id', $itemId)
            ->whereHas('fatura', fn($q) => $q->where('tenant_id', $tenantId)
                                            ->where('id', $faturaId))
            ->firstOrFail();

        $request->validate([
            'descricao'      => 'required|string|max:255',
            'quantidade'     => 'required|integer|min:1',
            'valor_unitario' => 'required|numeric|min:0',
        ]);

        $item->update($request->only([
            'descricao',
            'quantidade',
            'valor_unitario'
        ]));

        $item->fatura->recalcularTotal();

        return response()->json($item);
    }

    /**
     * Remover item da fatura
     */
    public function destroy(string $faturaId, string $itemId)
    {
        $tenantId = $this->tenantId();

        $item = ItemFatura::where('id', $itemId)
            ->whereHas('fatura', fn($q) => $q->where('tenant_id', $tenantId)
                                            ->where('id', $faturaId))
            ->firstOrFail();

        $fatura = $item->fatura;
        $item->delete();

        $fatura->recalcularTotal();

        return response()->json([
            'message' => 'Item removido com sucesso'
        ]);
    }
}
