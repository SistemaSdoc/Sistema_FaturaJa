<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ApiClienteController extends Controller
{
    /**
     * Listar clientes do tenant atual
     */
    public function index()
    {
        $tenantId = app('tenant')->id;

        $clientes = Cliente::where('tenant_id', $tenantId)->get();

        return response()->json($clientes);
    }

    /**
     * Criar cliente
     */
    public function store(Request $request)
    {
        $tenantId = app('tenant')->id;

        $request->validate([
            'nome'          => 'required|string|max:100',
            'email'         => 'nullable|email|max:100',
            'telefone'      => 'nullable|string|max:20',
            'tipo_cliente'  => 'required|in:empresa,consumidor_final',
            'nif'           => 'required_if:tipo_cliente,empresa|max:20',
        ]);

        // 🎯 Regra de negócio do NIF
        $nif = $request->tipo_cliente === 'empresa'
            ? $request->nif
            : ($request->nif ?? '999999999');

        $cliente = Cliente::create([
            'tenant_id'    => $tenantId,
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
    public function show($id)
    {
        $tenantId = app('tenant')->id;

        $cliente = Cliente::where('tenant_id', $tenantId)
            ->findOrFail($id);

        return response()->json($cliente);
    }

    /**
     * Atualizar cliente
     */
    public function update(Request $request, $id)
    {
        $tenantId = app('tenant')->id;

        $request->validate([
            'nome'          => 'required|string|max:100',
            'email'         => 'nullable|email|max:100',
            'telefone'      => 'nullable|string|max:20',
            'tipo_cliente'  => 'required|in:empresa,consumidor_final',
            'nif'           => 'required_if:tipo_cliente,empresa|max:20',
        ]);

        $cliente = Cliente::where('tenant_id', $tenantId)
            ->findOrFail($id);

        // 🎯 Regra do NIF na atualização
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
    public function destroy($id)
    {
        $tenantId = app('tenant')->id;

        $cliente = Cliente::where('tenant_id', $tenantId)
            ->findOrFail($id);

        $cliente->delete();

        return response()->json([
            'message' => 'Cliente removido com sucesso'
        ]);
    }
}
