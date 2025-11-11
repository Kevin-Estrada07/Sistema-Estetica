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
        Schema::create('testimonios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('comentario');
            $table->integer('calificacion')->default(5); // 1-5 estrellas
            $table->boolean('destacado')->default(false); // Para mostrar en la página principal
            $table->boolean('aprobado')->default(false); // Moderación
            $table->string('avatar')->nullable(); // URL del avatar
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonios');
    }
};

