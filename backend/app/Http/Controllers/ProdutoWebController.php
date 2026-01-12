<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProdutoWebController extends Controller
{
    /**
     * Listar produtos/serviços do tenant
     */
    public function index()
    {
        $tenantId = app('tenant')->id;
        $produtos = Produto::where('tenant_id', $tenantId)->get();

        return view('tenant.produtos.index', compact('produtos'));
    }

    /**
     * Formulário de criação
     */
    public function create()
    {
        return view('tenant.produtos.create');
    }

    /**
     * Salvar novo produto/serviço
     */
    public function store(Request $request)
    {
        $tenantId = app('tenant')->id;

        $request->validate([
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string',
            'preco' => 'required|numeric|min:0',
            'estoque' => 'required|integer|min:0',
            'tipo' => 'required|in:produto,servico',
        ]);

        Produto::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'nome' => $request->nome,
            'descricao' => $request->descricao,
            'preco' => $request->preco,
            'estoque' => $request->estoque,
            'tipo' => $request->tipo,
        ]);

        return redirect()
            ->route('tenant.produtos.index')
            ->with('success', 'Produto/Serviço criado com sucesso!');
    }

    /**
     * Formulário de edição
     */
    public function edit($id)
    {
        $produto = $this->findTenantProduto($id);
        return view('tenant.produtos.edit', compact('produto'));
    }

    /**
     * Atualizar produto/serviço
     */
    public function update(Request $request, $id)
    {
        $produto = $this->findTenantProduto($id);

        $request->validate([
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string',
            'preco' => 'required|numeric|min:0',
            'estoque' => 'required|integer|min:0',
            'tipo' => 'required|in:produto,servico',
        ]);

        $produto->update([
            'nome' => $request->nome,
            'descricao' => $request->descricao,
            'preco' => $request->preco,
            'estoque' => $request->estoque,
            'tipo' => $request->tipo,
        ]);

        return redirect()
            ->route('tenant.produtos.index')
            ->with('success', 'Produto/Serviço atualizado!');
    }

    /**
     * Deletar produto/serviço
     */
    public function destroy($id)
    {
        $produto = $this->findTenantProduto($id);
        $produto->delete();

        return redirect()
            ->route('tenant.produtos.index')
            ->with('success', 'Produto/Serviço removido!');
    }

    /**
     * MÉTODO PRIVADO: Buscar produto do tenant atual
     */
    private function findTenantProduto($id)
    {
        $tenantId = app('tenant')->id;
        return Produto::where('tenant_id', $tenantId)
            ->where('id', $id)
            ->firstOrFail();
    }
}
