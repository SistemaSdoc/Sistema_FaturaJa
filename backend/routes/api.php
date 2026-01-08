<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\ApiTenantUserController;
use App\Http\Controllers\ApiClienteController;
use App\Http\Controllers\ApiProdutoController;
use App\Http\Controllers\ApiFaturaController;
use App\Http\Controllers\ApiItemFaturaController;
use App\Http\Controllers\ApiPagamentoController;
use App\Http\Controllers\ItemFaturaController;
use App\Http\Controllers\ApiTenantController;


/*
|--------------------------------------------------------------------------
| LOGIN GLOBAL (LANDLORD)
|--------------------------------------------------------------------------
*/
Route::post('/login', [ApiAuthController::class, 'login']);
Route::post('/logout', [ApiAuthController::class, 'logout']);

/*
|--------------------------------------------------------------------------
| ROTAS MULTI-TENANT
|--------------------------------------------------------------------------
*/

Route::middleware(['tenant', 'auth:sanctum', 'tenant.user'])->group(function () {

    // Usuário autenticado
    Route::get('/me', [ApiAuthController::class, 'me']);


    
Route::get('/empresa/me', [ApiTenantController::class, 'me']);
Route::get('/empresa/kpis', [ApiTenantController::class, 'kpis']);

    Route::get('/empresa/faturas', [ApiTenantController::class, 'faturas']);
    Route::get('/empresa/vendas-categorias', [ApiTenantController::class, 'vendasCategorias']);
    Route::get('/empresa/pagamentos', [ApiTenantController::class, 'pagamentos']);
    // USERS → admin
    Route::apiResource('users', ApiTenantUserController::class)
        ->middleware('role:admin');

    // CLIENTES → admin + empresa
    Route::apiResource('clientes', ApiClienteController::class)
        ->middleware('role:admin,empresa');

    // PRODUTOS → admin + empresa
    Route::apiResource('produtos', ApiProdutoController::class)
        ->middleware('role:admin,empresa');

    // FATURAS → admin + empresa
    Route::apiResource('faturas', ApiFaturaController::class)
        ->middleware('role:admin,empresa');

    // ITENS DE FATURA
    Route::apiResource('faturas/{fatura}/itens', ApiItemFaturaController::class)
        ->middleware('role:admin,empresa');

    // PAGAMENTOS
    Route::apiResource('faturas/{fatura}/pagamentos', ApiPagamentoController::class)
        ->middleware('role:admin,empresa');

    Route::get('/pagamentos/all', [ApiPagamentoController::class, 'all'])
        ->middleware('role:admin,empresa');

    /*
    |--------------------------------------------------------------------------
    | PORTAL CLIENTE
    |--------------------------------------------------------------------------
    */
    Route::prefix('cliente')->middleware('role:cliente')->group(function () {
        Route::get('/faturas', [ApiFaturaController::class, 'indexCliente']);
        Route::get('/faturas/{fatura}', [ApiFaturaController::class, 'show']);
        Route::get('/pagamentos', [ApiPagamentoController::class, 'indexCliente']);
    });
});
