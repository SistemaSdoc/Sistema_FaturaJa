<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ApiClienteController extends Controller
{
    /**
     * Retorna o tenant atual
     */
    private function tenantId(): string
    {
        return app('tenant')->id;
    }

    /**
     * Listar clientes do tenant
     */
    public function index()
    {
        $clientes = Cliente::where('tenant_id', $this->tenantId())->get();
        return response()->json($clientes);
    }

    /**
     * Criar cliente
     */
    public function store(Request $request)
    {
        $request->validate([
            'nome'          => 'required|string|max:100',
            'email'         => 'nullable|email|max:100',
            'telefone'      => 'nullable|string|max:20',
            'tipo_cliente'  => 'required|in:empresa,consumidor_final',
            'nif'           => 'required_if:tipo_cliente,empresa|max:20',
        ]);

        $nif = $request->tipo_cliente === 'empresa'
            ? $request->nif
            : ($request->nif ?? '999999999');

        $cliente = Cliente::create([
            'tenant_id'    => $this->tenantId(),
            'nome'         => $request->nome,
            'email'        => $request->email,
            'telefone'     => $request->telefone,
            'tipo_cliente' => $request->tipo_cliente,
            'nif'          => $nif,
        ]);

        return response()->json([
            'message' => 'Cliente criado com sucesso',
            'data'    => $cliente
        ], 201);
    }

    /**
     * Mostrar cliente
     */
    public function show(string $id)
    {
        $cliente = Cliente::where('tenant_id', $this->tenantId())->findOrFail($id);
        return response()->json($cliente);
    }

    /**
     * Atualizar cliente
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'nome'          => 'required|string|max:100',
            'email'         => 'nullable|email|max:100',
            'telefone'      => 'nullable|string|max:20',
            'tipo_cliente'  => 'required|in:empresa,consumidor_final',
            'nif'           => 'required_if:tipo_cliente,empresa|max:20',
        ]);

        $cliente = Cliente::where('tenant_id', $this->tenantId())->findOrFail($id);

        $nif = $request->tipo_cliente === 'empresa'
            ? $request->nif
            : ($request->nif ?? '999999999');

        $cliente->update([
            'nome'         => $request->nome,
            'email'        => $request->email,
            'telefone'     => $request->telefone,
            'tipo_cliente' => $request->tipo_cliente,
            'nif'          => $nif,
        ]);

        return response()->json([
            'message' => 'Cliente atualizado com sucesso',
            'data'    => $cliente
        ]);
    }

    /**
     * Remover cliente
     */
    public function destroy(string $id)
    {
        $cliente = Cliente::where('tenant_id', $this->tenantId())->findOrFail($id);
        $cliente->delete();

        return response()->json([
            'message' => 'Cliente removido com sucesso'
        ]);
    }
}
