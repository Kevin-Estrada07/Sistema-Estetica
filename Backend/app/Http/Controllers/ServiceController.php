<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $services = Service::with('inventario')->orderBy('id', 'asc')->get();
        return response()->json($services);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|String',
            'duracion' => 'required|integer|min:1',
            'precio' => 'required|numeric|min:0.01',
            'activo' => 'boolean',
        ], [
            'duracion.min' => 'La duración debe ser al menos 1 minuto',
            'precio.min' => 'El precio debe ser mayor a 0',
        ]);
        $service = Service::create($request->all());
        return response()->json($service, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $service = Service::findOrFail($id);
        return response()->json($service, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Service $service)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'duracion' => 'required|integer|min:1',
            'precio' => 'required|numeric|min:0.01',
            'activo' => 'boolean',
        ], [
            'duracion.min' => 'La duración debe ser al menos 1 minuto',
            'precio.min' => 'El precio debe ser mayor a 0',
        ]);
        $service->update($request->all());
        return response()->json($service, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service)
    {
        $service->delete();
        return response()->json(['message' => 'Servicio Eliminado'], 200);
    }
}
