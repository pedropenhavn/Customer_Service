# API REST - NewClients

## Configuração

### 1. Docker Compose
O projeto já está configurado com Docker. Para iniciar:

```bash
docker-compose up -d
```

A API estará disponível em: `http://localhost:8899`

### 2. Banco de Dados SQLite
O banco SQLite está configurado com volume persistente para acesso via DataGrip.

**Configuração DataGrip:**
- Host: localhost
- Port: 8899 (via SSH tunnel se necessário)
- Database: `/var/www/database/database.sqlite`

## Endpoints

### 1. Health Check
**GET** `/api/health`

**Resposta:**
```json
{
    "status": "ok"
}
```

### 2. Criar Novos Clientes
**POST** `/api/newClients`

**Payload (array de clientes):**
```json
[
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
]
```

**Resposta de Sucesso (201):**
```json
{
    "message": "Clientes processados com sucesso",
    "saved_count": 2,
    "total_received": 2
}
```

**Resposta de Erro (400):**
```json
{
    "error": "O payload deve ser um array de clientes"
}
```

## Estrutura do Banco

### Tabela: newClients

| Campo | Tipo | Descrição | Default |
|-------|------|-----------|---------|
| id | integer | Primary Key, Auto Increment | - |
| cnpj | string | CNPJ do cliente | - |
| json | longText | Objeto completo do cliente em JSON | - |
| status | enum | Status: PEN, RPV, APV | PEN |
| reason | string | Motivo (nullable) | null |
| flag | tinyInteger | Flag: 0 ou 1 | 0 |
| created_at | timestamp | Data de criação | now |
| updated_at | timestamp | Data de atualização | now |

## Exemplo de Uso com cURL

```bash
# Health Check
curl -X GET http://localhost:8899/api/health

# Criar clientes
curl -X POST http://localhost:8899/api/newClients \
  -H "Content-Type: application/json" \
  -d '[
    {
        "cnpj": "12.345.678/0001-90",
        "nome": "Empresa Exemplo Ltda",
        "email": "contato@empresa.com"
    }
  ]'
```

## Migrations

Para executar as migrations (dentro do container):

```bash
docker-compose exec app php artisan migrate
```

## Logs

Os logs da aplicação estão disponíveis em:
- Container: `/var/www/storage/logs/laravel.log`
- Host: `./storage/logs/laravel.log`
