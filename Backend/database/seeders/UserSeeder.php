<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $recepcionistaRole = Role::where('name', 'Recepcionista')->first();
        $estilistRole = Role::where('name', 'Estilista')->first();

        // Crear usuario administrador
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@example.com',
            'password' => Hash::make('123456789'),
            'role_id' => $adminRole->id,
        ]);

        // Crear usuario recepcionista
        User::create([
            'name' => 'Recepcionista',
            'email' => 'recepcionista@example.com',
            'password' => Hash::make('1232456789'),
            'role_id' => $recepcionistaRole->id,
        ]);

        // Crear usuario estilista
        User::create([ 
            'name' => 'Estilista',
            'email' => 'estilista@example.com',
            'password' => Hash::make('123456789'),
            'role_id' => $estilistRole->id,
        ]);
    }
}
