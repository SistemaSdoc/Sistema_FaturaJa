<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use App\Models\Tenant;

class TenantApiController extends Controller
{
    /**
     * Criar um novo tenant e inicializar o database
     */
    public function store(Request $request)
    {
        try {
            // 1️⃣ Validação
            $request->validate([
                'name' => 'required|string|max:255',
                'subdomain' => 'required|string|unique:tenants,subdomain',
            ]);

            $databaseName = 'tenant_' . Str::slug($request->subdomain);

            // 2️⃣ Criar database físico
            $this->createTenantDatabase($databaseName);

            // 3️⃣ Criar registro do tenant no banco principal
            $tenant = Tenant::create([
                'id' => (string) Str::uuid(),
                'name' => $request->name,
                'subdomain' => $request->subdomain,
                'database_name' => $databaseName,
            ]);

            // 4️⃣ Configurar conexão do tenant dinamicamente
            $this->configureTenantConnection($databaseName);

            // 5️⃣ Rodar migrations do tenant
            Artisan::call('migrate', [
                '--database' => 'tenant',
                '--path' => 'database/migrations/tenant',
                '--force' => true,
            ]);

            // 6️⃣ Rodar seeders opcionais do tenant
            Artisan::call('db:seed', [
                '--class' => 'TenantDatabaseSeeder',
                '--database' => 'tenant',
                '--force' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tenant criado com sucesso e database inicializado.',
                'data' => $tenant
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar tenant',
                'errors' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Criar o banco de dados físico do tenant
     */
    protected function createTenantDatabase(string $databaseName)
    {
        try {
            DB::statement(
                "CREATE DATABASE IF NOT EXISTS `$databaseName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            );
        } catch (\Exception $e) {
            throw new \Exception("Erro ao criar database: " . $e->getMessage());
        }
    }

    /**
     * Configurar dinamicamente a conexão tenant
     */
    protected function configureTenantConnection(string $databaseName)
    {
        config(['database.connections.tenant.database' => $databaseName]);
        DB::purge('tenant');
        DB::reconnect('tenant');

        try {
            DB::connection('tenant')->getPdo();
        } catch (\Exception $e) {
            throw new \Exception("Erro ao conectar no database do tenant: " . $e->getMessage());
        }
    }
}
