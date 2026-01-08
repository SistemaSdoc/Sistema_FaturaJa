<?php

namespace App\Http\Controllers;

use App\Models\Fatura;
use App\Models\Cliente;
use App\Models\Produto;
use App\Models\ItemFatura;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ApiFaturaController extends Controller
{
    /**
     * Listar faturas do tenant atual
     */
    public function index()
    {
        $tenantId = app('tenant')->id;

        $faturas = Fatura::where('tenant_id', $tenantId)
            ->with('cliente')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($faturas);
    }

    /**
     * Criar nova fatura
     */
    public function store(Request $request)
    {
        $tenantId = app('tenant')->id;

        $request->validate([
            'cliente_id'      => 'required|uuid',
            'numero'          => 'required|string|max:20',
            'data_emissao'    => 'required|date',
            'data_vencimento' => 'required|date',
            'status'          => 'required|in:pendente,pago,cancelado',
            'tipo'            => 'required|in:proforma,fatura,recibo',
        ]);

        // 🔐 Cliente do tenant
        $cliente = Cliente::where('id', $request->cliente_id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        // 🔢 Número único por tenant
        if (Fatura::where('tenant_id', $tenantId)
            ->where('numero', $request->numero)
            ->exists()) {
            return response()->json([
                'message' => 'Número da fatura já existe neste tenant'
            ], 422);
        }

        $fatura = Fatura::create([
            'id'              => Str::uuid(),
            'tenant_id'       => $tenantId,
            'cliente_id'      => $cliente->id,
            'nif_cliente'     => $cliente->nif,
            'numero'          => $request->numero,
            'data_emissao'    => $request->data_emissao,
            'data_vencimento' => $request->data_vencimento,
            'valor_total'     => 0,
            'status'          => $request->status,
            'tipo'            => $request->tipo,
        ]);

        return response()->json($fatura, 201);
    }

    /**
     * Mostrar fatura com itens e produtos
     */
    public function show($id)
    {
        $tenantId = app('tenant')->id;

        $fatura = Fatura::where('tenant_id', $tenantId)
            ->with([
                'cliente',
                'itens.produto'
            ])
            ->findOrFail($id);

        return response()->json($fatura);
    }

    /**
     * Atualizar dados da fatura
     */
    public function update(Request $request, $id)
    {
        $tenantId = app('tenant')->id;

        $fatura = Fatura::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'data_emissao'    => 'required|date',
            'data_vencimento' => 'required|date',
            'status'          => 'required|in:pendente,pago,cancelado',
            'tipo'            => 'required|in:proforma,fatura,recibo',
        ]);

        $fatura->update([
            'data_emissao'    => $request->data_emissao,
            'data_vencimento' => $request->data_vencimento,
            'status'          => $request->status,
            'tipo'            => $request->tipo,
        ]);

        return response()->json($fatura);
    }

    /**
     * Adicionar item à fatura
     */
    public function addItem(Request $request, $faturaId)
    {
        $tenantId = app('tenant')->id;

        $request->validate([
            'produto_id' => 'required|uuid',
            'quantidade' => 'required|numeric|min:1',
        ]);

        $fatura = Fatura::where('tenant_id', $tenantId)->findOrFail($faturaId);

        $produto = Produto::where('tenant_id', $tenantId)
            ->findOrFail($request->produto_id);

        DB::transaction(function () use ($fatura, $produto, $request) {

            ItemFatura::create([
                'id'         => Str::uuid(),
                'fatura_id'  => $fatura->id,
                'produto_id' => $produto->id,
                'quantidade' => $request->quantidade,
            ]);

            // 🔢 recalcular total
            $total = $fatura->itens()->with('produto')->get()->sum(function ($item) {
                return $item->quantidade *
                    $item->produto->preco_unitario *
                    (1 + $item->produto->imposto_percent / 100);
            });

            $fatura->update([
                'valor_total' => $total
            ]);
        });

        return response()->json([
            'message' => 'Item adicionado com sucesso'
        ], 201);
    }

    /**
     * Remover item da fatura
     */
    public function removeItem($itemId)
    {
        $tenantId = app('tenant')->id;

        $item = ItemFatura::whereHas('fatura', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->findOrFail($itemId);

        $fatura = $item->fatura;

        $item->delete();

        // 🔢 recalcular total
        $total = $fatura->itens()->with('produto')->get()->sum(function ($item) {
            return $item->quantidade *
                $item->produto->preco_unitario *
                (1 + $item->produto->imposto_percent / 100);
        });

        $fatura->update([
            'valor_total' => $total
        ]);

        return response()->json([
            'message' => 'Item removido com sucesso'
        ]);
    }

    /**
     * Deletar fatura
     */
    public function destroy($id)
    {
        $tenantId = app('tenant')->id;

        Fatura::where('tenant_id', $tenantId)
            ->findOrFail($id)
            ->delete();

        return response()->json([
            'message' => 'Fatura deletada com sucesso'
        ]);
    }
}
