<?php

namespace App\Http\Controllers;

use App\Models\DetalleVenta;
use App\Models\Inventory;
use App\Models\Service;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ventas = Venta::with([
            'cliente:id,nombre',
            'usuario:id,name',
            'detalles' => function ($query) {
                $query->select('id', 'venta_id', 'servicio_id', 'producto_id', 'cantidad', 'precio_unitario', 'subtotal')
                    ->with([
                        'servicio:id,nombre,precio',
                        'producto:id,nombre,precio'
                    ]);
            },
            'reembolsos' => function ($query) {
                $query->select('id', 'venta_id', 'estado', 'monto', 'fecha_solicitud', 'fecha_respuesta')
                    ->orderBy('created_at', 'desc');
            }
        ])
            ->orderBy('fecha', 'desc')
            ->get([
                'id',
                'cliente_id',
                'usuario_id',
                'subtotal',
                'descuento_porcentaje',
                'descuento_monto',
                'impuesto_porcentaje',
                'impuesto_monto',
                'total',
                'metodo_pago',
                'fecha'
            ]);

        // Calcular el total real descontando reembolsos aprobados
        $ventas->each(function ($venta) {
            $reembolsoAprobado = $venta->reembolsos->firstWhere('estado', 'aprobado');
            if ($reembolsoAprobado) {
                $venta->total_original = $venta->total;
                $venta->total = 0; // Si hay reembolso aprobado, el total es 0
                $venta->reembolsado = true;
            } else {
                $venta->reembolsado = false;
            }
        });

        return response()->json([
            'ventas' => $ventas,
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar datos mínimos
        $request->validate([
            'cliente_id'   => 'required|integer|exists:clientes,id',
            'usuario_id'   => 'required|integer|exists:users,id',
            'metodo_pago'  => 'required|string',
            'detalles'     => 'required|array|min:1',
            'detalles.*.cantidad' => 'required|numeric|min:1',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
            'subtotal'     => 'required|numeric|min:0',
            'descuento_porcentaje' => 'nullable|numeric|min:0|max:100',
            'descuento_monto' => 'nullable|numeric|min:0',
            'impuesto_porcentaje' => 'nullable|numeric|min:0|max:100',
            'impuesto_monto' => 'nullable|numeric|min:0',
            'total'        => 'required|numeric|min:0',
        ]);

        // Asegurar que haya al menos un servicio o producto válido
        $tieneServicio = collect($request->detalles)->contains(function ($d) {
            return !empty($d['servicio_id']);
        });
        $tieneProducto = collect($request->detalles)->contains(function ($d) {
            return !empty($d['producto_id']);
        });

        if (!$tieneServicio && !$tieneProducto) {
            return response()->json([
                'message' => 'Debe seleccionar al menos un servicio o producto para realizar la venta.',
            ], 422);
        }

        // Si pasa la validación, continuar con la transacción
        return DB::transaction(function () use ($request) {
            $venta = Venta::create([
                'cliente_id'   => $request->cliente_id,
                'usuario_id'   => $request->usuario_id,
                'subtotal'     => $request->subtotal ?? 0,
                'descuento_porcentaje' => $request->descuento_porcentaje ?? 0,
                'descuento_monto' => $request->descuento_monto ?? 0,
                'impuesto_porcentaje' => $request->impuesto_porcentaje ?? 0,
                'impuesto_monto' => $request->impuesto_monto ?? 0,
                'total'        => $request->total,
                'metodo_pago'  => $request->metodo_pago,
                'fecha'        => now(),
            ]);

            foreach ($request->detalles as $d) {
                DetalleVenta::create([
                    'venta_id'        => $venta->id,
                    'servicio_id'     => $d['servicio_id'],
                    'producto_id'     => $d['producto_id'],
                    'cantidad'        => $d['cantidad'],
                    'precio_unitario' => $d['precio_unitario'],
                    'subtotal'        => $d['subtotal'],
                ]);

                // Si es un producto, descontar inventario
                if (!empty($d['producto_id'])) {
                    $producto = \App\Models\Inventory::find($d['producto_id']);
                    if ($producto) {
                        $producto->stock = max(0, $producto->stock - $d['cantidad']);
                        $producto->save();
                    }
                }

                // Descontar productos usados en el servicio
                if (!empty($d['servicio_id'])) {
                    $servicio = Service::with('inventario')->find($d['servicio_id']);
                    if ($servicio) {
                        foreach ($servicio->inventario as $item) {
                            $cantidadUsada = $item->pivot->cant_usada * $d['cantidad'];
                            $item->stock = max(0, $item->stock - $cantidadUsada);
                            $item->save();
                        }
                    }
                }
            }

            $venta->load('cliente', 'usuario', 'detalles.servicio', 'detalles.producto');

            return response()->json([
                'message' => 'Venta registrada correctamente y productos del servicio descontados',
                'venta'   => $venta,
            ]);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $venta = Venta::with([
            'cliente:id,nombre',
            'usuario:id,name',
            'detalles' => function ($query) {
                $query->select('id', 'venta_id', 'servicio_id', 'producto_id', 'cantidad', 'precio_unitario', 'subtotal')
                    ->with([
                        'servicio:id,nombre,precio',
                        'producto:id,nombre,precio'
                    ]);
            }
        ])
            ->select([
                'id',
                'cliente_id',
                'usuario_id',
                'subtotal',
                'descuento_porcentaje',
                'descuento_monto',
                'impuesto_porcentaje',
                'impuesto_monto',
                'total',
                'metodo_pago',
                'fecha'
            ])
            ->findOrFail($id);

        return response()->json([
            'venta' => $venta,
        ]);
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
