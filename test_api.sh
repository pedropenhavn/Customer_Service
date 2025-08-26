#!/bin/bash

# Script de teste para a API Customer Service
# Uso: ./test_api.sh [base_url]

BASE_URL=${1:-"http://localhost:8899/api"}

echo "🧪 Testando API Customer Service em: $BASE_URL"
echo "=================================================="

# Teste 1: Health Check
echo "1. Testando Health Check..."
curl -s -X GET "$BASE_URL/health" | jq .
echo ""

# Teste 2: Inserir Cliente
echo "2. Testando Inserção de Cliente..."
curl -s -X POST "$BASE_URL/newClients" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '[
    {
        "cnpj": "4896696000137",
        "json": {
            "endereco": {
                "logradouro": "RUA VEREADOR CESÁRIO COIMBRA",
                "numero": "45",
                "complemento": "********",
                "bairro": "CENTRO",
                "cidade": "ARARAS",
                "uf": "SP",
                "cep": "13600030"
            }
        },
        "origem": "APROVADO"
    }
]' | jq .
echo ""

# Aguardar um pouco para garantir que o registro foi salvo
sleep 2

# Teste 3: Consultar Clientes (sem filtros)
echo "3. Testando Consulta de Clientes (sem filtros)..."
curl -s -X GET "$BASE_URL/consultClients?per_page=5" | jq .
echo ""

# Teste 4: Consultar Clientes com filtros
echo "4. Testando Consulta de Clientes com filtros..."
curl -s -X GET "$BASE_URL/consultClients?cnpj=4896696000137&origem=APROVADO&per_page=10" | jq .
echo ""

# Teste 5: Consultar Clientes por data
echo "5. Testando Consulta de Clientes por data..."
TODAY=$(date +%Y-%m-%d)
curl -s -X GET "$BASE_URL/consultClients?created_from=$TODAY&created_to=$TODAY&per_page=5" | jq .
echo ""

# Teste 6: Teste de erro - CNPJ inválido
echo "6. Testando erro com CNPJ inválido..."
curl -s -X POST "$BASE_URL/newClients" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '[
    {
        "cnpj": "",
        "json": {
            "endereco": {
                "logradouro": "TESTE"
            }
        },
        "origem": "TESTE"
    }
]' | jq .
echo ""

echo "✅ Testes concluídos!"
echo ""
echo "📋 Resumo dos endpoints testados:"
echo "   - GET  $BASE_URL/health"
echo "   - POST $BASE_URL/newClients"
echo "   - GET  $BASE_URL/consultClients"
echo ""
echo "📖 Para mais informações, consulte o arquivo API_DOCUMENTATION.md"
