<?php

namespace App\Http\Controllers;

use App\Models\NewClient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessNewClientsController extends Controller
{
    /**
     * Processa clientes com status PEN e flag = 0
     */
    public function processPendingClients(): JsonResponse
    {
        try {
            Log::info('Iniciando processamento de clientes pendentes');
            
            $pendingClients = NewClient::where('status', 'PEN')
                ->where('flag', 0)
                ->limit(100)
                ->get();

            if ($pendingClients->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Nenhum cliente pendente encontrado para processamento',
                    'data' => []
                ]);
            }

            $processedCount = 0;
            $errorCount = 0;
            $results = [];

            DB::beginTransaction();

            try {
                foreach ($pendingClients as $client) {
                    try {
                        // Marca o cliente como em processamento
                        $client->update(['flag' => 1]);
                        
                        // Envia dados para processamento
                        $jsonData = is_string($client->json) ? json_decode($client->json, true) : $client->json;
                        $result = $this->processClient($client->cnpj, $jsonData);
                        
                        if ($result['success']) {
                            // Atualiza status para processado
                            $client->update([
                                'status' => 'PRO',
                                'flag' => 2,
                                'processed_at' => now()
                            ]);
                            
                            $processedCount++;
                            Log::info("Cliente {$client->cnpj} processado com sucesso");
                        } else {
                            // Marca como erro
                            $client->update([
                                'status' => 'ERR',
                                'flag' => 3,
                                'error_message' => $result['message']
                            ]);
                            
                            $errorCount++;
                            Log::error("Erro ao processar cliente {$client->cnpj}: {$result['message']}");
                        }
                        
                        $results[] = [
                            'id' => $client->id,
                            'cnpj' => $client->cnpj,
                            'status' => $client->status,
                            'success' => $result['success'],
                            'message' => $result['message']
                        ];
                        
                    } catch (\Exception $e) {
                        // Marca como erro em caso de exceção
                        $client->update([
                            'status' => 'ERR',
                            'flag' => 3,
                            'error_message' => $e->getMessage()
                        ]);
                        
                        $errorCount++;
                        Log::error("Exceção ao processar cliente {$client->cnpj}: {$e->getMessage()}");
                        
                        $results[] = [
                            'id' => $client->id,
                            'cnpj' => $client->cnpj,
                            'status' => 'ERR',
                            'success' => false,
                            'message' => $e->getMessage()
                        ];
                    }
                }
                
                DB::commit();
                
                Log::info("Processamento concluído: {$processedCount} sucessos, {$errorCount} erros");
                
                return response()->json([
                    'success' => true,
                    'message' => "Processamento concluído: {$processedCount} clientes processados com sucesso, {$errorCount} com erro",
                    'data' => [
                        'total_processed' => $pendingClients->count(),
                        'success_count' => $processedCount,
                        'error_count' => $errorCount,
                        'results' => $results
                    ]
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Erro geral no processamento: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao processar clientes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Processa um cliente individual
     */
    private function processClient(string $cnpj, array $json): array
    {
        try {
            // Validação básica do CNPJ
            if (!$this->validateCnpj($cnpj)) {
                return [
                    'success' => false,
                    'message' => 'CNPJ inválido'
                ];
            }

            // Validação dos dados JSON
            if (!$this->validateJsonData($json)) {
                return [
                    'success' => false,
                    'message' => 'Dados JSON inválidos ou incompletos'
                ];
            }

            // Simula processamento (aqui você implementaria a lógica real)
            $processingResult = $this->simulateProcessing($cnpj, $json);
            
            if ($processingResult) {
                return [
                    'success' => true,
                    'message' => 'Cliente processado com sucesso'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Falha no processamento do cliente'
                ];
            }
            
        } catch (\Exception $e) {
            Log::error("Erro no processamento do cliente {$cnpj}: " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Erro interno no processamento: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Valida formato do CNPJ
     */
    private function validateCnpj(string $cnpj): bool
    {
        // Remove caracteres especiais
        $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
        
        // Verifica se tem 14 dígitos
        if (strlen($cnpj) !== 14) {
            return false;
        }
        
        // Verifica se não são todos iguais
        if (preg_match('/^(\d)\1+$/', $cnpj)) {
            return false;
        }
        
        return true;
    }

    /**
     * Valida dados JSON
     */
    private function validateJsonData(array $json): bool
    {
        // Verifica se é um array válido
        if (!is_array($json) || empty($json)) {
            return false;
        }
        
        // Adicione aqui suas validações específicas
        // Por exemplo, verificar campos obrigatórios
        
        return true;
    }

    /**
     * Simula o processamento do cliente
     */
    private function simulateProcessing(string $cnpj, array $json): bool
    {
        // Simula um delay de processamento
        usleep(rand(100000, 500000)); // 0.1 a 0.5 segundos
        
        // Simula sucesso em 90% dos casos
        return rand(1, 100) <= 90;
    }

    /**
     * Retorna estatísticas dos clientes
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $stats = [
                'total' => NewClient::count(),
                'pending' => NewClient::where('status', 'PEN')->where('flag', 0)->count(),
                'processing' => NewClient::where('flag', 1)->count(),
                'processed' => NewClient::where('status', 'PRO')->count(),
                'error' => NewClient::where('status', 'ERR')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter estatísticas: ' . $e->getMessage()
            ], 500);
        }
    }
}
