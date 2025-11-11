<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonio extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'comentario',
        'calificacion',
        'destacado',
        'aprobado',
        'avatar'
    ];

    protected $casts = [
        'destacado' => 'boolean',
        'aprobado' => 'boolean',
        'calificacion' => 'integer',
    ];

    /**
     * Scope para obtener solo testimonios aprobados
     */
    public function scopeAprobados($query)
    {
        return $query->where('aprobado', true);
    }

    /**
     * Scope para obtener solo testimonios destacados
     */
    public function scopeDestacados($query)
    {
        return $query->where('destacado', true)->where('aprobado', true);
    }
}

