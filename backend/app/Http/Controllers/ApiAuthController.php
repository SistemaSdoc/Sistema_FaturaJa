<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant;
use App\Models\TenantUser;
use Illuminate\Support\Facades\Log;

class ApiAuthController extends Controller
{
    /**
     * LOGIN POR EMAIL (descobre tenant automaticamente)
     */
public function login(Request $request)
{
    // 1️⃣ Validação do request
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required|string',
    ]);

    // 2️⃣ Descobrir tenant percorrendo todos os tenants
    $tenants = Tenant::all();
    $tenant = null;
    $user = null;

    foreach ($tenants as $t) {
        // Se tenant não tiver database_name, ignora
        if (!$t->database_name) {
            Log::warning("Tenant {$t->name} sem database_name, pulando...");
            continue;
        }

        // Configura conexão com o banco do tenant
        config(['database.connections.tenant.database' => $t->database_name]);
        DB::purge('tenant');

        try {
            DB::reconnect('tenant');
            $u = TenantUser::on('tenant')->where('email', $request->email)->first();
        } catch (\Exception $e) {
            Log::error("Erro ao conectar ou consultar tenant {$t->name}: " . $e->getMessage());
            continue; // tenta o próximo tenant
        }

        if ($u) {
            $tenant = $t;
            $user = $u;
            break;
        }
    }

    // 3️⃣ Se não encontrar tenant ou usuário
    if (!$tenant || !$user) {
        return response()->json([
            'success' => false,
            'message' => 'Empresa ou usuário não encontrado para este email'
        ], 404);
    }

    // 4️⃣ Verificar senha
    if (!Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Credenciais inválidas'
        ], 401);
    }

    // 5️⃣ Criar token no landlord (garante que token seja criado mesmo em multi-tenant)
    try {
        $token = $user
            ->setConnection('landlord')
            ->createToken('api-token')
            ->plainTextToken;
    } catch (\Exception $e) {
        Log::error("Erro ao criar token para usuário {$user->email}: " . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Erro ao criar token de autenticação'
        ], 500);
    }

    // 6️⃣ Retornar dados para frontend
    return response()->json([
        'success' => true,
        'token'   => $token,
        'tenant'  => [
            'id'            => $tenant->id,
            'name'          => $tenant->name,
            'subdomain'     => $tenant->subdomain,
            'database_name' => $tenant->database_name,
            'data'          => $tenant->data ?? null,
            'email'         => $tenant->email ?? null,
            'logo'          => $tenant->logo ?? null,
            'nif'           => $tenant->nif ?? null,
        ],
        'user'    => [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ],
    ]);
}


    /**
     * LOGOUT
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso'
        ]);
    }

    public function me(Request $request)
{
    $user = $request->user();

    return response()->json([
        'user' => [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ]
    ]);
}

}
