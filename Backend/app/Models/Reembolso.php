<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reembolso extends Model
{
    protected $table = 'reembolsos';

    protected $fillable = [
        'venta_id',
        'solicitado_por',
        'autorizado_por',
        'monto',
        'motivo',
        'estado',
        'comentario_admin',
        'fecha_solicitud',
        'fecha_respuesta'
    ];

    protected $casts = [
        'fecha_solicitud' => 'datetime',
        'fecha_respuesta' => 'datetime',
    ];

    // Relaciones
    public function venta()
    {
        return $this->belongsTo(Venta::class, 'venta_id');
    }

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitado_por');
    }

    public function autorizador()
    {
        return $this->belongsTo(User::class, 'autorizado_por');
    }
}
