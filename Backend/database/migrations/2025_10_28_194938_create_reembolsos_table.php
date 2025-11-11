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
        Schema::create('reembolsos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')->constrained('ventas')->onDelete('cascade');
            $table->foreignId('solicitado_por')->constrained('users')->onDelete('set null');
            $table->foreignId('autorizado_por')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('monto', 10, 2);
            $table->text('motivo');
            $table->enum('estado', ['pendiente', 'aprobado', 'rechazado'])->default('pendiente');
            $table->text('comentario_admin')->nullable();
            $table->timestamp('fecha_solicitud');
            $table->timestamp('fecha_respuesta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reembolsos');
    }
};
