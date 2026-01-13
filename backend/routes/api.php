<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\ApiTenantUserController;
use App\Http\Controllers\ApiClienteController;
use App\Http\Controllers\ApiProdutoController;
use App\Http\Controllers\ApiFaturaController;
use App\Http\Controllers\ApiItemFaturaController;
use App\Http\Controllers\ApiPagamentoController;
use App\Http\Controllers\ApiTenantController;


/*
|--------------------------------------------------------------------------
| LOGIN GLOBAL (LANDLORD)
|--------------------------------------------------------------------------
*/
Route::post('/login', [ApiAuthController::class, 'login']);

Route::middleware(['tenant', 'auth:sanctum', 'tenant.user'])->group(function () {

    Route::get('/me', [ApiAuthController::class, 'me']);
    Route::get('/empresa/kpis', [ApiTenantController::class, 'kpis']);
    Route::get('/empresa/vendas-categorias', [ApiTenantController::class, 'vendasCategorias']
);


    Route::get('/pagamentos/all', [ApiPagamentoController::class, 'all'])
        ->middleware('role:admin,empresa');

    Route::post('/faturas/{fatura}/cancelar', [ApiFaturaController::class, 'cancelar']);
    Route::post('/faturas/{fatura}/send', [ApiFaturaController::class, 'send']);
    Route::post('/faturas/{fatura}/pagar', [ApiFaturaController::class, 'pagar']);

    Route::apiResource('clientes', ApiClienteController::class)
        ->middleware('role:admin,empresa');

    Route::apiResource('produtos', ApiProdutoController::class)
        ->middleware('role:admin,empresa');

    Route::apiResource('faturas', ApiFaturaController::class)
        ->middleware('role:admin,empresa');

    Route::apiResource('faturas/{fatura}/itens', ApiItemFaturaController::class)
        ->middleware('role:admin,empresa');

    Route::apiResource('faturas/{fatura}/pagamentos', ApiPagamentoController::class)
        ->middleware('role:admin,empresa');
    
        
Route::post('/logout', [ApiAuthController::class, 'logout']);
    
});
