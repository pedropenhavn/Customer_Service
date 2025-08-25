<?php

namespace App\Http\Controllers;

use App\Models\NewClient;
use App\Services\ClientValidationService;
use App\Services\CnpjValidationService;
use App\Services\ViaCepService;
use App\Services\SintegraService;
use App\Services\CnpjWsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ProcessNewClientsController extends Controller
{
    private ClientValidationService $clientValidationService;
    private CnpjValidationService $cnpjValidationService;
    private ViaCepService $viaCepService;
    private SintegraService $sintegraService;
    private CnpjWsService $cnpjWsService;

    public function __construct(
        ClientValidationService $clientValidationService,
        CnpjValidationService $cnpjValidationService,
        ViaCepService $viaCepService,
        SintegraService $sintegraService,
        CnpjWsService $cnpjWsService
    ) {
        $this->clientValidationService = $clientValidationService;
        $this->cnpjValidationService = $cnpjValidationService;
        $this->viaCepService = $viaCepService;
        $this->sintegraService = $sintegraService;
        $this->cnpjWsService = $cnpjWsService;
    }

    /**
     * Processa clientes pendentes
     */
    public function processPendingClients(): JsonResponse
    {
        try {
            $pendingClients = NewClient::where('status', 'PEN')
                ->where('flag', 0)
                ->get();

            if ($pendingClients->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Nenhum cliente pendente',
                    'data' => []
                ]);
            }

            $results = $this->processClients($pendingClients);

            return response()->json([
                'success' => true,
                'message' => "Processados: {$results['processed']}, Erros: {$results['errors']}",
                'data' => $results['data']
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao processar clientes pendentes: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Processa uma lista de clientes
     */
    private function processClients($clients): array
    {
        $processed = 0;
        $errors = 0;
        $results = [];

        foreach ($clients as $client) {
            $result = $this->validateClient($client);
            
            $this->updateClientStatus($client, $result['valid']);
            
            if ($result['valid']) {
                $processed++;
            } else {
                $errors++;
            }
            
            $results[] = [
                'cnpj' => $client->cnpj,
                'valid' => $result['valid'],
                'message' => $result['message']
            ];
        }

        return [
            'processed' => $processed,
            'errors' => $errors,
            'data' => $results
        ];
    }

    /**
     * Valida um cliente individual
     */
    private function validateClient(NewClient $client): array
    {
        try {
            $cnpj = $this->cnpjValidationService->normalizeCnpj($client->cnpj);
            $clientData = $this->clientValidationService->extractClientData($client->json);

            // Validações básicas
            $cnpjValidation = $this->cnpjValidationService->validateCnpj($cnpj);
            if (!$cnpjValidation['valid']) {
                return $this->createValidationResult(false, $cnpjValidation['message']);
            }

            if (!$this->clientValidationService->hasRequiredFields($clientData)) {
                return $this->createValidationResult(false, 'Campos obrigatórios ausentes');
            }

            // Consulta ViaCEP
            $this->processViaCep($client, $clientData);

            // Consulta Sintegra
            $sintegraResult = $this->processSintegra($client, $cnpj, $clientData);
            if ($sintegraResult) {
                return $sintegraResult;
            }

            // Consulta CNPJ.ws como fallback
            return $this->processCnpjWs($client, $cnpj, $clientData);

        } catch (\Exception $e) {
            Log::error('Erro na validação do cliente: ' . $e->getMessage());
            return $this->createValidationResult(false, 'Erro interno na validação');
        }
    }

    /**
     * Processa consulta ViaCEP
     */
    private function processViaCep(NewClient $client, array $clientData): void
    {
        $cepResult = $this->viaCepService->consultarCep($clientData['cep']);
        
        $client->update([
            'consultacep' => json_encode($cepResult['data'], JSON_UNESCAPED_UNICODE)
        ]);

        // Se a consulta foi bem-sucedida, faz a validação
        if ($cepResult['success'] && $cepResult['data']) {
            $validation = $this->viaCepService->validarDados($clientData, $cepResult['data']);
            
            // Salva a validação do ViaCEP no reason se não houver validação anterior
            if (!$client->reason) {
                $client->update([
                    'reason' => json_encode($validation, JSON_UNESCAPED_UNICODE)
                ]);
            }
        }
    }

    /**
     * Processa consulta Sintegra
     */
    private function processSintegra(NewClient $client, string $cnpj, array $clientData): ?array
    {
        $sintegraData = $this->sintegraService->consultarSintegra($cnpj);
        
        if (!$sintegraData['success']) {
            return null; // Continua para CNPJ.ws
        }

        $client->update([
            'sintegra' => json_encode($sintegraData['data'], JSON_UNESCAPED_UNICODE)
        ]);

        $validation = $this->sintegraService->validarDados($clientData, $sintegraData['data']);
        
        $client->update([
            'reason' => json_encode($validation, JSON_UNESCAPED_UNICODE)
        ]);

        return $validation;
    }

    /**
     * Processa consulta CNPJ.ws
     */
    private function processCnpjWs(NewClient $client, string $cnpj, array $clientData): array
    {
        $cnpjData = $this->cnpjWsService->consultarCnpj($cnpj);
        
        if (!$cnpjData['success']) {
            return $this->createValidationResult(false, 'Erro na consulta das APIs');
        }

        $client->update([
            'cnpjws' => json_encode($cnpjData['data'], JSON_UNESCAPED_UNICODE)
        ]);

        $validation = $this->cnpjWsService->validarDados($clientData, $cnpjData['data']);
        
        $client->update([
            'reason' => json_encode($validation, JSON_UNESCAPED_UNICODE)
        ]);

        return $validation;
    }

    /**
     * Atualiza status do cliente
     */
    private function updateClientStatus(NewClient $client, bool $isValid): void
    {
        $status = $isValid ? 'APV' : 'RPV';
        $client->update(['status' => $status, 'flag' => 1]);
    }

    /**
     * Cria resultado de validação padronizado
     */
    private function createValidationResult(bool $valid, string $message): array
    {
        return [
            'valid' => $valid,
            'message' => $message
        ];
    }

    /**
     * Retorna estatísticas dos clientes
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
