<?php

namespace App\Services;

class ClientValidationService
{
    /**
     * Verifica se todos os campos obrigatórios estão presentes
     */
    public function hasRequiredFields(array $data): bool
    {
        $required = ['logradouro', 'numero', 'bairro', 'cidade', 'estado', 'cep'];
        $missingFields = array_diff($required, array_keys($data));
        return empty($missingFields);
    }

    /**
     * Extrai dados do cliente do JSON
     */
    public function extractClientData($jsonData): array
    {
        $data = is_string($jsonData) ? json_decode($jsonData, true) : $jsonData;
        
        if (isset($data['endereco']) && is_array($data['endereco'])) {
            $addressData = $data['endereco'];
            
            if (isset($addressData['uf']) && !isset($addressData['estado'])) {
                $addressData['estado'] = $addressData['uf'];
            }
            
            return $addressData;
        }
        
        return $data;
    }
}
