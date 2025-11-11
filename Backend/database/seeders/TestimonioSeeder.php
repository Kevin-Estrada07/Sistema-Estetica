<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Testimonio;

class TestimonioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $testimonios = [
            [
                'nombre' => 'Ana P.',
                'comentario' => 'Excelente atención y resultados increíbles.',
                'calificacion' => 5,
                'avatar' => 'https://i.pravatar.cc/100?img=1',
                'aprobado' => true,
                'destacado' => true,
            ],
            [
                'nombre' => 'Luis M.',
                'comentario' => 'Muy profesional y ambiente relajante.',
                'calificacion' => 4,
                'avatar' => 'https://i.pravatar.cc/100?img=2',
                'aprobado' => true,
                'destacado' => false,
            ],
            [
                'nombre' => 'Carla R.',
                'comentario' => 'Los mejores tratamientos faciales que he probado. El personal es muy amable y profesional. Definitivamente volveré.',
                'calificacion' => 5,
                'avatar' => 'https://i.pravatar.cc/100?img=3',
                'aprobado' => true,
                'destacado' => true,
            ],
            [
                'nombre' => 'María G.',
                'comentario' => 'Me encantó el servicio de manicure y pedicure. El lugar es muy limpio y acogedor. Las chicas son súper atentas y el resultado quedó hermoso.',
                'calificacion' => 5,
                'avatar' => 'https://i.pravatar.cc/100?img=5',
                'aprobado' => true,
                'destacado' => true,
            ],
            [
                'nombre' => 'Sofia L.',
                'comentario' => 'Excelente servicio de depilación. Sin dolor y muy profesional.',
                'calificacion' => 5,
                'avatar' => 'https://i.pravatar.cc/100?img=9',
                'aprobado' => true,
                'destacado' => false,
            ],
            [
                'nombre' => 'Patricia V.',
                'comentario' => 'El masaje relajante fue increíble. Salí renovada y sin estrés. El ambiente es muy tranquilo y las terapeutas son expertas.',
                'calificacion' => 5,
                'avatar' => 'https://i.pravatar.cc/100?img=10',
                'aprobado' => true,
                'destacado' => true,
            ],
        ];

        foreach ($testimonios as $testimonio) {
            Testimonio::create($testimonio);
        }
    }
}

