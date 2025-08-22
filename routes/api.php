<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
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

// Rota para criar novos clientes
Route::post('/newClients', [NewClientsController::class, 'store']);

// Rotas para processamento de clientes
Route::prefix('process')->group(function () {
    Route::post('/pending-clients', [ProcessNewClientsController::class, 'processPendingClients']);
    Route::get('/statistics', [ProcessNewClientsController::class, 'getStatistics']);
});

// Rota de health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
