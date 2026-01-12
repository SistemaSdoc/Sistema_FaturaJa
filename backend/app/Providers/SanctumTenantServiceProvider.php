<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;
use App\Models\PersonalAccessToken as TenantPersonalAccessToken;

class SanctumTenantServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Diz pro Sanctum usar o model do tenant
        Sanctum::usePersonalAccessTokenModel(TenantPersonalAccessToken::class);
    }
}
