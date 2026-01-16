<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Appointment;
use App\Models\Venta;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $client = Client::orderBy('id', 'asc')->get();
        return response()->json($client);
    } 
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'telefono' => 'nullable|string|max:20|unique:clientes,telefono',
                'email' => 'required|email|unique:clientes,email',
                'direccion' => 'required|string|max:255',
            ]);

            $client = Client::create($validated);
            return response()->json([
                'success' => true,
                'message' => 'Cliente registrado exitosamente',
                'data' => $client
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $client = Client::findOrFail($id);
        return response()->json($client, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'telefono' => "nullable|string|max:20|unique:clientes,telefono,{$client->id}",
                'email' => "nullable|email|unique:clientes,email,{$client->id}",
                'direccion' => 'required|string|max:255',
            ]);

            $client->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Cliente actualizado exitosamente',
                'data' => $client
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();
        return response()->json(['message' => 'Cliente eliminado']);
    }

    /**
     * Obtener historial del cliente (citas y ventas)
     */
    public function getHistory($id)
    {
        try {
            $client = Client::findOrFail($id);

            // Obtener citas del cliente con relaciones
            $citas = Appointment::where('cliente_id', $id)
                ->with([
                    'servicio:id,nombre,precio,duracion',
                    'empleado:id,name'
                ])
                ->select('id', 'cliente_id', 'servicio_id', 'empleado_id', 'fecha', 'hora', 'estado', 'notas')
                ->orderBy('fecha', 'desc')
                ->get();

            // Obtener ventas del cliente con detalles
            $ventas = Venta::where('cliente_id', $id)
                ->with([
                    'usuario:id,name',
                    'detalles.servicio:id,nombre,precio',
                    'detalles.producto:id,nombre,precio'
                ])
                ->select('id', 'cliente_id', 'usuario_id', 'total', 'metodo_pago', 'fecha')
                ->orderBy('fecha', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'cliente' => $client,
                'citas' => $citas,
                'ventas' => $ventas,
                'total_citas' => $citas->count(),
                'total_ventas' => $ventas->count(),
                'monto_total' => $ventas->sum('total'),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial del cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
