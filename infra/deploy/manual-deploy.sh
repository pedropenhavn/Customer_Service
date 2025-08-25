#!/bin/bash

# Script de Deploy Manual para Customer Service
# Uso: ./manual-deploy.sh

set -e  # Para o script se houver erro

echo "🚀 Iniciando deploy manual do Customer Service..."

# Configurações
PROJECT_NAME="customer-service"
REPO_URL="https://github.com/pedropenhavn/Customer_Service.git"
BRANCH="main"
WORKSPACE="/var/lib/jenkins/workspace/${PROJECT_NAME}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado"
fi

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    error "Git não está instalado"
fi

log "📋 Verificando pré-requisitos..."

# Criar workspace se não existir
if [ ! -d "$WORKSPACE" ]; then
    log "📁 Criando workspace: $WORKSPACE"
    mkdir -p "$WORKSPACE"
fi

# Navegar para o workspace
cd "$WORKSPACE"

# Clonar ou atualizar repositório
if [ ! -d ".git" ]; then
    log "📥 Clonando repositório..."
    git clone -b "$BRANCH" "$REPO_URL" .
else
    log "🔄 Atualizando repositório..."
    git fetch origin
    git reset --hard origin/$BRANCH
fi

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    warn "Arquivo .env não encontrado. Você precisa criar manualmente."
    warn "Copie o arquivo .env.example e configure as variáveis de ambiente."
    read -p "Deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Deploy cancelado pelo usuário"
    fi
fi

# Parar containers existentes
log "🛑 Parando containers existentes..."
docker compose down --remove-orphans || true

# Construir e iniciar containers
log "🐳 Construindo e iniciando containers..."
docker compose up -d --build

# Aguardar aplicação inicializar
log "⏳ Aguardando aplicação inicializar..."
sleep 30

# Verificar se aplicação está respondendo
log "🏥 Verificando saúde da aplicação..."
for i in {1..10}; do
    if curl -f http://localhost:8899 > /dev/null 2>&1; then
        log "✅ Aplicação está respondendo corretamente!"
        break
    else
        warn "Tentativa $i/10 - Aplicação ainda não está respondendo..."
        if [ $i -eq 10 ]; then
            error "Aplicação não está respondendo após 10 tentativas"
        fi
        sleep 10
    fi
done

# Mostrar status dos containers
log "📊 Status dos containers:"
docker compose ps

log "🎉 Deploy concluído com sucesso!"
log "🌐 Aplicação disponível em: http://localhost:8899"
log "📋 Para ver logs: docker compose logs -f"
