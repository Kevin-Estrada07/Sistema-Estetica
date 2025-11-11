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
        // ============================================
        // TABLA VENTAS: Cambiar usuario_id a SET NULL
        // ============================================
        Schema::table('ventas', function (Blueprint $table) {
            // 1. Eliminar la restricción de clave foránea existente
            $table->dropForeign(['usuario_id']);
        });

        Schema::table('ventas', function (Blueprint $table) {
            // 2. Modificar la columna para que sea nullable
            $table->foreignId('usuario_id')->nullable()->change();

            // 3. Recrear la clave foránea con onDelete('set null')
            $table->foreign('usuario_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });

        // ============================================
        // TABLA CITAS: Cambiar empleado_id a SET NULL
        // ============================================
        Schema::table('citas', function (Blueprint $table) {
            // 1. Eliminar la restricción de clave foránea existente
            $table->dropForeign(['empleado_id']);
        });

        Schema::table('citas', function (Blueprint $table) {
            // 2. Modificar la columna para que sea nullable
            $table->foreignId('empleado_id')->nullable()->change();

            // 3. Recrear la clave foránea con onDelete('set null')
            $table->foreign('empleado_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // ============================================
        // REVERTIR TABLA VENTAS
        // ============================================
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropForeign(['usuario_id']);
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->foreignId('usuario_id')->nullable(false)->change();

            $table->foreign('usuario_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });

        // ============================================
        // REVERTIR TABLA CITAS
        // ============================================
        Schema::table('citas', function (Blueprint $table) {
            $table->dropForeign(['empleado_id']);
        });

        Schema::table('citas', function (Blueprint $table) {
            $table->foreignId('empleado_id')->nullable(false)->change();

            $table->foreign('empleado_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }
};
