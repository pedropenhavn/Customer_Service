FROM php:8.3-cli

# Argumentos definidos no docker-compose.yml ou passados na construção da imagem
ARG app_env
ARG user
ARG uid

# Instala dependências do sistema e limpa o cache
RUN apt-get update && apt-get install -y \
    git \
    curl \
    gnupg \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libicu-dev \
    supervisor \
    libbrotli-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala Node.js 18.x
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Define o fuso horário do sistema
RUN ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && echo "America/Sao_Paulo" > /etc/timezone

# Instala extensões PHP necessárias
RUN docker-php-ext-configure intl && docker-php-ext-install intl && docker-php-ext-enable intl && \
    docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd sockets zip soap && \
    pecl install -o -f redis && \
    docker-php-ext-enable redis

# Obtém a versão mais recente do Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copia o php.ini customizado para o contêiner
COPY php/${app_env}.php.ini $PHP_INI_DIR/conf.d/

# Copia o script de entrypoint
COPY docker/${app_env}.entrypoint.sh /usr/local/bin/entrypoint.sh

# Copia o arquivo de configuração do Supervisor
COPY supervisor/${app_env}.supervisord.conf /etc/supervisor/supervisord.conf

# Torna o script de entrypoint executável
RUN chmod +x /usr/local/bin/entrypoint.sh

# Cria usuário do sistema para rodar comandos Composer e Artisan
RUN useradd -G www-data,root -u $uid -d /home/$user $user
RUN mkdir -p /home/$user/.composer && \
    chown -R $user:$user /home/$user

# Cria o diretório de log do Supervisor e ajusta as permissões
RUN mkdir -p /var/log/supervisor && chown -R $user:$user /var/log/supervisor

# Define o diretório de trabalho dentro do contêiner
WORKDIR /var/www

# Exposição das portas usadas pelo PHP-FPM
EXPOSE 9000 8000

# Define o entrypoint
ENTRYPOINT ["entrypoint.sh"]

# Define o usuário não-root para rodar o contêiner
USER $user

