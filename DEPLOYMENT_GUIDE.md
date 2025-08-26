# Guia de Deploy - Customer Service API

## Problemas Comuns no Servidor

### 1. Configuração de CORS
Se você está enfrentando problemas de CORS no servidor, verifique se:

- O arquivo `config/cors.php` foi criado
- O middleware CORS está registrado em `bootstrap/app.php`
- O servidor web (Apache/Nginx) está configurado corretamente

### 2. Configuração do Banco de Dados
Para o servidor, certifique-se de que:

```bash
# Gerar chave da aplicação
php artisan key:generate

# Executar migrations
php artisan migrate

# Limpar cache
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env` no servidor com as seguintes configurações:

```env
APP_NAME="Customer Service API"
APP_ENV=production
APP_KEY=base64:sua_chave_aqui
APP_DEBUG=false
APP_URL=https://seu-dominio.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=customer_service
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha

LOG_CHANNEL=stack
LOG_LEVEL=error
```

### 4. Permissões de Arquivo
```bash
# Definir permissões corretas
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chown -R www-data:www-data storage/
chown -R www-data:www-data bootstrap/cache/
```

### 5. Configuração do Apache
Se estiver usando Apache, crie um arquivo `.htaccess` na raiz:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### 6. Configuração do Nginx
Se estiver usando Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /path/to/your/project/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 7. Verificação de Logs
Para debugar problemas:

```bash
# Ver logs do Laravel
tail -f storage/logs/laravel.log

# Ver logs do Apache
tail -f /var/log/apache2/error.log

# Ver logs do Nginx
tail -f /var/log/nginx/error.log
```

### 8. Teste da API
Após o deploy, teste as rotas:

```bash
# Health check
curl -X GET https://seu-dominio.com/api/health

# Teste de inserção
curl -X POST https://seu-dominio.com/api/newClients \
  -H "Content-Type: application/json" \
  -d '[{"cnpj":"12345678901234","json":{"teste":"dados"},"origem":"TESTE"}]'

# Teste de consulta
curl -X GET "https://seu-dominio.com/api/consultClients?per_page=5"
```

### 9. Comandos de Manutenção
```bash
# Colocar em modo de manutenção
php artisan down

# Remover modo de manutenção
php artisan up

# Otimizar para produção
php artisan optimize
php artisan config:cache
php artisan route:cache
```

### 10. Monitoramento
Configure monitoramento para:
- Status da API (endpoint `/api/health`)
- Logs de erro
- Performance do banco de dados
- Uso de memória e CPU
