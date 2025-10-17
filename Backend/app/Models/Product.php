<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'productos';
    protected $fillable = ['nombre', 'descripcion', 'cantidad', 'precio_unitario'];
}
