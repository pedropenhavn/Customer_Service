#!/bin/sh

# Habilitar o modo verbose para depuração
set -e

# Instala as dependências do PHP com Composer
composer install --no-interaction --no-progress --optimize-autoloader

# Verificar se a chave de criptografia do Laravel foi gerada
if ! grep -q "^APP_KEY=base64" .env; then
    # Gera a chave de criptografia do Laravel
    php artisan key:generate
fi

# Build do frontend (sempre fazer build para garantir que está atualizado)
echo "🔨 Buildando frontend..."
cd frontend

# Remover build antigo se existir
if [ -d "build" ]; then
    echo "🗑️ Removendo build antigo..."
    rm -rf build
fi

# Instalar dependências se node_modules não existir
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm ci --production=false
fi

# Build para produção
echo "🔨 Buildando para produção..."
npm run build

cd ..
echo "✅ Frontend buildado com sucesso!"

# Executar migrations se necessário
php artisan migrate --force

# Limpa o cache do Laravel
php artisan optimize:clear

# Iniciar o supervisor para gerenciar os processos
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
