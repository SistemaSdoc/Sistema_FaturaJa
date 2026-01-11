<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produto;

class ApiProdutoController extends Controller
{
    /**
     * Retorna o tenant atual
     */
    private function tenantId(): string
    {
        return app('tenant')->id;
    }

    /**
     * Listar produtos do tenant
     */
    public function index()
    {
        $produtos = Produto::where('tenant_id', $this->tenantId())->get();
        return response()->json($produtos);
    }

    /**
     * Criar produto
     */
    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string',
            'preco' => 'required|numeric|min:0',
            'estoque' => 'required|integer|min:0',
            'tipo' => 'required|in:produto,servico',
        ]);

        $produto = Produto::create([
            'tenant_id' => $this->tenantId(),
            'nome' => $request->nome,
            'descricao' => $request->descricao,
            'preco' => $request->preco,
            'estoque' => $request->estoque,
            'tipo' => $request->tipo,
        ]);

        return response()->json([
            'message' => 'Produto criado com sucesso',
            'data' => $produto
        ], 201);
    }

    /**
     * Mostrar produto
     */
    public function show(string $id)
    {
        $produto = Produto::where('tenant_id', $this->tenantId())
            ->findOrFail($id);

        return response()->json($produto);
    }

    /**
     * Atualizar produto
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string',
            'preco' => 'required|numeric|min:0',
            'estoque' => 'required|integer|min:0',
            'tipo' => 'required|in:produto,servico',
        ]);

        $produto = Produto::where('tenant_id', $this->tenantId())
            ->findOrFail($id);

        $produto->update($request->only([
            'nome',
            'descricao',
            'preco',
            'estoque',
            'tipo'
        ]));

        return response()->json([
            'message' => 'Produto atualizado com sucesso',
            'data' => $produto
        ]);
    }

    /**
     * Remover produto
     */
    public function destroy(string $id)
    {
        $produto = Produto::where('tenant_id', $this->tenantId())
            ->findOrFail($id);

        $produto->delete();

        return response()->json([
            'message' => 'Produto removido com sucesso'
        ]);
    }
}
