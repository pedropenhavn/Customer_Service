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
     * Processa clientes pendentes
     */
    public function processPendingClients(): JsonResponse
    {
        try {
            Log::info('Iniciando processamento de clientes pendentes');
            
            $pendingClients = NewClient::where('status', 'PEN')
                ->where('flag', 0)
                ->get();

            Log::info('Clientes pendentes encontrados: ' . $pendingClients->count());

            if ($pendingClients->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Nenhum cliente pendente',
                    'data' => []
                ]);
            }

            $processed = 0;
            $errors = 0;
            $results = [];

            foreach ($pendingClients as $client) {
                Log::info("Processando cliente CNPJ: {$client->cnpj}");
                
                $result = $this->validateClient($client);
                
                Log::info("Resultado validação: " . json_encode($result));
                
                if ($result['valid']) {
                    $client->update(['status' => 'APV', 'flag' => 1]);
                    $processed++;
                } else {
                    $client->update(['status' => 'RPV', 'flag' => 1]);
                    $errors++;
                }
                
                $results[] = [
                    'cnpj' => $client->cnpj,
                    'valid' => $result['valid'],
                    'message' => $result['message']
                ];
            }

            Log::info("Processamento concluído. Processados: {$processed}, Erros: {$errors}");

            return response()->json([
                'success' => true,
                'message' => "Processados: {$processed}, Erros: {$errors}",
                'data' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('Erro no processamento: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Erro interno: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Valida um cliente individual
     */
    private function validateClient(NewClient $client): array
    {
        try {
            Log::info("Iniciando validação do cliente: {$client->cnpj}");
            
            $cnpj = $this->normalizeCnpj($client->cnpj);
            Log::info("CNPJ normalizado: {$cnpj}");
            
            $jsonData = is_string($client->json) ? json_decode($client->json, true) : $client->json;
            Log::info("Dados JSON original: " . json_encode($jsonData));

            // Extrai dados do endereço se estiver aninhado
            $clientData = $this->extractAddressData($jsonData);
            Log::info("Dados extraídos: " . json_encode($clientData));

            // Validações básicas
            if (!$this->isValidCnpj($cnpj)) {
                Log::warning("CNPJ inválido: {$cnpj}");
                return ['valid' => false, 'message' => 'CNPJ inválido'];
            }

            if (!$this->hasRequiredFields($clientData)) {
                Log::warning("Campos obrigatórios ausentes para CNPJ: {$cnpj}");
                return ['valid' => false, 'message' => 'Campos obrigatórios ausentes'];
            }

            // Consulta CNPJ.ws
            Log::info("Consultando CNPJ.ws para: {$cnpj}");
            $cnpjData = $this->getCnpjData($cnpj);
            Log::info("Resposta CNPJ.ws: " . json_encode($cnpjData));
            
            if (!$cnpjData['success']) {
                Log::error("Erro na consulta CNPJ.ws para {$cnpj}: " . $cnpjData['message']);
                return ['valid' => false, 'message' => 'Erro na consulta CNPJ.ws'];
            }

            // Valida dados
            Log::info("Comparando dados para CNPJ: {$cnpj}");
            $validation = $this->compareData($clientData, $cnpjData['data']);
            Log::info("Resultado comparação: " . json_encode($validation));
            
            return $validation;

        } catch (\Exception $e) {
            Log::error("Erro validando cliente {$client->cnpj}: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return ['valid' => false, 'message' => 'Erro interno na validação'];
        }
    }

    /**
     * Normaliza CNPJ
     */
    private function normalizeCnpj(string $cnpj): string
    {
        return preg_replace('/[^0-9]/', '', $cnpj);
    }

    /**
     * Valida formato do CNPJ
     */
    private function isValidCnpj(string $cnpj): bool
    {
        return strlen($cnpj) === 14 && !preg_match('/^(\d)\1+$/', $cnpj);
    }

    /**
     * Verifica campos obrigatórios
     */
    private function hasRequiredFields(array $data): bool
    {
        $required = ['logradouro', 'numero', 'bairro', 'cidade', 'estado', 'cep'];
        return !array_diff($required, array_keys($data));
    }

    /**
     * Consulta CNPJ.ws
     */
    private function getCnpjData(string $cnpj): array
    {
        $url = env('CNPJ_WS_URI') . $cnpj;
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_HTTPHEADER => [
                'x_api_token: ' . env('CNPJ_WS_API_KEY'),
                'Accept: application/json'
            ]
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            return ['success' => false, 'message' => 'Erro na consulta'];
        }

        $data = json_decode($response, true);
        return ['success' => true, 'data' => $data];
    }

    /**
     * Compara dados do cliente com dados do CNPJ.ws
     */
    private function compareData(array $clientData, array $cnpjData): array
    {
        $establishment = $cnpjData['estabelecimento'] ?? null;
        if (!$establishment) {
            return ['valid' => false, 'message' => 'Dados do estabelecimento não encontrados'];
        }

        $errors = [];
        
        // Campos para comparar
        $fields = [
            'logradouro' => 'logradouro',
            'numero' => 'numero',
            'bairro' => 'bairro',
            'cep' => 'cep'
        ];

        foreach ($fields as $clientField => $cnpjField) {
            $clientValue = trim(strtolower($clientData[$clientField] ?? ''));
            $cnpjValue = trim(strtolower($establishment[$cnpjField] ?? ''));
            
            if ($clientValue !== $cnpjValue) {
                $errors[] = "Campo '{$clientField}' não confere";
            }
        }

        // Valida cidade e estado
        if (isset($clientData['cidade']) && isset($establishment['cidade']['nome'])) {
            $clientCidade = trim(strtolower($clientData['cidade']));
            $cnpjCidade = trim(strtolower($establishment['cidade']['nome']));
            if ($clientCidade !== $cnpjCidade) {
                $errors[] = "Cidade não confere";
            }
        }

        if (isset($clientData['estado']) && isset($establishment['estado']['sigla'])) {
            $clientEstado = trim(strtoupper($clientData['estado']));
            $cnpjEstado = trim(strtoupper($establishment['estado']['sigla']));
            if ($clientEstado !== $cnpjEstado) {
                $errors[] = "Estado não confere";
            }
        }

        return [
            'valid' => empty($errors),
            'message' => empty($errors) ? 'Dados válidos' : implode(', ', $errors)
        ];
    }

    /**
     * Extrai dados do endereço do JSON
     */
    private function extractAddressData(array $jsonData): array
    {
        // Se os dados estão aninhados em 'endereco'
        if (isset($jsonData['endereco']) && is_array($jsonData['endereco'])) {
            $addressData = $jsonData['endereco'];
            
            // Mapeia 'uf' para 'estado' se necessário
            if (isset($addressData['uf']) && !isset($addressData['estado'])) {
                $addressData['estado'] = $addressData['uf'];
            }
            
            return $addressData;
        }
        
        // Se os dados estão no nível raiz
        return $jsonData;
    }

    /**
     * Estatísticas dos clientes
     */
    public function getStatistics(): JsonResponse
    {
        $stats = [
            'total' => NewClient::count(),
            'pending' => NewClient::where('status', 'PEN')->where('flag', 0)->count(),
            'processed' => NewClient::where('status', 'PRO')->count(),
            'error' => NewClient::where('status', 'ERR')->count(),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }
}
