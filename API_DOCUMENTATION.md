# Documentação da API - Customer Service

## Base URL
```
http://localhost:8899/api
```

## Rotas Disponíveis

### 1. Inserir Novos Clientes
**POST** `/newClients`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Body:**
```json
[
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
]
```

**Resposta de Sucesso:**
```json
{
    "message": "Processamento concluído",
    "saved_count": 1,
    "total_received": 1,
    "errors": []
}
```

### 2. Consultar Clientes com Filtros
**GET** `/consultClients`

**Parâmetros de Query (todos opcionais):**

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `cnpj` | string | Busca parcial por CNPJ | `23313554000144` |
| `origem` | string | Filtro exato por origem | `VTEX` |
| `status` | string | Status (PEN, PRO, ERR, RPV, APV) | `RPV` |
| `flag` | integer | Flag (0 ou 1) | `0` |
| `created_from` | date | Data inicial (YYYY-MM-DD) | `2024-01-01` |
| `created_to` | date | Data final (YYYY-MM-DD) | `2024-12-31` |
| `order_by` | string | Campo para ordenar | `created_at` |
| `order_direction` | string | Direção (asc/desc) | `desc` |
| `per_page` | integer | Itens por página | `10` |

**Exemplo de Requisição:**
```
GET http://localhost:8899/api/consultClients?cnpj=23313554000144&origem=VTEX&status=RPV&flag=0&created_from=2024-01-01&created_to=2024-12-31&order_by=created_at&order_direction=desc&per_page=10
```

**Resposta de Sucesso:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "cnpj": "23313554000144",
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
            "sintegra": null,
            "cnpjws": null,
            "consultacep": null,
            "reason": null,
            "origem": "VTEX",
            "status": "RPV",
            "flag": 0,
            "created_at": "2024-01-15T10:30:00.000000Z",
            "updated_at": "2024-01-15T10:30:00.000000Z"
        }
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 10,
        "total": 1,
        "from": 1,
        "to": 1
    },
    "filters_applied": {
        "cnpj": "23313554000144",
        "origem": "VTEX",
        "status": "RPV",
        "flag": "0",
        "created_from": "2024-01-01",
        "created_to": "2024-12-31",
        "order_by": "created_at",
        "order_direction": "desc",
        "per_page": 10
    }
}
```

### 3. Listar Todos os Clientes (Rota Original)
**GET** `/newClients`

**Parâmetros de Query:** Mesmos da rota `/consultClients`

### 4. Health Check
**GET** `/health`

**Resposta:**
```json
{
    "status": "ok"
}
```

## Exemplos de CURL

### Inserir Cliente
```bash
curl -X POST http://localhost:8899/api/newClients \
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
]'
```

### Consultar Clientes
```bash
curl -X GET "http://localhost:8899/api/consultClients?cnpj=23313554000144&origem=VTEX&status=RPV&flag=0&created_from=2024-01-01&created_to=2024-12-31&order_by=created_at&order_direction=desc&per_page=10" \
  -H "Accept: application/json"
```

## Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Erro de validação
- **500**: Erro interno do servidor

## Validações

### Para Inserção de Clientes:
- CNPJ é obrigatório
- Campo `json` deve ser um objeto válido
- Campo `origem` é obrigatório

### Para Consulta:
- Todos os parâmetros são opcionais
- `status` deve ser um dos valores: PEN, PRO, ERR, RPV, APV
- `flag` deve ser 0 ou 1
- `order_direction` deve ser 'asc' ou 'desc'
- `per_page` é limitado entre 1 e 100

## Configurações de CORS

A API está configurada para aceitar requisições de qualquer origem (`*`) para facilitar o desenvolvimento e testes.
