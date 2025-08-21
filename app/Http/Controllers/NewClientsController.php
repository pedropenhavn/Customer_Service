<?php

namespace App\Http\Controllers;

use App\Models\NewClient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NewClientsController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validar se o request contém um array
            $clients = $request->all();
            
            if (!is_array($clients)) {
                return response()->json([
                    'error' => 'O payload deve ser um array de clientes'
                ], 400);
            }

            $savedCount = 0;

            // Iterar por cada cliente no array
            foreach ($clients as $clientData) {
                // Verificar se o cliente tem CNPJ
                if (!isset($clientData['cnpj'])) {
                    continue; // Pula clientes sem CNPJ
                }

                // Criar o registro no banco
                NewClient::create([
                    'cnpj' => $clientData['cnpj'],
                    'json' => json_encode($clientData), // Salva o objeto completo em JSON
                    'status' => 'PEN', // Valor default
                    'flag' => 0, // Valor default
                ]);

                $savedCount++;
            }

            return response()->json([
                'message' => 'Clientes processados com sucesso',
                'saved_count' => $savedCount,
                'total_received' => count($clients)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao processar clientes: ' . $e->getMessage()
            ], 500);
        }
    }
}
