<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Fatura;
use App\Models\Cliente;
use Illuminate\Support\Str;

class FaturaWebController extends Controller
{
    /**
     * Listar todas as faturas do tenant atual
     */
    public function index()
    {
        $tenantId = app('tenant')->id;
        $faturas = Fatura::where('tenant_id', $tenantId)->get();

        return view('tenant.faturas.index', compact('faturas'));
    }

    /**
     * Formulário para criar nova fatura
     */
    public function create()
    {
        $tenantId = app('tenant')->id;
        $clientes = Cliente::where('tenant_id', $tenantId)->get();

        return view('tenant.faturas.create', compact('clientes'));
    }

    /**
     * Salvar nova fatura
     */
    public function store(Request $request)
    {
        $tenantId = app('tenant')->id;

        $request->validate([
            'cliente_id' => 'required|uuid',
            'nome_cliente' => 'required|string|max:100',
            'nif_cliente' => 'required|string|max:20',
            'numero' => 'required|string|max:20',
            'data_emissao' => 'required|date',
            'data_vencimento' => 'required|date',
            'valor_total' => 'required|numeric|min:0',
            'status' => 'required|in:pendente,pago,cancelado',
            'tipo' => 'required|in:proforma,fatura,recibo',
        ]);

        // Confirma que o cliente pertence ao tenant
        $cliente = Cliente::where('id', $request->cliente_id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        // Checa UNIQUE por tenant para número
        if (Fatura::where('tenant_id', $tenantId)
            ->where('numero', $request->numero)
            ->exists()) {
            return back()->withErrors([
                'numero' => 'Número da fatura já existe neste tenant.'
            ])->withInput();
        }

        Fatura::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'cliente_id' => $cliente->id,
            'nome_cliente' => $request->nome_cliente,
            'nif_cliente' => $request->nif_cliente,
            'numero' => $request->numero,
            'data_emissao' => $request->data_emissao,
            'data_vencimento' => $request->data_vencimento,
            'valor_total' => $request->valor_total,
            'status' => $request->status,
            'tipo' => $request->tipo,
        ]);

        return redirect()
            ->route('tenant.faturas.index')
            ->with('success', 'Fatura criada com sucesso!');
    }

    /**
     * Formulário para editar fatura
     */
    public function edit($id)
    {
        $fatura = $this->findTenantFatura($id);
        $tenantId = app('tenant')->id;
        $clientes = Cliente::where('tenant_id', $tenantId)->get();

        return view('tenant.faturas.edit', compact('fatura', 'clientes'));
    }

    /**
     * Atualizar fatura existente
     */
    public function update(Request $request, $id)
    {
        $tenantId = app('tenant')->id;
        $fatura = $this->findTenantFatura($id);

        $request->validate([
            'cliente_id' => 'required|uuid',
            'nome_cliente' => 'required|string|max:100',
            'nif_cliente' => 'required|string|max:20',
            'numero' => 'required|string|max:20',
            'data_emissao' => 'required|date',
            'data_vencimento' => 'required|date',
            'valor_total' => 'required|numeric|min:0',
            'status' => 'required|in:pendente,pago,cancelado',
            'tipo' => 'required|in:proforma,fatura,recibo',
        ]);

        $cliente = Cliente::where('id', $request->cliente_id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        // UNIQUE por tenant, ignorando a própria fatura
        if (Fatura::where('tenant_id', $tenantId)
            ->where('numero', $request->numero)
            ->where('id', '!=', $fatura->id)
            ->exists()) {
            return back()->withErrors([
                'numero' => 'Número da fatura já existe neste tenant.'
            ])->withInput();
        }

        $fatura->update([
            'cliente_id' => $cliente->id,
            'nome_cliente' => $request->nome_cliente,
            'nif_cliente' => $request->nif_cliente,
            'numero' => $request->numero,
            'data_emissao' => $request->data_emissao,
            'data_vencimento' => $request->data_vencimento,
            'valor_total' => $request->valor_total,
            'status' => $request->status,
            'tipo' => $request->tipo,
        ]);

        return redirect()
            ->route('tenant.faturas.index')
            ->with('success', 'Fatura atualizada com sucesso!');
    }

    /**
     * Deletar fatura
     */
    public function destroy($id)
    {
        $fatura = $this->findTenantFatura($id);
        $fatura->delete();

        return redirect()
            ->route('tenant.faturas.index')
            ->with('success', 'Fatura eliminada com sucesso!');
    }

    /**
     * MÉTODO PRIVADO: Buscar fatura do tenant atual
     */
    private function findTenantFatura($id): Fatura
    {
        $tenantId = app('tenant')->id;
        return Fatura::where('tenant_id', $tenantId)
            ->where('id', $id)
            ->firstOrFail();
    }
}
