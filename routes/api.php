<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NewClientsController;
use App\Http\Controllers\ProcessNewClientsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rotas públicas (sem autenticação)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});

// Rotas protegidas (com autenticação)
Route::middleware('api.token')->group(function () {
    // Rotas para clientes
    Route::get('/newClients', [NewClientsController::class, 'index']);
    Route::post('/newClients', [NewClientsController::class, 'store']);

    // Nova rota para consulta de clientes com filtros
    Route::get('/consultClients', [NewClientsController::class, 'consultClients']);

    // Rotas para processamento de clientes
    Route::prefix('process')->group(function () {
        Route::post('/pending-clients', [ProcessNewClientsController::class, 'processPendingClients']);
        Route::get('/statistics', [ProcessNewClientsController::class, 'getStatistics']);
    });

    // Rotas de autenticação protegidas
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Rotas do dashboard
    Route::get('/dashboard/statistics', [DashboardController::class, 'getStatistics']);
    Route::get('/dashboard/chart-data', [DashboardController::class, 'getChartData']);
    Route::get('/dashboard/recent-clients', [DashboardController::class, 'getRecentClients']);

    // Rota de teste simples
    Route::get('/test', function () {
        return response()->json(['message' => 'API funcionando!']);
    });

    // Rota de teste de login
    Route::post('/test-login', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Teste de login funcionando!',
            'data' => $request->all()
        ]);
    });
});
