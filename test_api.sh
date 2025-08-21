#!/bin/bash

echo "=== Testando API NewClients ==="
echo ""

# Teste 1: Health Check
echo "1. Testando Health Check..."
curl -s -X GET http://localhost:8899/api/health
echo ""
echo ""

# Teste 2: Criar clientes
echo "2. Testando criação de clientes..."
curl -s -X POST http://localhost:8899/api/newClients \
  -H "Content-Type: application/json" \
  -d '[
    {
        "cnpj": "12.345.678/0001-90",
        "nome": "Empresa Exemplo Ltda",
        "email": "contato@empresa.com",
        "telefone": "(11) 99999-9999"
    },
    {
        "cnpj": "98.765.432/0001-10",
        "nome": "Outra Empresa S.A.",
        "email": "contato@outraempresa.com",
        "telefone": "(11) 88888-8888"
    }
  ]'
echo ""
echo ""

# Teste 3: Teste com payload inválido
echo "3. Testando payload inválido..."
curl -s -X POST http://localhost:8899/api/newClients \
  -H "Content-Type: application/json" \
  -d '{"cnpj": "12.345.678/0001-90"}'
echo ""
echo ""

echo "=== Testes concluídos ==="
