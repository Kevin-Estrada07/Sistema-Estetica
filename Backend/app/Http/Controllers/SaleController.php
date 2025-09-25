<?php

namespace App\Http\Controllers;

use App\Models\DetalleVenta;
use App\Models\Product;
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
            'cliente',
            'usuario',
            'detalles.servicio',
            'detalles.producto'
        ])->orderBy('fecha', 'desc')->get();

        return response()->json($ventas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $venta = Venta::create([
                'cliente_id'   => $request->cliente_id,
                'usuario_id'   => $request->usuario_id,
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

                // Si es un producto, descontar del inventario
                $producto = Product::find($d['producto_id']);
                if ($producto) {
                    $producto->cantidad = max(0, $producto->cantidad - $d['cantidad']);
                    $producto->save();
                }
            }

            $venta->load('cliente', 'usuario', 'detalles.servicio', 'detalles.producto');

            // return response()->json($venta);

            return response()->json([
                'message' => 'Venta registrada correctamente',
                'venta'   => $venta,
            ]);
        });
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
