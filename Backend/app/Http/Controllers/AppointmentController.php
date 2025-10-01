<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $appointments = Appointment::with(['cliente:id,nombre', 'servicio:id,nombre,precio', 'empleado:id,name'])
            ->orderBy('id', 'asc')
            ->get(); // 20 por página

        return response()->json($appointments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'servicio_id' => 'required|exists:servicios,id',
            'empleado_id' => 'required|exists:users,id',
            'fecha' => 'required|date',
            'hora' => 'required',
            'estado' => 'required|string|in:pendiente,en proceso,completada,cancelada',
            'notas' => 'nullable|string'
        ]);

        $appointment = Appointment::create($request->all());
        return response()->json($appointment, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $appointment = Appointment::with(['cliente', 'servicio', 'empleado'])
            ->findOrFail($id);

        return response()->json($appointment, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment  $cita)
    {

        // Mostrar datos recibidos
        // dd($request->all(), $appointment);

        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'servicio_id' => 'required|exists:servicios,id',
            'empleado_id' => 'required|exists:users,id',
            'fecha' => 'required|date',
            'hora' => 'required',
            'estado' => 'required|string|in:pendiente,en proceso,completada,cancelada',
            'notas' => 'nullable|string'
        ]);

        $cita->update($request->only([
            'cliente_id',
            'servicio_id',
            'empleado_id',
            'fecha',
            'hora',
            'estado',
            'notas'
        ]));

        return response()->json("actualizado", 200);
    }

    public function updateEstado(Request $request, Appointment $cita)
    {
        $request->validate([
            'estado' => 'required|string|in:pendiente,en proceso,completada,cancelada',
        ]);

        $cita->update(['estado' => $request->estado]);

        return response()->json([ 
            'message' => 'Estado de la cita actualizado',
            'cita' => $cita
        ], 200);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $cita)
    {
        $cita->delete();
        return response()->json(['message' => 'Cita eliminada']);
    }
}
