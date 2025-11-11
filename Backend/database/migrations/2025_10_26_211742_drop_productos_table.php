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
        // Primero eliminar la restricción de clave foránea en detalle_ventas
        Schema::table('detalle_ventas', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
        });

        // Eliminar la tabla productos ya que ahora usamos inventario
        Schema::dropIfExists('productos');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recrear la tabla productos si se revierte la migración
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->timestamps();
        });
    }
};
