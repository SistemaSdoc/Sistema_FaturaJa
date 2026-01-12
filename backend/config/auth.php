<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Authentication Guard
    |--------------------------------------------------------------------------
    | Para API usamos Sanctum como padrão
    */
    'defaults' => [
        'guard' => 'sanctum',
        'passwords' => 'tenant_users',
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    */
    'guards' => [

        // Usado apenas se tiveres páginas web (opcional)
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        // Guard principal da API (TENANT)
        'sanctum' => [
            'driver' => 'sanctum',
            'provider' => 'tenant_users',
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    */
    'providers' => [

        // Landlord / Admin global
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],

        // Usuários do tenant (EMPRESA)
        'tenant_users' => [
            'driver' => 'eloquent',
            'model' => App\Models\TenantUser::class,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Password Reset Settings
    |--------------------------------------------------------------------------
    */
    'passwords' => [

        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],

        'tenant_users' => [
            'provider' => 'tenant_users',
            'table' => 'tenant_password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    */
    'password_timeout' => 10800,

];
