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
        $host = $request->getHost();

        // 🔹 Ignorar landlord
        if ($host === 'faturaja.sdoca') {
            return $next($request);
        }

        // 🔹 Ignorar rotas de login/register do landlord
        if ($request->is('login') || $request->is('register') || $request->is('welcome')) {
            return $next($request);
        }

        $subdomain = null;

        // 1️⃣ Prioridade Header X-Tenant (API / Axios)
        if ($request->header('X-Tenant')) {
            $subdomain = $request->header('X-Tenant');
        }

        // 2️⃣ Subdomínio (frontend)
        if (!$subdomain && str_contains($host, '.')) {
            $parts = explode('.', $host);
            $subdomain = $parts[0];
        }

        // 3️⃣ Se não encontrar subdomínio
        if (!$subdomain) {
            return response()->json([
                'error' => 'Tenant não informado'
            ], 400);
        }

        // 4️⃣ Buscar tenant no DB
        $tenant = Tenant::where('subdomain', $subdomain)->first();

        if (!$tenant) {
            return response()->json([
                'error' => "Tenant '{$subdomain}' não existe"
            ], 404);
        }

        // 5️⃣ Bootstrap do tenant
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

        // Configurar conexão DB
        config(['database.connections.tenant.database' => $tenant->database_name]);
        DB::purge('tenant');
        DB::reconnect('tenant');

        // Disponível globalmente via app('tenant')
        app()->instance('tenant', $tenant);

        // Log
        Log::info("Tenant resolvido com sucesso", [
            'tenant'   => $tenant->name,
            'subdomain'=> $tenant->subdomain,
            'database' => $tenant->database_name,
        ]);
    }
}
