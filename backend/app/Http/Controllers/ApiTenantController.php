<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class ApiTenantController extends Controller
{
    /**
     * Retorna os dados do tenant atual
     */
    public function me(Request $request)
    {
        $tenant = $this->getTenantFromHeader($request);

        return response()->json([
            'success' => true,
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'subdomain' => $tenant->subdomain,
                'email' => $tenant->email,
                'nif' => $tenant->nif,
                'logo' => $tenant->logo,
            ],
        ]);
    }

    /**
     * KPIs do tenant (dashboard)
     */
    public function kpis(Request $request)
    {
        $tenant = $this->getTenantFromHeader($request);

        // Exemplo: total de faturas e pagamentos
        $totalFaturas = DB::table('faturas')
            ->where('tenant_id', $tenant->id)
            ->count();

        $totalPagamentos = DB::table('pagamentos')
            ->where('tenant_id', $tenant->id)
            ->sum('valor_pago');

        // Receita da semana (exemplo)
        $receitaSemana = DB::table('faturas')
            ->select(
                DB::raw('DATE(created_at) as dia'),
                DB::raw('SUM(total) as receita')
            )
            ->where('tenant_id', $tenant->id)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('dia')
            ->get();

        return response()->json([
            'success' => true,
            'kpis' => [
                'totalFaturas' => $totalFaturas,
                'totalPagamentos' => $totalPagamentos,
                'receitaSemana' => $receitaSemana,
            ],
        ]);
    }

    /**
     * Lista as faturas do tenant
     */
    public function faturas(Request $request)
    {
        $tenant = $this->getTenantFromHeader($request);

        $faturas = DB::table('faturas')
            ->where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $faturas]);
    }

    /**
     * Vendas por categoria
     */
    public function vendasCategorias(Request $request)
    {
        $tenant = $this->getTenantFromHeader($request);

        $categorias = DB::table('faturas')
            ->join('produtos', 'faturas.produto_id', '=', 'produtos.id')
            ->select('produtos.categoria', DB::raw('SUM(faturas.total) as vendas'))
            ->where('faturas.tenant_id', $tenant->id)
            ->groupBy('produtos.categoria')
            ->get();

        return response()->json(['data' => $categorias]);
    }

    /**
     * Pagamentos agrupados por status
     */
    public function pagamentos(Request $request)
    {
        $tenant = $this->getTenantFromHeader($request);

        $pagamentos = DB::table('pagamentos')
            ->select('status', DB::raw('SUM(valor_pago) as valor'))
            ->where('tenant_id', $tenant->id)
            ->groupBy('status')
            ->get();

        return response()->json(['data' => $pagamentos]);
    }

    /**
     * Helper para pegar o tenant pelo header X-Tenant
     */
    private function getTenantFromHeader(Request $request)
    {
        $subdomain = $request->header('X-Tenant');
        if (!$subdomain) {
            abort(400, 'Tenant não informado');
        }

        $tenant = Tenant::where('subdomain', $subdomain)->first();
        if (!$tenant) {
            abort(404, 'Tenant não encontrado');
        }

        return $tenant;
    }
}
