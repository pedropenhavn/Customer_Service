<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\ProcessNewClientsController;
use App\Models\NewClient;

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
        
        // Mostra estatísticas antes do processamento
        $this->showStatistics('ANTES');
        
        try {
            $controller = app(ProcessNewClientsController::class);
            $response = $controller->processPendingClients();

            $data = json_decode($response->getContent(), true);
            
            if ($data['success']) {
                $this->info($data['message']);
                $this->info('Clientes processados: ' . count($data['data']));
                
                // Mostra detalhes dos resultados
                foreach ($data['data'] as $result) {
                    $status = $result['valid'] ? '✅ APROVADO' : '❌ REJEITADO';
                    $this->line("CNPJ: {$result['cnpj']} - {$status} - {$result['message']}");
                }
            } else {
                $this->error('Erro: ' . $data['message']);
            }
            
        } catch (\Exception $e) {
            $this->error('Erro ao executar comando: ' . $e->getMessage());
        }
        
        // Mostra estatísticas após o processamento
        $this->showStatistics('DEPOIS');
    }
    
    /**
     * Mostra estatísticas dos clientes
     */
    private function showStatistics(string $periodo): void
    {
        $this->newLine();
        $this->info("=== ESTATÍSTICAS {$periodo} ===");
        
        $stats = [
            'Total' => NewClient::count(),
            'Pendentes' => NewClient::where('status', 'PEN')->where('flag', 0)->count(),
            'Aprovados' => NewClient::where('status', 'APV')->count(),
            'Rejeitados' => NewClient::where('status', 'RPV')->count(),
            'Processados' => NewClient::where('status', 'PRO')->count(),
            'Erro' => NewClient::where('status', 'ERR')->count(),
        ];
        
        foreach ($stats as $label => $count) {
            $this->line("{$label}: {$count}");
        }
        
        $this->newLine();
    }
}
