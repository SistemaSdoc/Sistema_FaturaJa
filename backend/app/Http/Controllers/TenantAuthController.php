<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant;
use App\Models\TenantUser;

class TenantAuthController extends Controller
{
    /* =====================================================
     | FORMULÁRIOS
     ===================================================== */

    public function showLoginForm()
    {
        return view('tenant.auth.login');
    }

    public function showRegisterForm()
    {
        return view('tenant.auth.register');
    }

    /* =====================================================
     | LOGIN MULTI-TENANT (POR EMAIL)
     ===================================================== */
   public function login(Request $request)
{
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    $host = $request->getHost();

    // Se for landlord, autentica na tabela global de usuários (ou tenant_users se quiser)
    if ($host === 'faturaja.sdoca') {
        if (! Auth::guard('web')->attempt($request->only('email','password'))) {
            return back()->withErrors(['password' => 'Senha inválida.']);
        }

        $request->session()->regenerate();

        return redirect()->route('home'); // ou dashboard global do landlord
    }

    // Senão, é tenant
    $tenant = $this->findTenantByEmail($request->email);

    if (! $tenant) {
        return back()->withErrors([
            'email' => 'Usuário não pertence a nenhuma empresa.',
        ]);
    }

    config(['database.connections.tenant.database' => $tenant->database_name]);
    DB::purge('tenant');
    DB::reconnect('tenant');

    if (! Auth::guard('tenant')->attempt($request->only('email', 'password'))) {
        return back()->withErrors(['password' => 'Senha inválida.']);
    }

    $request->session()->regenerate();

    return redirect()->route('tenant.dashboard', ['tenant' => $tenant->subdomain]);
}


    /* =====================================================
     | LOGOUT
     ===================================================== */
    public function logout(Request $request)
    {
        Auth::guard('tenant')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('tenant.login');
    }

    /* =====================================================
     | MÉTODOS PRIVADOS
     ===================================================== */
    private function findTenantByEmail(string $email)
    {
        return Tenant::all()->first(function ($tenant) use ($email) {
            config(['database.connections.tenant.database' => $tenant->database_name]);
            DB::purge('tenant');
            DB::reconnect('tenant');

            return DB::connection('tenant')
                ->table('users')
                ->where('email', $email)
                ->exists();
        });
    }
}
