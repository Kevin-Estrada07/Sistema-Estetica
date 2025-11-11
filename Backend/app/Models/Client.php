<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $table = 'clientes';
    protected $fillable = ['nombre', 'telefono', 'email', 'direccion'];

    /**
     * Relación: Un cliente tiene muchas citas
     */
    public function citas()
    {
        return $this->hasMany(Appointment::class, 'cliente_id');
    }

    /**
     * Relación: Un cliente tiene muchas ventas
     */
    public function ventas()
    {
        return $this->hasMany(Venta::class, 'cliente_id');
    }
}
