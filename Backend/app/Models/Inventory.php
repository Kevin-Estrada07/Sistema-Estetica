<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{

    protected $table = 'inventario';
    protected $fillable = ['nombre', 'stock', 'precio'];

    public function servicios()
    {
        return $this->belongsToMany(
            Service::class,      // modelo relacionado
            'prod_servicio',      // tabla pivote
            'inventario_id',      // foreign key de este modelo
            'servicio_id'         // foreign key del otro modelo
        )->withPivot('cant_usada')
            ->withTimestamps();
    }
}
