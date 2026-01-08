<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|array  $roles
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = Auth::guard('tenant')->user();

        if (!$user || !in_array($user->role, $roles)) {
            abort(403, "Acesso negado: precisa de uma das roles [" . implode(',', $roles) . "]");
        }

        return $next($request);
    }
}
