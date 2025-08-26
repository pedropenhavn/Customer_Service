# Autenticação da API por Token

Este projeto utiliza autenticação por token para proteger todas as rotas da API.

## Configuração

### 1. Gerar um Token

Execute o comando para gerar um token seguro:

```bash
php artisan api:generate-token --show
```

### 2. Configurar o Token

Adicione o token gerado ao seu arquivo `.env`:

```env
API_TOKEN=seu-token-gerado-aqui
```

## Como Usar

### Headers Obrigatórios

Todas as requisições para a API devem incluir o header de autorização:

```
Authorization: Bearer seu-token-aqui
```

### Exemplo de Requisição

```bash
curl -X GET "http://seu-dominio.com/api/newClients" \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "Content-Type: application/json"
```

### Exemplo com JavaScript/Fetch

```javascript
fetch('/api/newClients', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer seu-token-aqui',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

## Rotas Protegidas

Todas as rotas da API estão protegidas pelo middleware de autenticação:

- `GET /api/newClients`
- `POST /api/newClients`
- `GET /api/consultClients`
- `POST /api/process/pending-clients`
- `GET /api/process/statistics`

## Respostas de Erro

### Token não fornecido (401)
```json
{
  "error": "Token de autorização não fornecido",
  "message": "O header Authorization é obrigatório"
}
```

### Formato de token inválido (401)
```json
{
  "error": "Formato de token inválido",
  "message": "O token deve estar no formato: Bearer {token}"
}
```

### Token inválido (401)
```json
{
  "error": "Token inválido",
  "message": "O token fornecido não é válido"
}
```

## Segurança

- O token deve ser mantido seguro e não compartilhado
- Use HTTPS em produção
- Considere rotacionar o token periodicamente
- O token tem 64 caracteres de comprimento para máxima segurança
