<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'fecha' => 'required|date|after_or_equal:today',
            'hora' => 'required|date_format:H:i',
            'estado' => 'required|string|in:pendiente,en proceso,completada,cancelada',
            'notas' => 'nullable|string'
        ]);

        // Definir $fechaHoraCita antes de usarla
        $fechaHoraCita = Carbon::parse($request->fecha . ' ' . $request->hora);

        if ($fechaHoraCita->isPast()) {
            return response()->json([
                'message' => 'No se puede registrar una cita en una fecha u hora que ya pasó.'
            ], 422);
        }

        // Verificar traslapes
        $traslape = $this->verificarTraslapes(
            $request->fecha,
            $request->hora,
            $request->empleado_id,
            $request->cliente_id,
            $request->servicio_id
        );

        if ($traslape) {
            return response()->json([
                'message' => $traslape
            ], 422);
        }

        $appointment = Appointment::create($request->all());
        $appointment->load('cliente', 'servicio', 'empleado');

        return response()->json([
            'message' => 'Cita creada exitosamente',
            'data' => $appointment
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $cita)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'servicio_id' => 'required|exists:servicios,id',
            'empleado_id' => 'required|exists:users,id',
            'fecha' => 'required|date|after_or_equal:today',
            'hora' => 'required|date_format:H:i',
            'estado' => 'required|string|in:pendiente,en proceso,completada,cancelada',
            'notas' => 'nullable|string'
        ]);

        // verificación de fecha/hora pasada
        $fechaHoraCita = Carbon::parse($request->fecha . ' ' . $request->hora);

        if ($fechaHoraCita->isPast()) {
            return response()->json([
                'message' => 'No se puede actualizar a una fecha u hora que ya pasó.'
            ], 422);
        }

        // Verificar traslapes (excluyendo la cita actual)
        $traslape = $this->verificarTraslapes(
            $request->fecha,
            $request->hora,
            $request->empleado_id,
            $request->cliente_id,
            $request->servicio_id,
            $cita->id 
        );

        if ($traslape) {
            return response()->json([
                'message' => $traslape
            ], 422);
        }

        // Actualizar la cita
        $cita->update($request->only([
            'cliente_id',
            'servicio_id',
            'empleado_id',
            'fecha',
            'hora',
            'estado',
            'notas'
        ]));

        $cita->load('cliente', 'servicio', 'empleado');

        return response()->json([
            'message' => 'Cita actualizada exitosamente',
            'data' => $cita
        ], 200);
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

    public function InfTabla()
    {
        try {
            $appointments = Appointment::with(['cliente', 'servicio', 'empleado'])->orderBy('id', 'asc')->get();

            $data = $appointments->map(function ($a) {
                return [
                    'id' => $a->id,
                    'cliente_id' => $a->cliente_id,
                    'servicio_id' => $a->servicio_id,
                    'empleado_id' => $a->empleado_id,
                    'cliente' => $a->cliente->nombre ?? null,
                    'servicio' => $a->servicio->nombre ?? null,
                    'empleado' => $a->empleado->name ?? null,
                    'fecha' => $a->fecha,
                    'hora' => $a->hora,
                    'estado' => $a->estado,
                    'notas' => $a->notas,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener citas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Verificar si ahi traslapes de horarios
    private function verificarTraslapes($fecha, $hora, $empleadoId, $clienteId, $servicioId, $citaIdExcluir = null)
    {
        // Obtener duración del servicio
        $servicio = Service::find($servicioId);

        if (!$servicio || !$servicio->duracion) {
            return 'El servicio no tiene una duración definida';
        }

        // Calcular inicio y fin de la nueva/actualizada cita
        $nuevaInicio = Carbon::parse($fecha . ' ' . $hora);
        $nuevaFin = $nuevaInicio->copy()->addMinutes($servicio->duracion);

        // Verificar traslape con citas del empleado
        $traslapeEmpleado = $this->existeTraslape(
            $fecha,
            $empleadoId,
            'empleado_id',
            $nuevaInicio,
            $nuevaFin,
            $citaIdExcluir
        );

        if ($traslapeEmpleado) {
            return 'El empleado ya tiene una cita programada que se traslapa con este horario.';
        }

        // Verificar traslape con citas del cliente
        $traslapeCliente = $this->existeTraslape(
            $fecha,
            $clienteId,
            'cliente_id',
            $nuevaInicio,
            $nuevaFin,
            $citaIdExcluir
        );

        if ($traslapeCliente) {
            return 'El cliente ya tiene una cita programada que se traslapa con este horario.';
        }

        return null; // Sin traslapes
    }


    // verificar si existe traslape con citas existentes
    private function existeTraslape($fecha, $personaId, $campo, Carbon $nuevaInicio, Carbon $nuevaFin, $citaIdExcluir = null)
    {
        $citas = Appointment::where('fecha', $fecha)
            ->where($campo, $personaId)
            ->whereIn('estado', ['pendiente', 'en proceso'])
            ->when($citaIdExcluir, function ($query) use ($citaIdExcluir) {
                $query->where('id', '!=', $citaIdExcluir);
            })
            ->with('servicio')
            ->get();

        foreach ($citas as $cita) {
            if (!$cita->servicio || !$cita->servicio->duracion) {
                continue;
            }

            $citaInicio = Carbon::parse($cita->fecha . ' ' . $cita->hora);
            $citaFin = $citaInicio->copy()->addMinutes($cita->servicio->duracion);

            if ($nuevaInicio->lt($citaFin) && $nuevaFin->gt($citaInicio)) {
                return true;
            }
        }

        return false;
    }
}
