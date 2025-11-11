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
        Schema::table('inventario', function (Blueprint $table) {
            $table->text('descripcion')->nullable()->after('nombre');
            $table->enum('tipo', ['venta', 'servicio', 'ambos'])->default('ambos')->after('descripcion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventario', function (Blueprint $table) {
            $table->dropColumn(['descripcion', 'tipo']);
        });
    }
};
