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
        // Índices para tabla ventas (reportes de ingresos)
        Schema::table('ventas', function (Blueprint $table) {
            if (Schema::hasColumn('ventas', 'fecha')) {
                $table->index('fecha');
            }
        });

        // Índices para tabla servicios
        Schema::table('servicios', function (Blueprint $table) {
            $table->index('nombre');
        });

        // Índices para tabla inventario
        Schema::table('inventario', function (Blueprint $table) {
            $table->index('stock');
        });

        // Índices para tabla prod_servicio (relación productos-servicios)
        if (Schema::hasTable('prod_servicio')) {
            Schema::table('prod_servicio', function (Blueprint $table) {
                $table->index('inventario_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            if (Schema::hasColumn('ventas', 'fecha')) {
                $table->dropIndex('ventas_fecha_index');
            }
        });

        Schema::table('servicios', function (Blueprint $table) {
            $table->dropIndex('servicios_nombre_index');
        });

        Schema::table('inventario', function (Blueprint $table) {
            $table->dropIndex('inventario_stock_index');
        });

        if (Schema::hasTable('prod_servicio')) {
            Schema::table('prod_servicio', function (Blueprint $table) {
                $table->dropIndex('prod_servicio_inventario_id_index');
            });
        }
    }
};

