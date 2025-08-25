# Configuração do Jenkins para Customer Service

## 📋 Pré-requisitos

1. **Jenkins instalado e configurado no servidor**
2. **Docker e Docker Compose instalados**
3. **Git configurado no Jenkins**
4. **Credenciais configuradas no Jenkins**

## 🔧 Configuração no Jenkins

### 1. Criar Credenciais

No Jenkins, vá em **Manage Jenkins > Manage Credentials > System > Global credentials** e adicione:

#### Credencial Git (user-git)
- **Kind**: Username with password
- **Scope**: Global
- **Username**: seu_usuario_github
- **Password**: seu_token_github_ou_senha
- **ID**: user-git
- **Description**: Credenciais para acesso ao GitHub

#### Credencial Arquivo .env (customer-service.env)
- **Kind**: Secret file
- **Scope**: Global
- **File**: Seu arquivo .env de produção
- **ID**: customer-service.env
- **Description**: Arquivo de ambiente para Customer Service

### 2. Criar Pipeline Job

1. **Dashboard > New Item**
2. **Nome**: customer-service
3. **Tipo**: Pipeline
4. **OK**

### 3. Configurar Pipeline

Na configuração do job:

#### General
- ✅ **Discard old builds** (manter últimos 10 builds)
- ✅ **This project is parameterized** (opcional)

#### Pipeline
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/pedropenhavn/Customer_Service.git`
- **Credentials**: user-git
- **Branch Specifier**: `*/main`
- **Script Path**: `infra/deploy/production.Jenkinsfile`

#### Build Triggers (opcional)
- ✅ **Poll SCM** (para builds automáticos)
- **Schedule**: `H/15 * * * *` (a cada 15 minutos)

### 4. Configurações Adicionais

#### Workspace
O Jenkins criará automaticamente o workspace:
```
/var/lib/jenkins/workspace/customer-service/
```

#### Permissões
Certifique-se que o usuário Jenkins tenha permissões para:
- Executar Docker
- Acessar a porta 8899
- Ler/escrever no diretório do projeto

## 🚀 Executando o Deploy

### Primeira Execução
1. Acesse o job no Jenkins
2. Clique em **Build Now**
3. Acompanhe os logs em tempo real

### Execuções Automáticas
- Configure webhooks no GitHub para builds automáticos
- Ou use o Poll SCM para verificar mudanças periodicamente

## 📁 Estrutura do Projeto

```
customer_service/
├── infra/
│   ├── deploy/
│   │   └── production.Jenkinsfile  # Pipeline do Jenkins
│   ├── docker/
│   │   └── Dockerfile              # Imagem Docker
│   └── ...
├── docker-compose.yml              # Orquestração Docker
└── ...
```

## 🔍 Monitoramento

### Logs do Jenkins
- Acesse o job > Build específico > Console Output
- Logs detalhados de cada etapa

### Logs da Aplicação
```bash
# Logs do container
docker logs app-base

# Logs do Docker Compose
docker compose logs -f
```

### Health Check
Após o deploy, verifique se a aplicação está respondendo:
```bash
curl http://localhost:8899
```

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Erro de credenciais Git**
   - Verifique se as credenciais 'user-git' estão corretas
   - Teste o acesso ao repositório manualmente

2. **Erro ao copiar .env**
   - Verifique se a credencial 'customer-service.env' existe
   - Confirme as permissões do arquivo

3. **Erro no Docker**
   - Verifique se Docker está rodando: `docker --version`
   - Confirme permissões: `sudo usermod -aG docker jenkins`

4. **Porta já em uso**
   - Pare containers existentes: `docker compose down`
   - Verifique se a porta 8899 está livre

### Comandos Úteis

```bash
# Verificar status dos containers
docker compose ps

# Reiniciar aplicação
docker compose restart

# Ver logs em tempo real
docker compose logs -f app

# Acessar container
docker exec -it app-base bash
```

## 📞 Suporte

Para problemas específicos:
1. Verifique os logs do Jenkins
2. Consulte os logs do Docker
3. Teste manualmente os comandos
4. Verifique as configurações de rede e firewall

---

**Nota**: Este pipeline assume que o Docker Compose está configurado corretamente e que todas as dependências estão definidas no `docker-compose.yml`.
