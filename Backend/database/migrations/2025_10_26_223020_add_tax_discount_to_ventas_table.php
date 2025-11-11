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
        Schema::table('ventas', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->default(0)->after('total'); // Subtotal antes de impuestos/descuentos
            $table->decimal('descuento_porcentaje', 5, 2)->default(0)->after('subtotal'); // % de descuento
            $table->decimal('descuento_monto', 10, 2)->default(0)->after('descuento_porcentaje'); // Monto del descuento
            $table->decimal('impuesto_porcentaje', 5, 2)->default(0)->after('descuento_monto'); // % de impuesto
            $table->decimal('impuesto_monto', 10, 2)->default(0)->after('impuesto_porcentaje'); // Monto del impuesto
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'descuento_porcentaje', 'descuento_monto', 'impuesto_porcentaje', 'impuesto_monto']);
        });
    }
};
