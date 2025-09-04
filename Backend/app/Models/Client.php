<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $table = 'clientes';
    protected $fillable = ['nombre', 'telefono', 'email', 'direccion'];
}
