<?php

namespace App\Services;

class ViaCepService
{
    /**
     * Consulta CEP na API ViaCEP
     */
    public function consultarCep(string $cep): array
    {
        $cepClean = preg_replace('/[^0-9]/', '', $cep);

        if (strlen($cepClean) !== 8) {
            return [
                'success' => false,
                'data' => null
            ];
        }

        $url = "https://viacep.com.br/ws/{$cepClean}/json/";

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            return [
                'success' => false,
                'data' => null
            ];
        }

        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [
                'success' => false,
                'data' => null
            ];
        }

        if (isset($data['erro']) && $data['erro'] === true) {
            return [
                'success' => false,
                'data' => $data
            ];
        }

        return [
            'success' => true,
            'data' => $data
        ];
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
     * Valida dados do cliente com resposta do ViaCEP
     */
    public function validarDados(array $clientData, array $viaCepData): array
    {
        $validation = [
            'api' => 'ViaCEP',
            'message' => 'Validacao realizada no ViaCEP',
            'campos_validados' => [],
            'campos_erro' => [],
            'total_validados' => 0,
            'total_erros' => 0,
            'detalhes_divergencias' => []
        ];

        // Validação de endereço
        $addressFields = [
            'logradouro' => 'logradouro',
            'bairro' => 'bairro',
            'cep' => 'cep'
        ];

        foreach ($addressFields as $clientField => $viaCepField) {
            $clientValue = $clientData[$clientField] ?? '';
            $viaCepValue = $viaCepData[$viaCepField] ?? '';
            
            if ($this->compareValues($clientValue, $viaCepValue)) {
                $validation['campos_validados'][] = $clientField;
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Campo '{$clientField}' nao confere com o ViaCEP";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => $clientField,
                    'valor_cliente' => $clientValue ?: 'N/A',
                    'valor_viacep' => $viaCepValue ?: 'N/A'
                ];
            }
        }

        // Validação de cidade e estado
        if (isset($clientData['cidade']) && isset($viaCepData['localidade'])) {
            $clientCidade = $clientData['cidade'];
            $viaCepCidade = $viaCepData['localidade'];
            
            if ($this->compareValues($clientCidade, $viaCepCidade)) {
                $validation['campos_validados'][] = 'cidade';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Cidade nao confere com o ViaCEP";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => 'cidade',
                    'valor_cliente' => $clientCidade ?: 'N/A',
                    'valor_viacep' => $viaCepCidade ?: 'N/A'
                ];
            }
        }

        if (isset($clientData['estado']) && isset($viaCepData['uf'])) {
            $clientEstado = $clientData['estado'];
            $viaCepEstado = $viaCepData['uf'];
            
            if ($this->compareValues($clientEstado, $viaCepEstado)) {
                $validation['campos_validados'][] = 'estado';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Estado nao confere com o ViaCEP";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => 'estado',
                    'valor_cliente' => $clientEstado ?: 'N/A',
                    'valor_viacep' => $viaCepEstado ?: 'N/A'
                ];
            }
        }

        $validation['valid'] = $validation['total_erros'] === 0;
        $validation['message'] = $validation['valid'] ? 'Todos os campos validados no ViaCEP' : 'Campos com divergencia no ViaCEP';

        return $validation;
    }
}
