#!/bin/bash

# Script de Deploy Manual para Customer Service
# Uso: ./manual-deploy.sh

set -e

echo "🚀 Iniciando deploy manual do Customer Service..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se o .env existe
if [ ! -f ".env" ]; then
    echo "❌ Erro: Arquivo .env não encontrado"
    echo "💡 Copie o env.example para .env e configure as variáveis"
    exit 1
fi

echo "📦 Buildando o frontend..."
cd frontend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependências do frontend..."
    npm ci --production=false
fi

echo "🔨 Buildando para produção..."
npm run build

cd ..

echo "🐳 Parando containers existentes..."
docker compose down

echo "🔨 Buildando e iniciando containers..."
docker compose up -d --build

echo "⏳ Aguardando containers iniciarem..."
sleep 30

echo "🔍 Verificando status dos containers..."
docker compose ps

echo "🏥 Fazendo health check..."
sleep 10

if curl -f http://192.168.250.195/health; then
    echo "✅ Health check passou!"
else
    echo "❌ Health check falhou"
    echo "📋 Logs dos containers:"
    docker compose logs --tail=20
    exit 1
fi

if curl -f http://192.168.250.195/; then
    echo "✅ Frontend está acessível!"
else
    echo "❌ Frontend não está acessível"
    exit 1
fi

echo ""
echo "🎉 Deploy realizado com sucesso!"
echo "🌐 Frontend: http://192.168.250.195"
echo "🔌 API: http://192.168.250.195/api"
echo "🏥 Health: http://192.168.250.195/health"
echo ""
echo "📋 Para ver os logs: docker compose logs -f"
echo "🛑 Para parar: docker compose down"
