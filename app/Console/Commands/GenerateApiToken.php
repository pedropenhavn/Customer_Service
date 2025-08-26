<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateApiToken extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api:generate-token {--show : Mostrar o token gerado}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gera um token seguro para autenticação da API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Gerar um token seguro de 64 caracteres
        $token = Str::random(64);
        
        $this->info('Token gerado com sucesso!');
        $this->newLine();
        
        if ($this->option('show')) {
            $this->info('Token: ' . $token);
            $this->newLine();
        }
        
        $this->info('Para usar este token:');
        $this->line('1. Adicione a seguinte linha ao seu arquivo .env:');
        $this->line('   API_TOKEN=' . $token);
        $this->newLine();
        
        $this->info('2. Use o token nas requisições da API com o header:');
        $this->line('   Authorization: Bearer ' . $token);
        $this->newLine();
        
        $this->warn('⚠️  IMPORTANTE: Mantenha este token seguro e não o compartilhe!');
        
        return Command::SUCCESS;
    }
}
