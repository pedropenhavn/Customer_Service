# Mudanças na API - NewClients

## Resumo das Alterações

A API foi atualizada para receber dados no novo formato especificado e salvar na estrutura correta da tabela `newClients`.

## Estrutura da Tabela Atualizada

A tabela `newClients` agora possui a seguinte estrutura:

- `id` - Chave primária
- `cnpj` - CNPJ do cliente
- `json` - Dados JSON recebidos
- `sintegra` - NULL (futuramente armazenará JSON)
- `receita` - NULL (futuramente armazenará JSON)
- `simples_nacional` - NULL (futuramente armazenará JSON)
- `origem` - Origem dos dados
- `status` - Status do processamento (default: PEN)
- `flag` - Flag de controle (default: 0)
- `created_at` - Data de criação
- `updated_at` - Data de atualização

## Formato de Entrada da API

A API agora aceita dois formatos:

### 1. Cliente Único
```json
{
  "cnpj": "12.345.678/0001-90",
  "json": {
    "endereco": {
      "logradouro": "Avenida Paulista",
      "numero": "1000",
      "complemento": "Conjunto 1205",
      "bairro": "Bela Vista",
      "cidade": "São Paulo",
      "uf": "SP",
      "cep": "01310-100"
    }
  },
  "origem": "VTEX"
}
```

### 2. Array de Clientes
```json
[
  {
    "cnpj": "12.345.678/0001-90",
    "json": {
      "endereco": {
        "logradouro": "Avenida Paulista",
        "numero": "1000",
        "complemento": "Conjunto 1205",
        "bairro": "Bela Vista",
        "cidade": "São Paulo",
        "uf": "SP",
        "cep": "01310-100"
      }
    },
    "origem": "API Receita Federal"
  },
  {
    "cnpj": "98.765.432/0001-55",
    "json": {
      "endereco": {
        "logradouro": "Rua XV de Novembro",
        "numero": "250",
        "complemento": "Sala 302",
        "bairro": "Centro",
        "cidade": "Curitiba",
        "uf": "PR",
        "cep": "80020-310"
      }
    },
    "origem": "Cadastro Interno"
  }
]
```

## Validações Implementadas

1. **Estrutura obrigatória**: Verifica se todos os campos obrigatórios estão presentes (`cnpj`, `json`, `origem`)
2. **CNPJ**: Valida se o CNPJ não está vazio
3. **JSON**: Valida se o campo `json` é um objeto válido
4. **Origem**: Valida se o campo `origem` não está vazio

## Resposta da API

### Sucesso (201)
```json
{
  "message": "Processamento concluído",
  "saved_count": 2,
  "total_received": 2,
  "errors": []
}
```

### Erro de Validação (400)
```json
{
  "message": "Processamento concluído",
  "saved_count": 0,
  "total_received": 2,
  "errors": [
    "Cliente na posição 0: CNPJ é obrigatório",
    "Cliente na posição 1: Campo 'origem' é obrigatório"
  ]
}
```

### Erro Interno (500)
```json
{
  "error": "Erro interno do servidor: [mensagem do erro]"
}
```

## Como Testar

Execute o script de teste:
```bash
./test_new_format_api.sh
```

Ou teste manualmente com curl:
```bash
curl -X POST http://localhost:8000/api/newClients \
  -H "Content-Type: application/json" \
  -d '{
    "cnpj": "12.345.678/0001-90",
    "json": {"teste": "dados"},
    "origem": "Teste"
  }'
```

## Arquivos Modificados

1. `database/migrations/2024_01_01_000004_update_new_clients_table_structure.php` - Nova migration
2. `app/Models/NewClient.php` - Modelo atualizado
3. `app/Http/Controllers/NewClientsController.php` - Controller atualizado
4. `test_new_format_api.sh` - Script de teste
5. `API_CHANGES.md` - Esta documentação
