<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ResolveTenant
{
   public function handle(Request $request, Closure $next)
{
    // 🔹 Ignorar login/logout
    if ($request->is('api/login') || $request->is('api/logout')) {
        return $next($request);
    }

    /**
     * 🔑 PRIORIDADE 1: HEADER (API)
     * Axios envia: X-Tenant
     */
    $subdomain = $request->header('X-Tenant');

    /**
     * 🔑 PRIORIDADE 2: SUBDOMÍNIO (FRONTEND)
     */
    if (! $subdomain) {
        $host = $request->getHost();

        if (str_contains($host, '.')) {
            $parts = explode('.', $host);
            $subdomain = $parts[0];
        }
    }

    if (! $subdomain) {
        abort(400, 'Tenant não informado');
    }

    $tenant = Tenant::where('subdomain', $subdomain)->first();

    if (! $tenant) {
        abort(404, "Tenant '{$subdomain}' não existe.");
    }

    $this->bootstrapTenant($tenant);

    return $next($request);
}

    /**
     * Bootstrap do tenant
     */
    private function bootstrapTenant(Tenant $tenant): void
    {
        // Configura a base de dados do tenant
        config([
            'database.connections.tenant.database' => $tenant->database_name,
        ]);

        DB::purge('tenant');
        DB::reconnect('tenant');

        // Disponível globalmente
        app()->instance('tenant', $tenant);

        // Parâmetro automático nas rotas
        URL::defaults([
            'tenant' => $tenant->subdomain,
        ]);

        // 🔹 LOG para debug
        Log::info("Tenant resolvido: {$tenant->name} ({$tenant->subdomain})");
    }
}
