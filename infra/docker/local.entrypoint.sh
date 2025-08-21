#!/bin/sh

# Habilitar o modo verbose para depuração
set -e

# Verificar se a chave de criptografia do Laravel foi gerada
if ! grep -q "^APP_KEY=base64" .env; then
    # Instala as dependências do PHP com Composer
    composer install --no-interaction --no-progress --optimize-autoloader
    # Aguarda 60 segundos para garantir que o Composer tenha terminado de instalar as dependências
    sleep 60
    # Gera a chave de criptografia do Laravel
    php artisan key:generate
    else
    # Instala as dependências do PHP com Composer
    composer update --no-interaction --no-progress --optimize-autoloader
fi

# Limpa o cache do Laravel
php artisan optimize:clear

# Iniciar o supervisor para gerenciar os processos
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
