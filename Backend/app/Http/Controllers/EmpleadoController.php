<?php


namespace App\Http\Controllers;

use App\Models\User;


use Illuminate\Http\Request;

class EmpleadoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        // Solo admin o recepcionista pueden ver empleados
        if (!in_array($user->role->name, ['admin', 'Recepcionista'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Filtrar por rol estilista (ajusta si tu tabla se llama roles o role)
        $empleados = User::whereHas('role', function ($q) {
            $q->where('name', 'Estilista');
        })->get(['id', 'name']);

        return response()->json($empleados);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
