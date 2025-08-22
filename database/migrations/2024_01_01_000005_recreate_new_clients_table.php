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
        // Drop da tabela existente
        Schema::dropIfExists('newClients');
        
        // Criar nova tabela com estrutura limpa
        Schema::create('newClients', function (Blueprint $table) {
            $table->id();
            $table->string('cnpj'); // CNPJ RECEBIDO
            $table->longText('json'); // JSON RECEBIDO
            $table->longText('sintegra')->nullable(); // NULL (FUTURAMENTE IRA ARMAZENAR UM JSON)
            $table->longText('receita')->nullable(); // NULL (FUTURAMENTE IRA ARMAZENAR UM JSON)
            $table->longText('simples_nacional')->nullable(); // NULL (FUTURAMENTE IRA ARMAZENAR UM JSON)
            $table->string('origem'); // ORIGEM RECEBIDA
            $table->enum('status', ['PEN', 'PRO', 'ERR', 'RPV', 'APV'])->default('PEN'); // POR DEFAULT (PEN)
            $table->tinyInteger('flag')->default(0); // POR DEFAULT 0
            $table->timestamps(); // CREATED_AT e UPDATED_AT
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('newClients');
    }
};
