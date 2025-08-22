<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\ProcessNewClientsController;

class ProcessPendingClientsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clients:process-pending';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Processa clientes com status PEN e flag = 0';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando processamento de clientes pendentes...');
        
        try {
            $controller = new ProcessNewClientsController();
            $response = $controller->processPendingClients();

            $data = json_decode($response->getContent(), true);
            
            if ($data['success']) {
                $this->info($data['message']);
                $this->info('Clientes processados: ' . count($data['data']));
            } else {
                $this->error('Erro: ' . $data['message']);
            }
            
        } catch (\Exception $e) {
            $this->error('Erro ao executar comando: ' . $e->getMessage());
        }
    }
}
