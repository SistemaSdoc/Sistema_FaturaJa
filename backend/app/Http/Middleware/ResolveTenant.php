<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ResolveTenant
{
    public function handle(Request $request, Closure $next)
    {
        /**
         * 🔹 Ignorar apenas o LOGIN
         * (logout e outras rotas precisam do tenant)
         */
        if ($request->is('api/login')) {
            return $next($request);
        }

        /**
         * 🔑 PRIORIDADE 1: HEADER (API / Axios)
         * Header: X-Tenant
         */
        $subdomain = $request->header('X-Tenant');

        /**
         * 🔑 PRIORIDADE 2: SUBDOMÍNIO (Frontend)
         * ex: bic.faturaja.sdoca
         */
        if (! $subdomain) {
            $host = $request->getHost();

            if (str_contains($host, '.')) {
                $parts = explode('.', $host);
                $subdomain = $parts[0];
            }
        }

        if (! $subdomain) {
            return response()->json([
                'error' => 'Tenant não informado'
            ], 400);
        }

        $tenant = Tenant::where('subdomain', $subdomain)->first();

        if (! $tenant) {
            return response()->json([
                'error' => "Tenant '{$subdomain}' não existe"
            ], 404);
        }

        $this->bootstrapTenant($tenant);

        return $next($request);
    }

    /**
     * 🔧 Bootstrap do tenant
     */
    private function bootstrapTenant(Tenant $tenant): void
    {
        if (empty($tenant->database_name)) {
            throw new \Exception("Tenant {$tenant->subdomain} não tem database_name definido");
        }

        // Configurar DB do tenant
        config([
            'database.connections.tenant.database' => $tenant->database_name,
        ]);

        DB::purge('tenant');
        DB::reconnect('tenant');

        // Disponível globalmente
        app()->instance('tenant', $tenant);

        // 🔹 Log de sucesso
        Log::info("Tenant resolvido", [
            'tenant' => $tenant->name,
            'subdomain' => $tenant->subdomain,
            'database' => $tenant->database_name,
        ]);
    }
}
