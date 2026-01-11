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
     * Tenant atual
     */
    private function tenantId(): string
    {
        return app('tenant')->id;
    }

    /**
     * Listar faturas do tenant atual
     */
    public function index()
    {
        $faturas = Fatura::where('tenant_id', $this->tenantId())
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
        $request->validate([
            'cliente_id'      => 'required|uuid',
            'data_emissao'    => 'required|date',
            'data_vencimento' => 'required|date',
            'status'          => 'required|in:pendente,pago,cancelado',
            'tipo'            => 'required|in:proforma,fatura,recibo',
        ]);

        $cliente = Cliente::where('id', $request->cliente_id)
            ->where('tenant_id', $this->tenantId())
            ->firstOrFail();

        // Gerar número único
        $ultimoNumero = Fatura::where('tenant_id', $this->tenantId())
            ->orderBy('created_at', 'desc')
            ->value('numero');

        $novoNumero = $ultimoNumero ? ((int)$ultimoNumero + 1) : 1;
        $novoNumero = str_pad($novoNumero, 6, '0', STR_PAD_LEFT);

        $fatura = Fatura::create([
            'id'              => Str::uuid(),
            'tenant_id'       => $this->tenantId(),
            'cliente_id'      => $cliente->id,
            'nif_cliente'     => $cliente->nif,
            'numero'          => $novoNumero,
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
    public function show(string $id)
    {
        $fatura = Fatura::where('tenant_id', $this->tenantId())
            ->with(['cliente', 'itens.produto'])
            ->findOrFail($id);

        return response()->json($fatura);
    }

    /**
     * Atualizar fatura
     */
    public function update(Request $request, string $id)
    {
        $fatura = Fatura::where('tenant_id', $this->tenantId())->findOrFail($id);

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
     * Adicionar item à fatura e atualizar total
     */
    public function addItem(Request $request, string $faturaId)
    {
        $request->validate([
            'produto_id' => 'required|uuid',
            'quantidade' => 'required|numeric|min:1',
        ]);

        $fatura = Fatura::where('tenant_id', $this->tenantId())->findOrFail($faturaId);
        $produto = Produto::where('tenant_id', $this->tenantId())->findOrFail($request->produto_id);

        DB::transaction(function () use ($fatura, $produto, $request) {
            ItemFatura::create([
                'id'         => Str::uuid(),
                'fatura_id'  => $fatura->id,
                'produto_id' => $produto->id,
                'quantidade' => $request->quantidade,
            ]);

            $total = $fatura->itens()->with('produto')->get()->sum(fn($item) => 
                $item->quantidade * $item->produto->preco_unitario * (1 + $item->produto->imposto_percent / 100)
            );

            $fatura->update(['valor_total' => $total]);
        });

        return response()->json(['message' => 'Item adicionado com sucesso'], 201);
    }

    /**
     * Remover item da fatura e atualizar total
     */
    public function removeItem(string $itemId)
    {
        $item = ItemFatura::whereHas('fatura', fn($q) => $q->where('tenant_id', $this->tenantId()))
            ->findOrFail($itemId);

        $fatura = $item->fatura;

        DB::transaction(function () use ($item, $fatura) {
            $item->delete();

            $total = $fatura->itens()->with('produto')->get()->sum(fn($item) => 
                $item->quantidade * $item->produto->preco_unitario * (1 + $item->produto->imposto_percent / 100)
            );

            $fatura->update(['valor_total' => $total]);
        });

        return response()->json(['message' => 'Item removido com sucesso']);
    }

    /**
     * Deletar fatura
     */
    public function destroy(string $id)
    {
        Fatura::where('tenant_id', $this->tenantId())->findOrFail($id)->delete();

        return response()->json(['message' => 'Fatura deletada com sucesso']);
    }
}
