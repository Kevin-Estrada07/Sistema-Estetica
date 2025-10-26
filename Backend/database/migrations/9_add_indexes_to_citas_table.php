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
        Schema::table('citas', function (Blueprint $table) {
            // Índices simples para búsquedas frecuentes
            $table->index('fecha');
            $table->index('empleado_id');
            $table->index('cliente_id');
            $table->index('estado');

            // Índices compuestos para queries comunes
            $table->index(['fecha', 'empleado_id']);
            $table->index(['fecha', 'cliente_id']);
            $table->index(['estado', 'fecha']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            $table->dropIndex(['fecha']);
            $table->dropIndex(['empleado_id']);
            $table->dropIndex(['cliente_id']);
            $table->dropIndex(['estado']);
            $table->dropIndex(['fecha', 'empleado_id']);
            $table->dropIndex(['fecha', 'cliente_id']);
            $table->dropIndex(['estado', 'fecha']);
        });
    }
};

