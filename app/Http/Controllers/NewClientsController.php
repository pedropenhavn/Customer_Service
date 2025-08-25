<?php

namespace App\Http\Controllers;

use App\Models\NewClient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NewClientsController extends Controller
{
    /**
     * Display a listing of the resource with filters.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = NewClient::query();

            // Filtro por CNPJ
            if ($request->has('cnpj') && !empty($request->cnpj)) {
                $query->where('cnpj', 'like', '%' . $request->cnpj . '%');
            }

            // Filtro por origem
            if ($request->has('origem') && !empty($request->origem)) {
                $query->where('origem', $request->origem);
            }

            // Filtro por status
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            // Filtro por flag
            if ($request->has('flag') && $request->flag !== '') {
                $query->where('flag', $request->flag);
            }

            // Filtro por data de criação (from)
            if ($request->has('created_from') && !empty($request->created_from)) {
                $query->whereDate('created_at', '>=', $request->created_from);
            }

            // Filtro por data de criação (to)
            if ($request->has('created_to') && !empty($request->created_to)) {
                $query->whereDate('created_at', '<=', $request->created_to);
            }

            // Ordenação
            $orderBy = $request->get('order_by', 'created_at');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginação
            $perPage = $request->get('per_page', 15);
            $clients = $query->paginate($perPage);

            return response()->json([
                'data' => $clients->items(),
                'pagination' => [
                    'current_page' => $clients->currentPage(),
                    'last_page' => $clients->lastPage(),
                    'per_page' => $clients->perPage(),
                    'total' => $clients->total(),
                    'from' => $clients->firstItem(),
                    'to' => $clients->lastItem(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $input = $request->all();
            
            // Verificar se é um array ou objeto único
            $clients = is_array($input) && isset($input[0]) ? $input : [$input];
            
            $savedCount = 0;
            $errors = [];

            // Iterar por cada cliente
            foreach ($clients as $index => $clientData) {
                // Validar estrutura obrigatória
                if (!$this->validateClientStructure($clientData)) {
                    $errors[] = "Cliente na posição {$index}: Estrutura inválida. Campos obrigatórios: cnpj, json, origem";
                    continue;
                }

                // Validar CNPJ
                if (empty($clientData['cnpj'])) {
                    $errors[] = "Cliente na posição {$index}: CNPJ é obrigatório";
                    continue;
                }

                // Validar JSON
                if (!isset($clientData['json']) || !is_array($clientData['json'])) {
                    $errors[] = "Cliente na posição {$index}: Campo 'json' deve ser um objeto válido";
                    continue;
                }

                // Validar origem
                if (empty($clientData['origem'])) {
                    $errors[] = "Cliente na posição {$index}: Campo 'origem' é obrigatório";
                    continue;
                }

                try {
                    // Criar o registro no banco
                    NewClient::create([
                        'cnpj' => $clientData['cnpj'],
                        'json' => $clientData['json'],
                        'sintegra' => null, // Futuramente será preenchido
                        'receita' => null, // Futuramente será preenchido
                        'simples_nacional' => null, // Futuramente será preenchido
                        'origem' => $clientData['origem'],
                        'status' => 'PEN', // Valor default
                        'flag' => 0, // Valor default
                    ]);

                    $savedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Cliente na posição {$index}: Erro ao salvar no banco - " . $e->getMessage();
                }
            }

            $response = [
                'message' => 'Processamento concluído',
                'saved_count' => $savedCount,
                'total_received' => count($clients),
                'errors' => $errors
            ];

            $statusCode = $savedCount > 0 ? 201 : 400;

            return response()->json($response, $statusCode);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validar se a estrutura do cliente está correta
     */
    private function validateClientStructure(array $clientData): bool
    {
        $requiredFields = ['cnpj', 'json', 'origem'];
        
        foreach ($requiredFields as $field) {
            if (!isset($clientData[$field])) {
                return false;
            }
        }
        
        return true;
    }
}
