<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    protected $table = 'ventas';
    protected $fillable = [
        'cliente_id',
        'usuario_id',
        'subtotal',
        'descuento_porcentaje',
        'descuento_monto',
        'impuesto_porcentaje',
        'impuesto_monto',
        'total',
        'metodo_pago',
        'fecha'
    ];

    public function cliente()
    {
        return $this->belongsTo(Client::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleVenta::class);
    }

    public function reembolsos()
    {
        return $this->hasMany(Reembolso::class);
    }
}
