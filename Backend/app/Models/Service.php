<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $table = 'servicios';
    protected $fillable = ['nombre', 'descripcion', 'duracion', 'precio'];
}
