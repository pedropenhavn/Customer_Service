<?php

namespace App\Services;

class CnpjValidationService
{
    /**
     * Normaliza CNPJ removendo caracteres especiais e corrigindo formato
     */
    public function normalizeCnpj(string $cnpj): string
    {
        // Remove caracteres não numéricos
        $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
        
        // Se tem 13 dígitos, adiciona 0 na frente
        if (strlen($cnpj) === 13) {
            $cnpj = '0' . $cnpj;
        }
        
        return $cnpj;
    }

    /**
     * Valida formato do CNPJ
     */
    public function validateCnpj(string $cnpj): array
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
}
