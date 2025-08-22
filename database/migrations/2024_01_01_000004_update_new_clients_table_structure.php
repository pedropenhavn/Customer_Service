<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('newClients', function (Blueprint $table) {
            // Adicionar novas colunas
            $table->longText('sintegra')->nullable()->after('json');
            $table->longText('receita')->nullable()->after('sintegra');
            $table->longText('simples_nacional')->nullable()->after('receita');
            $table->string('origem')->nullable()->after('simples_nacional');
            
            // Remover colunas que não serão mais usadas
            $table->dropColumn(['reason', 'error_message', 'processed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('newClients', function (Blueprint $table) {
            // Reverter as mudanças
            $table->dropColumn(['sintegra', 'receita', 'simples_nacional', 'origem']);
            $table->string('reason')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();
        });
    }
};
