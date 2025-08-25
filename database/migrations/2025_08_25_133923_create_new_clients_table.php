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
        Schema::create('newClients', function (Blueprint $table) {
            $table->id();
            $table->string('cnpj');
            $table->longText('json');
            $table->longText('sintegra')->nullable();
            $table->longText('cnpjws')->nullable();
            $table->longText('consultacep')->nullable();
            $table->longText('reason')->nullable();
            $table->string('origem');
            $table->enum('status', ['PEN', 'PRO', 'ERR', 'RPV', 'APV'])->default('PEN');
            $table->tinyInteger('flag')->default(0);
            $table->timestamps();
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
