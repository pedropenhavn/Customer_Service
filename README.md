# Customer Service API

Sistema de atendimento ao cliente com API Laravel e frontend React.

## 🚀 Deploy Automatizado

O projeto está configurado para deploy automatizado via Jenkins no servidor `192.168.250.195`.

### URLs de Acesso (Após Deploy)

- **Frontend**: http://192.168.250.195
- **API**: http://192.168.250.195/api
- **Health Check**: http://192.168.250.195/health

### Estrutura do Deploy

1. **Jenkins** faz o clone do repositório
2. **Frontend** é buildado com `npm run build`
3. **Docker Compose** inicia os containers:
   - `app`: API Laravel (porta 8899)
   - `nginx`: Servidor web (porta 80/443)
   - `redis`: Cache e sessões

### Configuração do Jenkins

O Jenkins está configurado com:
- **Credentials**: `user-git` para acesso ao GitHub
- **Credentials**: `customer-service.env` com as variáveis de produção
- **Branch**: `main`

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento do frontend)
- PHP 8.3+ (para desenvolvimento da API)

### Executar Localmente

```bash
# Clone o repositório
git clone https://github.com/pedropenhavn/Customer_Service.git
cd Customer_Service

# Copie o arquivo de ambiente
cp env.example .env

# Configure as variáveis de ambiente
# Edite o arquivo .env com suas configurações

# Inicie os containers
docker compose up -d

# Para desenvolvimento do frontend
cd frontend
npm install
npm start
```

### Estrutura do Projeto

```
customer_service/
├── app/                    # API Laravel
│   ├── Http/Controllers/   # Controllers
│   ├── Models/            # Models
│   └── Services/          # Serviços
├── frontend/              # Aplicação React
│   ├── src/
│   └── public/
├── infra/                 # Configurações de Infraestrutura
│   ├── docker/           # Dockerfiles
│   ├── nginx/            # Configurações Nginx
│   └── deploy/           # Jenkins e scripts de deploy
└── docker-compose.yml    # Orquestração dos containers
```

## 🔧 Configurações

### Variáveis de Ambiente

As principais variáveis estão no arquivo `.env`:

- `APP_ENV`: Ambiente (local/production)
- `APP_URL`: URL da aplicação
- `DB_CONNECTION`: Tipo de banco (sqlite)
- `REDIS_HOST`: Host do Redis
- `API_TOKEN`: Token para autenticação da API

### APIs Externas

O sistema integra com:
- **Sintegra API**: Validação de CNPJ
- **CNPJ WS**: Consulta de dados empresariais
- **ViaCEP**: Consulta de CEP

## 📊 Monitoramento

- **Health Check**: `/health` - Status da aplicação
- **Logs**: Acessíveis via `docker compose logs`
- **Métricas**: Dashboard interno disponível

## 🔒 Segurança

- Autenticação via API Token
- CORS configurado para produção
- Headers de segurança no Nginx
- Rate limiting configurado

## 📝 Notas de Deploy

1. O frontend é buildado automaticamente no Jenkins
2. O Nginx serve o frontend e faz proxy para a API
3. Redis é usado para cache e sessões
4. Todos os containers são reiniciados automaticamente
5. Health checks garantem que a aplicação está funcionando

---

**Desenvolvido por**: Pedro Penhavn  
**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024
