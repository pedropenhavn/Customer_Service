<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\NewClient;
use Illuminate\Support\Facades\DB;

class ShowClientStatisticsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clients:statistics {--detailed : Mostra estatísticas detalhadas}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mostra estatísticas dos clientes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== ESTATÍSTICAS DOS CLIENTES ===');
        
        $this->showBasicStatistics();
        
        if ($this->option('detailed')) {
            $this->showDetailedStatistics();
        }
    }
    
    /**
     * Mostra estatísticas básicas
     */
    private function showBasicStatistics(): void
    {
        $stats = [
            'Total de Clientes' => NewClient::count(),
            'Pendentes' => NewClient::where('status', 'PEN')->where('flag', 0)->count(),
            'Aprovados' => NewClient::where('status', 'APV')->count(),
            'Rejeitados' => NewClient::where('status', 'RPV')->count(),
            'Processados' => NewClient::where('status', 'PRO')->count(),
            'Erro' => NewClient::where('status', 'ERR')->count(),
        ];
        
        $this->table(['Status', 'Quantidade'], collect($stats)->map(fn($value, $key) => [$key, $value]));
    }
    
    /**
     * Mostra estatísticas detalhadas
     */
    private function showDetailedStatistics(): void
    {
        $this->newLine();
        $this->info('=== ESTATÍSTICAS DETALHADAS ===');
        
        // Estatísticas por origem
        $this->info('Por Origem:');
        $origens = NewClient::select('origem', DB::raw('count(*) as total'))
            ->groupBy('origem')
            ->orderBy('total', 'desc')
            ->get();
            
        $this->table(['Origem', 'Total'], $origens->map(fn($item) => [$item->origem, $item->total]));
        
        // Estatísticas por status
        $this->newLine();
        $this->info('Por Status:');
        $status = NewClient::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->orderBy('total', 'desc')
            ->get();
            
        $this->table(['Status', 'Total'], $status->map(fn($item) => [$item->status, $item->total]));
        
        // Últimos clientes processados
        $this->newLine();
        $this->info('Últimos 5 Clientes Processados:');
        $ultimos = NewClient::select('id', 'cnpj', 'status', 'origem', 'created_at', 'updated_at')
            ->whereIn('status', ['APV', 'RPV'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();
            
        $this->table(
            ['ID', 'CNPJ', 'Status', 'Origem', 'Criado', 'Atualizado'],
            $ultimos->map(fn($item) => [
                $item->id,
                $item->cnpj,
                $item->status,
                $item->origem,
                $item->created_at->format('d/m/Y H:i'),
                $item->updated_at->format('d/m/Y H:i')
            ])
        );
        
        // Clientes com erro
        $this->newLine();
        $this->info('Clientes com Erro:');
        $erros = NewClient::where('status', 'ERR')
            ->select('id', 'cnpj', 'origem', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        if ($erros->count() > 0) {
            $this->table(
                ['ID', 'CNPJ', 'Origem', 'Criado'],
                $erros->map(fn($item) => [
                    $item->id,
                    $item->cnpj,
                    $item->origem,
                    $item->created_at->format('d/m/Y H:i')
                ])
            );
        } else {
            $this->info('Nenhum cliente com erro encontrado.');
        }
    }
}
