FROM php:8.3-cli

# Argumentos definidos no docker-compose.yml ou passados na construção da imagem
ARG app_env
ARG user
ARG uid
ARG oracle_client_dir=/opt/oracle/instantclient
ARG oracle_client_basiclite_filename=client.zip
ARG oracle_client_sdk_filename=sdk.zip

# Instala dependências do sistema e limpa o cache
RUN apt-get update && apt-get install -y \
    git \
    curl \
    gnupg \
    libaio1t64 \
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

# Define o fuso horário do sistema
RUN ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && echo "America/Sao_Paulo" > /etc/timezone

# Copia os arquivos do Oracle Instant Client para o contêiner
COPY common/instantclient/${oracle_client_basiclite_filename} ${oracle_client_dir}/
COPY common/instantclient/${oracle_client_sdk_filename} ${oracle_client_dir}/

# Instala o Oracle Instant Client
RUN mkdir -p ${oracle_client_dir} && cd ${oracle_client_dir} && \
    unzip ${oracle_client_basiclite_filename} && \
    unzip ${oracle_client_sdk_filename} && \
    rm ${oracle_client_basiclite_filename} && \
    rm ${oracle_client_sdk_filename} && \
    mv ${oracle_client_dir}/instantclient_*/* ${oracle_client_dir}/ && \
    rm -r ${oracle_client_dir}/instantclient_* && \
    echo "${oracle_client_dir}" > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig && \
    echo 'export LD_LIBRARY_PATH="${oracle_client_dir}:$LD_LIBRARY_PATH"' >> /etc/profile.d/oracle.sh

# Verifica o conteúdo do diretório após descompactar
RUN ls -l ${oracle_client_dir} && ls -l ${oracle_client_dir}/sdk/include

# Instala extensões PHP necessárias
RUN docker-php-ext-configure intl && docker-php-ext-install intl && docker-php-ext-enable intl && \
    docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd sockets zip soap && \
    pecl install -o -f xdebug redis openswoole && \
    docker-php-ext-enable xdebug redis openswoole && \
    docker-php-ext-configure oci8 --with-oci8=instantclient,${oracle_client_dir} && \
    docker-php-ext-configure pdo_oci --with-pdo-oci=instantclient,${oracle_client_dir} && \
    docker-php-ext-install oci8 pdo_oci

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

# Exposição das portas usadas pelo Xdebug e PHP-FPM
EXPOSE 9003 9000 8000

# Define o entrypoint
ENTRYPOINT ["entrypoint.sh"]

# Define o usuário não-root para rodar o contêiner
USER $user

