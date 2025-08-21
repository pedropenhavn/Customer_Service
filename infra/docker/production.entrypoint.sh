#!/bin/sh

# Habilitar o modo verbose para depuração
set -e

# Instala as dependências do PHP com Composer
composer install --no-interaction --no-progress --optimize-autoloader

# Instala o Swoole
php artisan octane:install --server=swoole

# Limpa o cache do Laravel
php artisan optimize:clear

# Verificar se a chave de criptografia do Laravel foi gerada
if ! grep -q "^APP_KEY=base64" .env; then
    # Gera a chave de criptografia do Laravel
    php artisan key:generate
fi

# Iniciar o supervisor para gerenciar os processos
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
