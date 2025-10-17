<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $table = 'servicios';
    protected $fillable = ['nombre', 'descripcion', 'duracion', 'precio'];

    public function inventario()
    {
        return $this->belongsToMany(
            Inventory::class,     // modelo relacionado
            'prod_servicio',      // tabla pivote
            'servicio_id',        // foreign key de este modelo
            'inventario_id'       // foreign key del otro modelo
        )->withPivot('cant_usada')
            ->withTimestamps();
    }
}
