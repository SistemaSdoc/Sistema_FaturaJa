<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant;
use App\Models\TenantUser;

class ApiAuthController extends Controller
{
    /**
     * LOGIN POR EMAIL (descobre tenant automaticamente)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $tenants = Tenant::all();
        $tenant = null;
        $user = null;

        foreach ($tenants as $t) {
            if (!$t->database_name) continue;

            // Conecta no tenant temporariamente
            config(['database.connections.tenant.database' => $t->database_name]);
            DB::purge('tenant');
            DB::reconnect('tenant');

            try {
                $u = TenantUser::on('tenant')->where('email', $request->email)->first();
            } catch (\Exception $e) {
                continue;
            }

            if ($u) {
                $tenant = $t;
                $user = $u;
                break;
            }
        }

        if (!$tenant || !$user) {
            return response()->json([
                'success' => false,
                'message' => 'Empresa ou usuário não encontrado para este email'
            ], 404);
        }

        // Verifica senha
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciais inválidas'
            ], 401);
        }

        // Cria token
        try {
            $token = $user->setConnection('tenant')->createToken('api-token')->plainTextToken;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar token de autenticação no tenant'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'token' => $token,
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'subdomain' => $tenant->subdomain,
                'database_name' => $tenant->database_name,
                'email' => $tenant->email ?? null,
                'logo' => $tenant->logo ?? null,
            ],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
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

    /**
     * Retorna dados do usuário autenticado
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }
}
