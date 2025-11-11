<?php

namespace App\Http\Controllers;

use App\Models\Reembolso;
use App\Models\Venta;
use App\Models\Inventory;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReembolsoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reembolsos = Reembolso::with([
            'venta.cliente:id,nombre',
            'venta.detalles.servicio:id,nombre',
            'venta.detalles.producto:id,nombre',
            'solicitante:id,name',
            'autorizador:id,name'
        ])
            ->orderBy('fecha_solicitud', 'desc')
            ->get();

        return response()->json([
            'reembolsos' => $reembolsos,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'venta_id' => 'required|exists:ventas,id',
            'motivo' => 'required|string|min:10',
        ]);

        // Verificar que la venta no tenga ya un reembolso aprobado
        $reembolsoExistente = Reembolso::where('venta_id', $request->venta_id)
            ->where('estado', 'aprobado')
            ->first();

        if ($reembolsoExistente) {
            return response()->json([
                'message' => 'Esta venta ya tiene un reembolso aprobado'
            ], 422);
        }

        $venta = Venta::findOrFail($request->venta_id);

        $reembolso = Reembolso::create([
            'venta_id' => $request->venta_id,
            'solicitado_por' => auth()->id(),
            'monto' => $venta->total,
            'motivo' => $request->motivo,
            'estado' => 'pendiente',
            'fecha_solicitud' => now(),
        ]);

        $reembolso->load('venta.cliente', 'solicitante');

        return response()->json([
            'message' => 'Solicitud de reembolso creada. Pendiente de autorización del administrador.',
            'reembolso' => $reembolso,
        ], 201);
    }

    /**
     * Aprobar o rechazar un reembolso (solo admin)
     */
    public function updateEstado(Request $request, string $id)
    {
        $request->validate([
            'estado' => 'required|in:aprobado,rechazado',
            'comentario_admin' => 'nullable|string',
        ]);

        $reembolso = Reembolso::with('venta.detalles')->findOrFail($id);

        if ($reembolso->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Este reembolso ya fue procesado'
            ], 422);
        }

        return DB::transaction(function () use ($request, $reembolso) {
            // Si se aprueba, restaurar inventario
            if ($request->estado === 'aprobado') {
                foreach ($reembolso->venta->detalles as $detalle) {
                    // Restaurar productos vendidos directamente
                    if ($detalle->producto_id) {
                        $producto = Inventory::find($detalle->producto_id);
                        if ($producto) {
                            $producto->stock += $detalle->cantidad;
                            $producto->save();
                        }
                    }

                    // Restaurar productos usados en servicios
                    if ($detalle->servicio_id) {
                        $servicio = Service::with('inventario')->find($detalle->servicio_id);
                        if ($servicio) {
                            foreach ($servicio->inventario as $item) {
                                $cantidadUsada = $item->pivot->cant_usada * $detalle->cantidad;
                                $item->stock += $cantidadUsada;
                                $item->save();
                            }
                        }
                    }
                }
            }

            $reembolso->update([
                'estado' => $request->estado,
                'autorizado_por' => auth()->id(),
                'comentario_admin' => $request->comentario_admin,
                'fecha_respuesta' => now(),
            ]);

            $reembolso->load('venta.cliente', 'solicitante', 'autorizador');

            return response()->json([
                'message' => $request->estado === 'aprobado'
                    ? 'Reembolso aprobado e inventario restaurado'
                    : 'Reembolso rechazado',
                'reembolso' => $reembolso,
            ]);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $reembolso = Reembolso::with([
            'venta.cliente',
            'venta.detalles.servicio',
            'venta.detalles.producto',
            'solicitante',
            'autorizador'
        ])->findOrFail($id);

        return response()->json([
            'reembolso' => $reembolso,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $reembolso = Reembolso::findOrFail($id);

        if ($reembolso->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Solo se pueden eliminar reembolsos pendientes'
            ], 422);
        }

        $reembolso->delete();

        return response()->json([
            'message' => 'Solicitud de reembolso eliminada'
        ]);
    }
}
