<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleVenta extends Model
{
    protected $table = 'detalle_ventas';
    protected $fillable = ['venta_id', 'servicio_id', 'producto_id', 'cantidad', 'precio_unitario', 'subtotal'];

    public function venta()
    {
        return $this->belongsTo(Venta::class);
    }

    public function servicio()
    {
        return $this->belongsTo(Service::class);
    }

    public function producto()
    {
        return $this->belongsTo(Product::class);
    }
}
