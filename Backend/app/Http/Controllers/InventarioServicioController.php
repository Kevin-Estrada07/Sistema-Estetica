<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class InventarioServicioController extends Controller
{
    // Asignar productos (inventario) a un servicio
    public function attachProductos(Request $request, $servicio_id)
    {
        $request->validate([
            'productos' => 'array',
            'productos.*.inventario_id' => 'exists:inventario,id',
            'productos.*.cant_usada' => 'integer',
        ]);

        $servicio = Service::findOrFail($servicio_id);

        $productos = [];
        foreach ($request->productos as $producto) {
            $productos[$producto['inventario_id']] = ['cant_usada' => $producto['cant_usada']];
        }
 
        $servicio->inventario()->syncWithoutDetaching($productos);

        return response()->json(['message' => 'Productos asignados al servicio correctamente']);
    }
    // Obtener productos de un servicio
    public function getProductos($servicio_id)
    {
        $servicio = Service::with('inventario')->findOrFail($servicio_id);
        return response()->json($servicio->inventario);
    }

    // Eliminar producto de un servicio
    public function detachProducto($servicio_id, $inventario_id)
    {
        $servicio = Service::findOrFail($servicio_id);
        $servicio->inventario()->detach($inventario_id);

        return response()->json(['message' => 'Producto eliminado del servicio']);
    }
}
