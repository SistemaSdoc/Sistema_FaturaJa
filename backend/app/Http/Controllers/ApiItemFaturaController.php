<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ItemFatura;
use App\Models\Fatura;

class ApiItemFaturaController extends Controller
{
    public function index($faturaId)
    {
        $tenantId = app('tenant')->id;

        $fatura = Fatura::where('tenant_id', $tenantId)
            ->with('itens')
            ->findOrFail($faturaId);

        return response()->json($fatura->itens);
    }

    public function store(Request $request, $faturaId)
    {
        $tenantId = app('tenant')->id;

        $fatura = Fatura::where('tenant_id', $tenantId)
            ->findOrFail($faturaId);

        $request->validate([
            'produto_id'     => 'nullable|uuid',
            'descricao'      => 'required|string|max:255',
            'quantidade'     => 'required|integer|min:1',
            'valor_unitario' => 'required|numeric|min:0',
        ]);

        $item = $fatura->itens()->create([
            'produto_id'     => $request->produto_id,
            'descricao'      => $request->descricao,
            'quantidade'     => $request->quantidade,
            'valor_unitario' => $request->valor_unitario,
        ]);

        $fatura->recalcularTotal();

        return response()->json($item, 201);
    }

    public function update(Request $request, $faturaId, $itemId)
    {
        $tenantId = app('tenant')->id;

        $item = ItemFatura::where('id', $itemId)
            ->whereHas('fatura', function ($q) use ($tenantId, $faturaId) {
                $q->where('tenant_id', $tenantId)
                  ->where('id', $faturaId);
            })
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

    public function destroy($faturaId, $itemId)
    {
        $tenantId = app('tenant')->id;

        $item = ItemFatura::where('id', $itemId)
            ->whereHas('fatura', function ($q) use ($tenantId, $faturaId) {
                $q->where('tenant_id', $tenantId)
                  ->where('id', $faturaId);
            })
            ->firstOrFail();

        $fatura = $item->fatura;
        $item->delete();

        $fatura->recalcularTotal();

        return response()->json([
            'message' => 'Item removido com sucesso'
        ]);
    }
}
/*
    /**
     * Adicionar item à fatura
     */ 