<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant;
use App\Models\TenantUser;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;


class ApiAuthController extends Controller
{
    /**
     * LOGIN POR EMAIL (descobre tenant automaticamente)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $tenant = null;
        $user   = null;

        foreach (Tenant::all() as $t) {
            if (!$t->database_name) {
                continue;
            }

            // 🔁 Conecta corretamente no banco do tenant
            config(['database.connections.tenant.database' => $t->database_name]);
            DB::purge('tenant');
            DB::reconnect('tenant');

            try {
                $u = TenantUser::on('tenant')
                    ->where('email', $request->email)
                    ->first();
            } catch (\Throwable $e) {
                continue;
            }

            if ($u) {
                $tenant = $t;
                $user   = $u;
                break;
            }
        }

        if (!$tenant || !$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário ou empresa não encontrados',
            ], 404);
        }

        // 🔐 Verifica senha
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciais inválidas',
            ], 401);
        }

        Log::info('Authorization Header', [
    'auth' => request()->header('Authorization')
]);

Log::info('Auth check', [
    'check' => Auth::check(),
    'user'  => Auth::user(),
    'guard' => Auth::getDefaultDriver()
]);

        // 🧹 Revoga tokens antigos (EVITA 401 FANTASMA)
        $user->setConnection('tenant')->tokens()->delete();

        // 🔑 Cria token corretamente no tenant
        $token = $user
            ->setConnection('tenant')
            ->createToken('tenant-token')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'token'   => $token,

            'tenant' => [
                'id'            => $tenant->id,
                'name'          => $tenant->name,
                'subdomain'     => $tenant->subdomain,
                'database_name'=> $tenant->database_name,
                'email'         => $tenant->email ?? null,
                'logo'          => $tenant->logo ?? null,
            ],

            'user' => [
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
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ]);
    }

    /**
     * Usuário autenticado
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }
}
