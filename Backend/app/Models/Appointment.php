<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $table = 'citas';

    use HasFactory;

    protected $fillable = [
        'cliente_id',
        'servicio_id',
        'empleado_id',
        'fecha',
        'hora',
        'estado',
        'notas'
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Client::class, 'cliente_id');
    }

    public function servicio()
    {
        return $this->belongsTo(Service::class, 'servicio_id');
    }

    public function empleado()
    {
        return $this->belongsTo(User::class, 'empleado_id');
    }
}
