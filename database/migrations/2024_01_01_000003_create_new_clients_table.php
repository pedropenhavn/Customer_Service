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
            $table->enum('status', ['PEN', 'PRO', 'ERR', 'RPV', 'APV'])->default('PEN');
            $table->string('reason')->nullable();
            $table->text('error_message')->nullable();
            $table->tinyInteger('flag')->default(0);
            $table->timestamp('processed_at')->nullable();
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
