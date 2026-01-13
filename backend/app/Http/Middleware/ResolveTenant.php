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
        $host = $request->getHost(); // ex: bic.app.faturaja.sdoca

        // 🔹 Ignorar landlord / domínio principal
        if ($host === 'faturaja.sdoca') {
            return $next($request);
        }

        // 🔹 Ignorar rotas globais (login, register, welcome)
        if ($request->is('login') || $request->is('register') || $request->is('welcome')) {
            return $next($request);
        }

        // 🔹 Determinar subdomínio do tenant
        $subdomain = null;

        // 1️⃣ Prioridade Header X-Tenant (API)
        if ($request->header('X-Tenant')) {
            $subdomain = $request->header('X-Tenant');
        }

        // 2️⃣ Extrair do host (frontend)
        if (!$subdomain) {
            // remove o sufixo fixo ".app.faturaja.sdoca"
            if (str_ends_with($host, '.app.faturaja.sdoca')) {
                $subdomain = str_replace('.app.faturaja.sdoca', '', $host);
            } else {
                // fallback: pega primeiro subdomínio
                $parts = explode('.', $host);
                $subdomain = $parts[0];
            }
        }

        // 3️⃣ Se não encontrar tenant
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
     * 🔧 Configura conexão do tenant e disponibiliza globalmente
     */
    private function bootstrapTenant(Tenant $tenant): void
    {
        if (empty($tenant->database_name)) {
            throw new \Exception("Tenant {$tenant->subdomain} não tem database_name definido");
        }

        // Configura conexão DB dinâmica
        config(['database.connections.tenant.database' => $tenant->database_name]);
        DB::purge('tenant');
        DB::reconnect('tenant');

        // Disponível globalmente via app('tenant')
        app()->instance('tenant', $tenant);

        // Log para debug
        Log::info("Tenant resolvido com sucesso", [
            'tenant'    => $tenant->name,
            'subdomain' => $tenant->subdomain,
            'database'  => $tenant->database_name,
        ]);
    }
}
