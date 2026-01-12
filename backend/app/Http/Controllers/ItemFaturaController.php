<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ItemFatura;
use App\Models\Fatura;
use App\Models\Produto;

class ItemFaturaController extends Controller
{
    /**
     * Listar itens de uma fatura
     */
    public function index($fatura_id)
    {
        $fatura = $this->findTenantFatura($fatura_id);
        $itens = $fatura->itens;

        return view('tenant.itens_fatura.index', compact('fatura', 'itens'));
    }

    /**
     * Formulário para criar item
     */
    public function create($fatura_id)
    {
        $fatura = $this->findTenantFatura($fatura_id);
        $produtos = Produto::all();

        return view('tenant.itens_fatura.create', compact('fatura', 'produtos'));
    }

    /**
     * Salvar novo item
     */
    public function store(Request $request, $fatura_id)
    {
        $fatura = $this->findTenantFatura($fatura_id);

        $request->validate([
            'produto_id' => 'nullable|exists:produtos,id',
            'descricao' => 'nullable|string|max:255',
            'quantidade' => 'required|integer|min:1',
            'valor_unitario' => 'required|numeric|min:0',
            'valor_desconto_unitario' => 'required|numeric|min:0',
        ]);

        ItemFatura::create([
            'fatura_id' => $fatura->id,
            'produto_id' => $request->produto_id,
            'descricao' => $request->descricao,
            'quantidade' => $request->quantidade,
            'valor_unitario' => $request->valor_unitario,
            'valor_desconto_unitario' => $request->valor_desconto_unitario,
        ]);

        return redirect()
            ->route('tenant.itens_fatura.index', ['fatura' => $fatura->id])
            ->with('success', 'Item adicionado à fatura!');
    }

    /**
     * Formulário para editar item
     */
    public function edit($fatura_id, $id)
    {
        $this->findTenantFatura($fatura_id);
        $item = $this->findTenantItem($id);
        $produtos = Produto::all();

        return view('tenant.itens_fatura.edit', compact('item', 'produtos'));
    }

    /**
     * Atualizar item da fatura
     */
    public function update(Request $request, $fatura_id, $id)
    {
        $this->findTenantFatura($fatura_id);
        $item = $this->findTenantItem($id);

        $request->validate([
            'produto_id' => 'nullable|exists:produtos,id',
            'descricao' => 'nullable|string|max:255',
            'quantidade' => 'required|integer|min:1',
            'valor_unitario' => 'required|numeric|min:0',
            'valor_desconto_unitario' => 'required|numeric|min:0',
        ]);

        $item->update([
            'produto_id' => $request->produto_id,
            'descricao' => $request->descricao,
            'quantidade' => $request->quantidade,
            'valor_unitario' => $request->valor_unitario,
            'valor_desconto_unitario' => $request->valor_desconto_unitario,
        ]);

        return redirect()
            ->route('tenant.itens_fatura.index', ['fatura' => $fatura_id])
            ->with('success', 'Item atualizado!');
    }

    /**
     * Deletar item
     */
    public function destroy($fatura_id, $id)
    {
        $this->findTenantFatura($fatura_id);
        $item = $this->findTenantItem($id);
        $item->delete();

        return redirect()
            ->route('tenant.itens_fatura.index', ['fatura' => $fatura_id])
            ->with('success', 'Item removido da fatura!');
    }

    /**
     * MÉTODO PRIVADO: Buscar fatura do tenant atual
     */
    private function findTenantFatura($id)
    {
        $tenantId = app('tenant')->id;
        return Fatura::where('tenant_id', $tenantId)->where('id', $id)->firstOrFail();
    }

    /**
     * MÉTODO PRIVADO: Buscar item de fatura
     */
    private function findTenantItem($id)
    {
        return ItemFatura::findOrFail($id);
    }
}
