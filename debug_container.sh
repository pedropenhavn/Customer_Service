#!/bin/bash

echo "🔍 Debug do Container Customer Service"
echo "======================================"

# Verificar status dos containers
echo "1. Status dos containers:"
docker compose ps
echo ""

# Ver logs do container app
echo "2. Logs do container app:"
docker compose logs app --tail=50
echo ""

# Ver logs do supervisor
echo "3. Logs do supervisor:"
docker compose exec app cat /var/log/supervisor/supervisord.log
echo ""

# Ver logs do Laravel
echo "4. Logs do Laravel:"
docker compose exec app cat /var/log/supervisor/laravel.log
echo ""

# Ver logs de erro do Laravel
echo "5. Logs de erro do Laravel:"
docker compose exec app cat /var/log/supervisor/laravel_err.log
echo ""

# Verificar se o .env existe
echo "6. Verificando arquivo .env:"
docker compose exec app ls -la .env
echo ""

# Verificar se a chave APP_KEY foi gerada
echo "7. Verificando APP_KEY:"
docker compose exec app grep "APP_KEY" .env
echo ""

# Verificar se as migrations foram executadas
echo "8. Verificando migrations:"
docker compose exec app php artisan migrate:status
echo ""

# Testar conexão com banco
echo "9. Testando conexão com banco:"
docker compose exec app php artisan tinker --execute="echo 'Conexão OK: ' . DB::connection()->getPdo()->getAttribute(PDO::ATTR_SERVER_VERSION);"
echo ""

# Verificar se a aplicação está respondendo
echo "10. Testando health check:"
curl -s http://192.162.250.195:8899/api/health || echo "❌ Health check falhou"
echo ""

echo "✅ Debug concluído!"
