# Comando para Processar Clientes Pendentes

## Rotina de Processamento

A rotina foi implementada para processar clientes com status `PEN` e `flag = 0`.

### Componentes Criados:

1. **Comando Artisan**: `app/Console/Commands/ProcessPendingClientsCommand.php`
   - Comando: `php artisan clients:process-pending`
   - Busca clientes pendentes e chama a controller

2. **Controller**: `app/Http/Controllers/ProcessNewClientsController.php`
   - Processa os dados de cada cliente encontrado

### Como Usar:

1. **Acessar o container**:
```bash
docker exec -it customer_service-app-1 bash
```

2. **Executar o comando**:
```bash
php artisan clients:process-pending
```

### Funcionamento:

1. O comando `clients:process-pending` é executado
2. A controller busca registros com `status = 'PEN'` e `flag = 0`
3. Para cada registro, extrai o `cnpj` e o `json`
4. Chama o método `processClient()` para processar os dados
5. Exibe os resultados no console

### Para Agendamento Manual:

Se quiser agendar para rodar a cada 5 minutos, use cron no host:

```bash
# Adicionar ao crontab do host
*/5 * * * * docker exec customer_service-app-1 php artisan clients:process-pending
```
