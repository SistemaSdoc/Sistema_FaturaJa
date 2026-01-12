<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class ApiTenantController extends Controller
{
    /**
     * Dados do tenant atual
     */
    public function me(Request $request)
    {
        $tenant = $this->resolveTenant($request);
        if ($tenant instanceof JsonResponse) {
            return $tenant;
        }

        return response()->json([
            'success' => true,
            'tenant' => [
                'id'        => $tenant->id,
                'name'      => $tenant->name,
                'subdomain' => $tenant->subdomain,
                'email'     => $tenant->email,
                'nif'       => $tenant->nif,
                'logo'      => $tenant->logo,
            ],
        ]);
    }

    /**
     * KPIs do dashboard
     */
    public function kpis(Request $request)
    {
        $tenant = $this->resolveTenant($request);
        if ($tenant instanceof JsonResponse) {
            return $tenant;
        }

        $totalFaturas = DB::table('faturas')
            ->where('tenant_id', $tenant->id)
            ->count();

        $totalPagamentos = DB::table('pagamentos')
            ->where('tenant_id', $tenant->id)
            ->sum('valor_pago') ?? 0;

        $receitaSemana = DB::table('faturas')
            ->selectRaw('DATE(created_at) as dia, SUM(valor_total) as receita')
            ->where('tenant_id', $tenant->id)
            ->where('created_at', '>=', now()->subDays(7))
            ->groupByRaw('DATE(created_at)')
            ->orderBy('dia')
            ->get();

        return response()->json([
            'success' => true,
            'kpis' => [
                'totalFaturas'     => $totalFaturas,
                'totalPagamentos'  => $totalPagamentos,
                'receitaSemana'    => $receitaSemana,
            ],
        ]);
    }

    /**
     * Vendas por categoria
     */
    public function vendasCategorias(Request $request)
    {
        $tenant = $this->resolveTenant($request);
        if ($tenant instanceof JsonResponse) {
            return $tenant;
        }

        $categorias = DB::table('item_faturas')
            ->join('produtos', 'item_faturas.produto_id', '=', 'produtos.id')
            ->join('faturas', 'item_faturas.fatura_id', '=', 'faturas.id')
            ->selectRaw('
                COALESCE(produtos.categoria, "Sem categoria") as categoria,
                SUM(item_faturas.quantidade * item_faturas.valor_unitario) as vendas
            ')
            ->where('faturas.tenant_id', $tenant->id)
            ->groupBy('produtos.categoria')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categorias,
        ]);
    }

    /**
     * Pagamentos agrupados por status
     */
    public function pagamentos(Request $request)
    {
        $tenant = $this->resolveTenant($request);
        if ($tenant instanceof JsonResponse) {
            return $tenant;
        }

        $pagamentos = DB::table('pagamentos')
            ->selectRaw('status, SUM(valor_pago) as valor')
            ->where('tenant_id', $tenant->id)
            ->groupBy('status')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pagamentos,
        ]);
    }

    /**
     * Resolver tenant via header X-Tenant (SEM abort, SEM 500)
     */
    private function resolveTenant(Request $request)
    {
        $subdomain = $request->header('X-Tenant');

        if (!$subdomain) {
            return response()->json([
                'success' => false,
                'message' => 'Header X-Tenant não informado',
            ], 400);
        }

        $tenant = Tenant::where('subdomain', $subdomain)->first();

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant não encontrado',
            ], 404);
        }

        return $tenant;
    }
}
