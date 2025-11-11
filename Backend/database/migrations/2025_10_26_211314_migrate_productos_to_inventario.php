<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Verificar si la tabla productos existe y tiene datos
        if (Schema::hasTable('productos')) {
            $productos = DB::table('productos')->get();

            foreach ($productos as $producto) {
                // Verificar si el producto ya existe en inventario por nombre
                $existe = DB::table('inventario')
                    ->where('nombre', $producto->nombre)
                    ->exists();

                if (!$existe) {
                    DB::table('inventario')->insert([
                        'nombre' => $producto->nombre,
                        'descripcion' => $producto->descripcion,
                        'stock' => $producto->cantidad,
                        'precio' => $producto->precio_unitario,
                        'tipo' => 'venta', // Los productos de la tabla productos son para venta
                        'created_at' => $producto->created_at,
                        'updated_at' => $producto->updated_at,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No se puede revertir automáticamente porque no sabemos qué registros fueron migrados
        // Se podría implementar una lógica más compleja si es necesario
    }
};
