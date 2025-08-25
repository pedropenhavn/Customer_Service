<?php

namespace App\Services;

class CnpjWsService
{
    /**
     * Consulta API CNPJ.ws
     */
    public function consultarCnpj(string $cnpj): array
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
     * Normaliza texto para comparação inteligente
     * Remove acentos, converte para minúsculas, remove espaços extras e caracteres especiais
     */
    private function normalizeText(string $text): string
    {
        // Remove espaços extras e converte para minúsculas
        $text = trim(strtolower($text));
        
        // Remove acentos
        $text = $this->removeAccents($text);
        
        // Remove prefixos comuns de logradouro
        $text = $this->removeAddressPrefixes($text);
        
        // Remove caracteres especiais mantendo apenas letras, números e espaços
        $text = preg_replace('/[^a-z0-9\s]/', '', $text);
        
        // Remove espaços múltiplos e converte para espaço único
        $text = preg_replace('/\s+/', ' ', $text);
        
        return trim($text);
    }

    /**
     * Remove prefixos comuns de logradouro
     */
    private function removeAddressPrefixes(string $text): string
    {
        $prefixes = [
            '/^av\s+/i',      // AV
            '/^avenida\s+/i', // AVENIDA
            '/^rua\s+/i',     // RUA
            '/^r\s+/i',       // R
            '/^travessa\s+/i', // TRAVESSA
            '/^trav\s+/i',    // TRAV
            '/^alameda\s+/i', // ALAMEDA
            '/^ala\s+/i',     // ALA
            '/^estrada\s+/i', // ESTRADA
            '/^est\s+/i',     // EST
            '/^rodovia\s+/i', // RODOVIA
            '/^rod\s+/i',     // ROD
            '/^via\s+/i',     // VIA
            '/^vila\s+/i',    // VILA
            '/^vl\s+/i',      // VL
            '/^largo\s+/i',   // LARGO
            '/^lg\s+/i',      // LG
            '/^praca\s+/i',   // PRACA
            '/^pc\s+/i',      // PC
        ];
        
        foreach ($prefixes as $prefix) {
            $text = preg_replace($prefix, '', $text);
        }
        
        return $text;
    }

    /**
     * Remove acentos de caracteres
     */
    private function removeAccents(string $text): string
    {
        $accents = [
            'à' => 'a', 'á' => 'a', 'ã' => 'a', 'â' => 'a', 'ä' => 'a',
            'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
            'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
            'ò' => 'o', 'ó' => 'o', 'õ' => 'o', 'ô' => 'o', 'ö' => 'o',
            'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
            'ý' => 'y', 'ÿ' => 'y',
            'ñ' => 'n',
            'ç' => 'c',
            'À' => 'a', 'Á' => 'a', 'Ã' => 'a', 'Â' => 'a', 'Ä' => 'a',
            'È' => 'e', 'É' => 'e', 'Ê' => 'e', 'Ë' => 'e',
            'Ì' => 'i', 'Í' => 'i', 'Î' => 'i', 'Ï' => 'i',
            'Ò' => 'o', 'Ó' => 'o', 'Õ' => 'o', 'Ô' => 'o', 'Ö' => 'o',
            'Ù' => 'u', 'Ú' => 'u', 'Û' => 'u', 'Ü' => 'u',
            'Ý' => 'y',
            'Ñ' => 'n',
            'Ç' => 'c'
        ];
        
        return strtr($text, $accents);
    }

    /**
     * Compara dois valores de forma inteligente
     */
    private function compareValues(string $value1, string $value2): bool
    {
        $normalized1 = $this->normalizeText($value1);
        $normalized2 = $this->normalizeText($value2);
        
        return $normalized1 === $normalized2;
    }

    /**
     * Valida dados do cliente com resposta do CNPJ.ws
     */
    public function validarDados(array $clientData, array $cnpjData): array
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
            'total_erros' => 0,
            'detalhes_divergencias' => []
        ];
        
        // Validação de endereço
        $addressFields = [
            'logradouro' => 'logradouro',
            'numero' => 'numero',
            'bairro' => 'bairro',
            'cep' => 'cep'
        ];

        foreach ($addressFields as $clientField => $cnpjField) {
            $clientValue = $clientData[$clientField] ?? '';
            $cnpjValue = $establishment[$cnpjField] ?? '';
            
            if ($this->compareValues($clientValue, $cnpjValue)) {
                $validation['campos_validados'][] = $clientField;
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Campo '{$clientField}' nao confere com o CNPJ.ws";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => $clientField,
                    'valor_cliente' => $clientValue ?: 'N/A',
                    'valor_cnpjws' => $cnpjValue ?: 'N/A'
                ];
            }
        }

        // Validação de cidade e estado
        if (isset($clientData['cidade']) && isset($establishment['cidade']['nome'])) {
            $clientCidade = $clientData['cidade'];
            $cnpjCidade = $establishment['cidade']['nome'];
            
            if ($this->compareValues($clientCidade, $cnpjCidade)) {
                $validation['campos_validados'][] = 'cidade';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Cidade nao confere com o CNPJ.ws";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => 'cidade',
                    'valor_cliente' => $clientCidade ?: 'N/A',
                    'valor_cnpjws' => $cnpjCidade ?: 'N/A'
                ];
            }
        }

        if (isset($clientData['estado']) && isset($establishment['estado']['sigla'])) {
            $clientEstado = $clientData['estado'];
            $cnpjEstado = $establishment['estado']['sigla'];
            
            if ($this->compareValues($clientEstado, $cnpjEstado)) {
                $validation['campos_validados'][] = 'estado';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Estado nao confere com o CNPJ.ws";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => 'estado',
                    'valor_cliente' => $clientEstado ?: 'N/A',
                    'valor_cnpjws' => $cnpjEstado ?: 'N/A'
                ];
            }
        }

        // Validação situação cadastral
        $situacaoCadastral = $establishment['situacao_cadastral'] ?? null;
        if ($situacaoCadastral && strtoupper($situacaoCadastral) !== 'ATIVA') {
            $validation['campos_erro'][] = "Situacao cadastral invalida no CNPJ.ws: {$situacaoCadastral}";
            $validation['total_erros']++;
            $validation['detalhes_divergencias'][] = [
                'campo' => 'situacao_cadastral',
                'valor_cliente' => 'N/A',
                'valor_cnpjws' => $situacaoCadastral,
                'observacao' => 'Situacao deve ser: ATIVA'
            ];
        } else {
            $validation['campos_validados'][] = 'situacao_cadastral';
            $validation['total_validados']++;
        }

        $validation['valid'] = $validation['total_erros'] === 0;
        $validation['message'] = $validation['valid'] ? 'Todos os campos validados no CNPJ.ws' : 'Campos com divergencia no CNPJ.ws';

        return $validation;
    }
}
