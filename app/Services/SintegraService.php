<?php

namespace App\Services;

class SintegraService
{
    /**
     * Consulta API Sintegra
     */
    public function consultarSintegra(string $cnpj): array
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
     * Compara valores de CEP tratando zeros à esquerda
     */
    private function compareCepValues(string $value1, string $value2): bool
    {
        // Remove caracteres não numéricos
        $cep1 = preg_replace('/[^0-9]/', '', $value1);
        $cep2 = preg_replace('/[^0-9]/', '', $value2);
        
        // Remove zeros à esquerda para comparação
        $cep1 = ltrim($cep1, '0');
        $cep2 = ltrim($cep2, '0');
        
        return $cep1 === $cep2;
    }

    /**
     * Verifica se a situação CNPJ é válida (aceita mais variações)
     */
    private function isSituacaoCnpjValida(string $situacao): bool
    {
        $situacoesValidas = [
            'ativo', 'ativa', 'sem restrição', 'sem restricao', 'normal'
        ];
        
        $situacaoNormalizada = strtolower($this->removeAccents($situacao));
        
        return in_array($situacaoNormalizada, $situacoesValidas);
    }

    /**
     * Verifica se a situação IE é válida (aceita mais variações)
     */
    private function isSituacaoIeValida(string $situacao): bool
    {
        $situacoesValidas = [
            'ativo', 'ativa', 'normal'
        ];
        
        $situacaoNormalizada = strtolower($this->removeAccents($situacao));
        
        return in_array($situacaoNormalizada, $situacoesValidas);
    }

    /**
     * Valida dados do cliente com resposta do Sintegra
     */
    public function validarDados(array $clientData, array $sintegraData): array
    {
        $validation = [
            'api' => 'Sintegra',
            'message' => 'Validacao realizada no Sintegra',
            'campos_validados' => [],
            'campos_erro' => [],
            'total_validados' => 0,
            'total_erros' => 0,
            'detalhes_divergencias' => []
        ];

        $addressFields = [
            'logradouro' => 'logradouro',
            'numero' => 'numero'
        ];

        foreach ($addressFields as $clientField => $sintegraField) {
            $clientValue = $clientData[$clientField] ?? '';
            $sintegraValue = $sintegraData[$sintegraField] ?? '';

            if ($this->compareValues($clientValue, $sintegraValue)) {
                $validation['campos_validados'][] = $clientField;
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Campo '{$clientField}' nao confere com o Sintegra";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => $clientField,
                    'valor_cliente' => $clientValue ?: 'N/A',
                    'valor_sintegra' => $sintegraValue ?: 'N/A'
                ];
            }
        }

        // Validação especial para CEP (trata zeros à esquerda)
        if (isset($clientData['cep']) && isset($sintegraData['cep'])) {
            $clientCep = $clientData['cep'];
            $sintegraCep = $sintegraData['cep'];
            
            if ($this->compareCepValues($clientCep, $sintegraCep)) {
                $validation['campos_validados'][] = 'cep';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Campo 'cep' nao confere com o Sintegra";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => 'cep',
                    'valor_cliente' => $clientCep ?: 'N/A',
                    'valor_sintegra' => $sintegraCep ?: 'N/A',
                    'observacao' => 'Comparacao normalizada (sem zeros à esquerda)'
                ];
            }
        }

        if (isset($clientData['cidade']) && isset($sintegraData['municipio'])) {
            $clientCidade = $clientData['cidade'];
            $sintegraCidade = $sintegraData['municipio'];
            
            if ($this->compareValues($clientCidade, $sintegraCidade)) {
                $validation['campos_validados'][] = 'cidade';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Cidade nao confere com o Sintegra";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => 'cidade',
                    'valor_cliente' => $clientCidade ?: 'N/A',
                    'valor_sintegra' => $sintegraCidade ?: 'N/A'
                ];
            }
        }

        if (isset($clientData['estado']) && isset($sintegraData['uf'])) {
            $clientEstado = $clientData['estado'];
            $sintegraEstado = $sintegraData['uf'];
            
            if ($this->compareValues($clientEstado, $sintegraEstado)) {
                $validation['campos_validados'][] = 'estado';
                $validation['total_validados']++;
            } else {
                $validation['campos_erro'][] = "Estado nao confere com o Sintegra";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => 'estado',
                    'valor_cliente' => $clientEstado ?: 'N/A',
                    'valor_sintegra' => $sintegraEstado ?: 'N/A'
                ];
            }
        }

        $situacaoCnpj = $sintegraData['situacao_cnpj'] ?? null;
        if ($situacaoCnpj && !$this->isSituacaoCnpjValida($situacaoCnpj)) {
            $validation['campos_erro'][] = "Situacao CNPJ invalida no Sintegra: {$situacaoCnpj}";
            $validation['total_erros']++;
            $validation['detalhes_divergencias'][] = [
                'campo' => 'situacao_cnpj',
                'valor_cliente' => 'N/A',
                'valor_sintegra' => $situacaoCnpj,
                'observacao' => 'Situacao deve ser: Ativo, Ativa, Sem restrição ou Normal'
            ];
        } else {
            $validation['campos_validados'][] = 'situacao_cnpj';
            $validation['total_validados']++;
        }

        $inscricaoEstadual = $sintegraData['inscricao_estadual'] ?? null;
        $clientInscricaoEstadual = $clientData['inscricao_estadual'] ?? null;

        if ($clientInscricaoEstadual && $clientInscricaoEstadual !== '' && $inscricaoEstadual) {
            $clientIE = ltrim($clientInscricaoEstadual, '0');
            $sintegraIE = ltrim($inscricaoEstadual, '0');

            if ($clientIE !== $sintegraIE) {
                $validation['campos_erro'][] = "Inscricao estadual divergente. Cliente: {$clientInscricaoEstadual} | Sintegra: {$inscricaoEstadual}";
                $validation['total_erros']++;
                $validation['detalhes_divergencias'][] = [
                    'campo' => 'inscricao_estadual',
                    'valor_cliente' => $clientInscricaoEstadual,
                    'valor_sintegra' => $inscricaoEstadual,
                    'observacao' => 'Comparacao sem zeros à esquerda'
                ];
            } else {
                $validation['campos_validados'][] = 'inscricao_estadual';
                $validation['total_validados']++;
            }
        } else if (!$inscricaoEstadual) {
            $validation['campos_validados'][] = 'inscricao_estadual_isento';
            $validation['total_validados']++;
        }

        $situacaoIe = $sintegraData['situacao_ie'] ?? null;
        if ($situacaoIe && !$this->isSituacaoIeValida($situacaoIe)) {
            $validation['campos_erro'][] = "Situacao IE invalida no Sintegra: {$situacaoIe}";
            $validation['total_erros']++;
            $validation['detalhes_divergencias'][] = [
                'campo' => 'situacao_ie',
                'valor_cliente' => 'N/A',
                'valor_sintegra' => $situacaoIe,
                'observacao' => 'Situacao deve ser: Ativo, Ativa ou Normal'
            ];
        } else {
            $validation['campos_validados'][] = 'situacao_ie';
            $validation['total_validados']++;
        }

        $validation['valid'] = $validation['total_erros'] === 0;
        $validation['message'] = $validation['valid'] ? 'Todos os campos validados no Sintegra' : 'Campos com divergencia no Sintegra';

        return $validation;
    }
}
