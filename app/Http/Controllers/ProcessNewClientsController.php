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
            $pendingClients = NewClient::where('id', 1)->get();

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
                $result = $this->validateClient($client);
                
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

            return response()->json([
                'success' => true,
                'message' => "Processados: {$processed}, Erros: {$errors}",
                'data' => $results
            ]);

        } catch (\Exception $e) {
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
            $cnpj = $this->normalizeCnpj($client->cnpj);
            $jsonData = is_string($client->json) ? json_decode($client->json, true) : $client->json;
            $clientData = $this->extractAddressData($jsonData);

            // Validações básicas
            $cnpjValidation = $this->isValidCnpj($cnpj);
            if (!$cnpjValidation['valid']) {
                return ['valid' => false, 'message' => $cnpjValidation['message']];
            }

            if (!$this->hasRequiredFields($clientData)) {
                return ['valid' => false, 'message' => 'Campos obrigatórios ausentes'];
            }

            // Primeiro tenta consultar Sintegra
            $sintegraData = $this->consultarSintegra($cnpj);
            
            if ($sintegraData['success']) {
                // Salva o JSON do Sintegra no banco
                $client->update(['sintegra' => json_encode($sintegraData['data'])]);
                $validation = $this->compararDados($clientData, $sintegraData['data']);
                $client->update(['reason' => json_encode($validation, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)]);
                return $validation;
            }

            // Se Sintegra falhar, tenta CNPJ.ws
            $cnpjData = $this->consultarCnpjWs($cnpj);
            
            if (!$cnpjData['success']) {
                return ['valid' => false, 'message' => 'Erro na consulta das APIs'];
            }

            // Salva o JSON do CNPJ.ws no banco
            $client->update(['cnpjws' => json_encode($cnpjData['data'])]);
            $validation = $this->compararDados($clientData, $cnpjData['data']);
            $client->update(['reason' => json_encode($validation, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)]);
            return $validation;

        } catch (\Exception $e) {
            return ['valid' => false, 'message' => 'Erro interno na validação'];
        }
    }

    /**
     * Consulta API Sintegra
     */
    private function consultarSintegra(string $cnpj): array
    {
        $token = env('SINTEGRA_API_KEY');
        $url = 'https://www.sintegraws.com.br/api/v1/execute-api.php';

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url . '?token=' . $token . '&cnpj=' . $cnpj . '&plugin=ST',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => false
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            return ['success' => false, 'message' => 'Erro na consulta Sintegra'];
        }

        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['success' => false, 'message' => 'Erro ao decodificar resposta Sintegra'];
        }

        // Verifica se a API retornou erro
        if ($data['status'] === 'ERROR' || $data['code'] !== '0') {
            return ['success' => false, 'message' => $data['message'] ?? 'Erro na API Sintegra'];
        }

        return ['success' => true, 'data' => $data];
    }

    /**
     * Consulta API CNPJ.ws
     */
    private function consultarCnpjWs(string $cnpj): array
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
            return ['success' => false, 'message' => 'Erro na consulta CNPJ.ws'];
        }

        $data = json_decode($response, true);
        return ['success' => true, 'data' => $data];
    }

    /**
     * Compara dados do cliente com dados da API
     */
    private function compararDados(array $clientData, array $apiData): array
    {
        // Verifica se é resposta do Sintegra ou CNPJ.ws
        if (isset($apiData['status']) && $apiData['status'] === 'OK') {
            return $this->compararDadosSintegra($clientData, $apiData);
        } else {
            return $this->compararDadosCnpjWs($clientData, $apiData);
        }
    }

    /**
     * Compara dados com resposta do Sintegra
     */
    private function compararDadosSintegra(array $clientData, array $sintegraData): array
    {
        $validation = [
            'api' => 'Sintegra',
            'message' => 'Validacao realizada no Sintegra',
            'campos_validados' => [],
            'campos_erro' => [],
            'total_validados' => 0,
            'total_erros' => 0
        ];

        // Validação de endereço
        $addressFields = [
            'logradouro' => 'logradouro',
            'numero' => 'numero',
            'cep' => 'cep'
        ];

        foreach ($addressFields as $clientField => $sintegraField) {
            $clientValue = trim(strtolower($clientData[$clientField] ?? ''));
            $sintegraValue = trim(strtolower($sintegraData[$sintegraField] ?? ''));
            
            if ($clientValue === $sintegraValue) {
                $validation['campos_validados'][] = $clientField;
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Campo '{$clientField}' nao confere com o Sintegra";
                $validation['total_erros']++;
            }
        }

        // Validação de cidade e estado
        if (isset($clientData['cidade']) && isset($sintegraData['municipio'])) {
            $clientCidade = trim(strtolower($clientData['cidade']));
            $sintegraCidade = trim(strtolower($sintegraData['municipio']));
            if ($clientCidade === $sintegraCidade) {
                $validation['campos_validados'][] = 'cidade';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Cidade nao confere com o Sintegra";
                $validation['total_erros']++;
            }
        }

        if (isset($clientData['estado']) && isset($sintegraData['uf'])) {
            $clientEstado = trim(strtoupper($clientData['estado']));
            $sintegraEstado = trim(strtoupper($sintegraData['uf']));
            if ($clientEstado === $sintegraEstado) {
                $validation['campos_validados'][] = 'estado';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Estado nao confere com o Sintegra";
                $validation['total_erros']++;
            }
        }

        // Validação situação cadastral
        $situacaoCnpj = $sintegraData['situacao_cnpj'] ?? null;
        if ($situacaoCnpj && $situacaoCnpj !== 'Sem restrição') {
            $validation['campos_erro'][] = "Situacao CNPJ invalida no Sintegra: {$situacaoCnpj}";
            $validation['total_erros']++;
        } else {
            $validation['campos_validados'][] = 'situacao_cnpj';
            $validation['total_validados']++;
        }

        // Validação situação IE
        $situacaoIe = $sintegraData['situacao_ie'] ?? null;
        if ($situacaoIe && $situacaoIe !== 'Ativo') {
            $validation['campos_erro'][] = "Situacao IE invalida no Sintegra: {$situacaoIe}";
            $validation['total_erros']++;
        } else {
            $validation['campos_validados'][] = 'situacao_ie';
            $validation['total_validados']++;
        }

        $validation['valid'] = $validation['total_erros'] === 0;
        $validation['message'] = $validation['valid'] ? 'Todos os campos validados no Sintegra' : 'Campos com divergencia no Sintegra';

        return $validation;
    }

    /**
     * Compara dados com resposta do CNPJ.ws
     */
    private function compararDadosCnpjWs(array $clientData, array $cnpjData): array
    {
        $establishment = $cnpjData['estabelecimento'] ?? null;
        if (!$establishment) {
            return ['valid' => false, 'message' => 'Dados do estabelecimento não encontrados'];
        }

        $validation = [
            'api' => 'CNPJ.ws',
            'message' => 'Validacao realizada no CNPJ.ws',
            'campos_validados' => [],
            'campos_erro' => [],
            'total_validados' => 0,
            'total_erros' => 0
        ];
        
        // Validação de endereço
        $addressFields = [
            'logradouro' => 'logradouro',
            'numero' => 'numero',
            'bairro' => 'bairro',
            'cep' => 'cep'
        ];

        foreach ($addressFields as $clientField => $cnpjField) {
            $clientValue = trim(strtolower($clientData[$clientField] ?? ''));
            $cnpjValue = trim(strtolower($establishment[$cnpjField] ?? ''));
            
            if ($clientValue === $cnpjValue) {
                $validation['campos_validados'][] = $clientField;
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Campo '{$clientField}' nao confere com o CNPJ.ws";
                $validation['total_erros']++;
            }
        }

        // Validação de cidade e estado
        if (isset($clientData['cidade']) && isset($establishment['cidade']['nome'])) {
            $clientCidade = trim(strtolower($clientData['cidade']));
            $cnpjCidade = trim(strtolower($establishment['cidade']['nome']));
            if ($clientCidade === $cnpjCidade) {
                $validation['campos_validados'][] = 'cidade';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Cidade nao confere com o CNPJ.ws";
                $validation['total_erros']++;
            }
        }

        if (isset($clientData['estado']) && isset($establishment['estado']['sigla'])) {
            $clientEstado = trim(strtoupper($clientData['estado']));
            $cnpjEstado = trim(strtoupper($establishment['estado']['sigla']));
            if ($clientEstado === $cnpjEstado) {
                $validation['campos_validados'][] = 'estado';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Estado nao confere com o CNPJ.ws";
                $validation['total_erros']++;
            }
        }

        // Validação situação cadastral
        $situacaoCadastral = $establishment['situacao_cadastral'] ?? null;
        if ($situacaoCadastral && $situacaoCadastral !== 'ATIVA') {
            $validation['campos_erro'][] = "Situacao cadastral invalida no CNPJ.ws: {$situacaoCadastral}";
            $validation['total_erros']++;
        } else {
            $validation['campos_validados'][] = 'situacao_cadastral';
            $validation['total_validados']++;
        }

        $validation['valid'] = $validation['total_erros'] === 0;
        $validation['message'] = $validation['valid'] ? 'Todos os campos validados no CNPJ.ws' : 'Campos com divergencia no CNPJ.ws';

        return $validation;
    }

    /**
     * Normaliza CNPJ removendo caracteres especiais
     */
    private function normalizeCnpj(string $cnpj): string
    {
        return preg_replace('/[^0-9]/', '', $cnpj);
    }

    /**
     * Valida formato do CNPJ
     */
    private function isValidCnpj(string $cnpj): array
    {
        if (strlen($cnpj) !== 14) {
            return ['valid' => false, 'message' => "CNPJ deve ter 14 dígitos, encontrado: " . strlen($cnpj)];
        }
        
        if (preg_match('/^(\d)\1+$/', $cnpj)) {
            return ['valid' => false, 'message' => 'CNPJ não pode ter todos os dígitos iguais'];
        }
        
        // Validação dos dígitos verificadores
        $soma1 = 0;
        $soma2 = 0;
        
        // Primeiro dígito verificador
        $pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for ($i = 0; $i < 12; $i++) {
            $soma1 += intval($cnpj[$i]) * $pesos1[$i];
        }
        $resto1 = $soma1 % 11;
        $dv1 = ($resto1 < 2) ? 0 : (11 - $resto1);
        
        if (intval($cnpj[12]) !== $dv1) {
            return ['valid' => false, 'message' => 'Primeiro dígito verificador inválido'];
        }
        
        // Segundo dígito verificador
        $pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for ($i = 0; $i < 13; $i++) {
            $soma2 += intval($cnpj[$i]) * $pesos2[$i];
        }
        $resto2 = $soma2 % 11;
        $dv2 = ($resto2 < 2) ? 0 : (11 - $resto2);
        
        if (intval($cnpj[13]) !== $dv2) {
            return ['valid' => false, 'message' => 'Segundo dígito verificador inválido'];
        }
        
        return ['valid' => true, 'message' => 'CNPJ válido'];
    }

    /**
     * Verifica se todos os campos obrigatórios estão presentes
     */
    private function hasRequiredFields(array $data): bool
    {
        $required = ['logradouro', 'numero', 'bairro', 'cidade', 'estado', 'cep'];
        $missingFields = array_diff($required, array_keys($data));
        return empty($missingFields);
    }

    /**
     * Extrai dados do endereço do JSON
     */
    private function extractAddressData(array $jsonData): array
    {
        if (isset($jsonData['endereco']) && is_array($jsonData['endereco'])) {
            $addressData = $jsonData['endereco'];
            
            if (isset($addressData['uf']) && !isset($addressData['estado'])) {
                $addressData['estado'] = $addressData['uf'];
            }
            
            return $addressData;
        }
        
        return $jsonData;
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
