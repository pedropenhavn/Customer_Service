<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\NewClient;

class ShowClientReasonCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clients:reason {id : ID do cliente} {--format=table : Formato de saída (table, json, detailed)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mostra o reason de um cliente específico';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $id = $this->argument('id');
        $format = $this->option('format');

        $client = NewClient::find($id);
        
        if (!$client) {
            $this->error("Cliente com ID {$id} não encontrado!");
            return 1;
        }

        if (!$client->reason) {
            $this->warn("Cliente ID {$id} não possui reason salvo.");
            return 0;
        }

        $reason = json_decode($client->reason, true);
        
        if (!$reason) {
            $this->error("Erro ao decodificar reason do cliente ID {$id}");
            return 1;
        }

        $this->info("=== REASON DO CLIENTE ID {$id} ===");
        $this->info("CNPJ: {$client->cnpj}");
        $this->info("API: {$reason['api']}");
        $this->info("Status: {$client->status}");
        $this->newLine();

        switch ($format) {
            case 'json':
                $this->showJsonFormat($reason);
                break;
            case 'detailed':
                $this->showDetailedFormat($reason);
                break;
            default:
                $this->showTableFormat($reason);
                break;
        }

        return 0;
    }

    /**
     * Mostra formato JSON
     */
    private function showJsonFormat(array $reason): void
    {
        $this->line(json_encode($reason, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    /**
     * Mostra formato detalhado
     */
    private function showDetailedFormat(array $reason): void
    {
        $this->info("📊 RESUMO:");
        $this->line("API: {$reason['api']}");
        $this->line("Mensagem: {$reason['message']}");
        $this->line("Total Validados: {$reason['total_validados']}");
        $this->line("Total Erros: {$reason['total_erros']}");
        $this->line("Válido: " . ($reason['valid'] ? '✅ SIM' : '❌ NÃO'));
        
        $this->newLine();
        
        if (!empty($reason['campos_validados'])) {
            $this->info("✅ CAMPOS VALIDADOS:");
            foreach ($reason['campos_validados'] as $campo) {
                $this->line("  • {$campo}");
            }
        }
        
        $this->newLine();
        
        if (!empty($reason['campos_erro'])) {
            $this->error("❌ CAMPOS COM ERRO:");
            foreach ($reason['campos_erro'] as $erro) {
                $this->line("  • {$erro}");
            }
        }
        
        $this->newLine();
        
        if (!empty($reason['detalhes_divergencias'])) {
            $this->warn("🔍 DETALHES DAS DIVERGÊNCIAS:");
            foreach ($reason['detalhes_divergencias'] as $divergencia) {
                $this->line("  📍 Campo: {$divergencia['campo']}");
                $this->line("     Cliente: {$divergencia['valor_cliente']}");
                $this->line("     {$reason['api']}: {$divergencia['valor_' . strtolower(str_replace('.', '', $reason['api']))]}");
                if (isset($divergencia['observacao'])) {
                    $this->line("     Observação: {$divergencia['observacao']}");
                }
                $this->newLine();
            }
        }
    }

    /**
     * Mostra formato tabela
     */
    private function showTableFormat(array $reason): void
    {
        $this->info("📊 RESUMO:");
        $this->table(
            ['Campo', 'Valor'],
            [
                ['API', $reason['api']],
                ['Mensagem', $reason['message']],
                ['Total Validados', $reason['total_validados']],
                ['Total Erros', $reason['total_erros']],
                ['Válido', $reason['valid'] ? 'SIM' : 'NÃO']
            ]
        );

        if (!empty($reason['campos_validados'])) {
            $this->newLine();
            $this->info("✅ CAMPOS VALIDADOS:");
            $this->table(['Campo'], collect($reason['campos_validados'])->map(fn($campo) => [$campo]));
        }

        if (!empty($reason['campos_erro'])) {
            $this->newLine();
            $this->error("❌ CAMPOS COM ERRO:");
            $this->table(['Erro'], collect($reason['campos_erro'])->map(fn($erro) => [$erro]));
        }

        if (!empty($reason['detalhes_divergencias'])) {
            $this->newLine();
            $this->warn("🔍 DETALHES DAS DIVERGÊNCIAS:");
            
            $detalhes = collect($reason['detalhes_divergencias'])->map(function ($divergencia) use ($reason) {
                $apiField = 'valor_' . strtolower(str_replace('.', '', $reason['api']));
                return [
                    $divergencia['campo'],
                    $divergencia['valor_cliente'],
                    $divergencia[$apiField],
                    $divergencia['observacao'] ?? '-'
                ];
            })->toArray();
            
            $this->table(
                ['Campo', 'Valor Cliente', 'Valor ' . $reason['api'], 'Observação'],
                $detalhes
            );
        }
    }
}
