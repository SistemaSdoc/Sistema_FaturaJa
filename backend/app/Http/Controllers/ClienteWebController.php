<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;
use Illuminate\Support\Str;

class ClienteWebController extends Controller
{
    /**
     * Listar clientes do tenant atual
     */
    public function index()
    {
        $tenantId = app('tenant')->id;
        $clients = Cliente::where('tenant_id', $tenantId)->get();

        return view('tenant.clients.index', compact('clients'));
    }

    /**
     * Formulário de criação
     */
    public function create()
    {
        return view('tenant.clients.create');
    }

    /**
     * Salvar novo cliente
     */
    public function store(Request $request)
    {
        $tenantId = app('tenant')->id;

        $request->validate([
            'nome' => 'required|string|max:100',
            'email' => 'required|string|max:100',
            'telefone' => 'nullable|string|max:20',
            'nif' => 'nullable|string|max:20',
            'tipo_cliente' => 'nullable|in:empresa,consumidor_final',
        ]);

        Cliente::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'nome' => $request->nome,
            'email' => $request->email,
            'telefone' => $request->telefone,
            'nif' => $request->nif ?? '999999999',
            'tipo_cliente' => $request->tipo_cliente ?? 'consumidor_final',
        ]);

        return redirect()
            ->route('tenant.clients.index')
            ->with('success', 'Cliente criado com sucesso!');
    }

    /**
     * Formulário de edição
     */
    public function edit($id)
    {
        $client = $this->findTenantClient($id);
        return view('tenant.clients.edit', compact('client'));
    }

    /**
     * Atualizar cliente
     */
    public function update(Request $request, $id)
    {
        $client = $this->findTenantClient($id);

        $request->validate([
            'nome' => 'required|string|max:100',
            'email' => 'required|string|max:100',
            'telefone' => 'nullable|string|max:20',
            'nif' => 'nullable|string|max:20',
            'tipo_cliente' => 'nullable|in:empresa,consumidor_final',
        ]);

        $client->update([
            'nome' => $request->nome,
            'email' => $request->email,
            'telefone' => $request->telefone,
            'nif' => $request->nif ?? $client->nif,
            'tipo_cliente' => $request->tipo_cliente ?? $client->tipo_cliente,
        ]);

        return redirect()
            ->route('tenant.clients.index')
            ->with('success', 'Cliente atualizado com sucesso!');
    }

    /**
     * Excluir cliente
     */
    public function destroy($id)
    {
        $client = $this->findTenantClient($id);
        $client->delete();

        return redirect()
            ->route('tenant.clients.index')
            ->with('success', 'Cliente deletado com sucesso!');
    }

    /**
     * MÉTODO PRIVADO: Buscar cliente do tenant atual
     */
    private function findTenantClient($id): Cliente
    {
        $tenantId = app('tenant')->id;
        return Cliente::where('tenant_id', $tenantId)
            ->where('id', $id)
            ->firstOrFail();
    }
}
