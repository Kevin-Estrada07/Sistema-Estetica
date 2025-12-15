<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;

class InventarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $Inventory = Inventory::orderBy('id', 'asc')->get();
        return response()->json($Inventory);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'precio' => 'required|numeric|min:0',
            'tipo' => 'required|in:venta,servicio,ambos',
        ], [
            'nombre.required' => 'El nombre es requerido',
            'stock.required' => 'El stock es requerido',
            'stock.min' => 'El stock no puede ser negativo',
            'precio.required' => 'El precio es requerido',
            'precio.min' => 'El precio no puede ser negativo',
            'tipo.required' => 'El tipo es requerido',
            'tipo.in' => 'El tipo debe ser: venta, servicio o ambos',
        ]);

        $Inventory = Inventory::create($validated);
        return response()->json($Inventory, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $Inventory = Inventory::find($id);
        return response()->json($Inventory);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'precio' => 'required|numeric|min:0',
            'tipo' => 'required|in:venta,servicio,ambos',
        ], [
            'nombre.required' => 'El nombre es requerido',
            'stock.required' => 'El stock es requerido',
            'stock.min' => 'El stock no puede ser negativo',
            'precio.required' => 'El precio es requerido',
            'precio.min' => 'El precio no puede ser negativo',
            'tipo.required' => 'El tipo es requerido',
            'tipo.in' => 'El tipo debe ser: venta, servicio o ambos',
        ]);

        $inventory = Inventory::findOrFail($id);
        $inventory->update($validated);

        return response()->json($inventory, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $inventory = Inventory::findOrFail($id); 
        $inventory->delete();

        return response()->json(['message' => 'Producto eliminado del inventario'], 200);
    }

    /**
     * Get products below stock threshold
     */
    public function bajoStock(Request $request)
    {
        $umbral = $request->query('umbral', 10); // Umbral por defecto: 10

        $productosBajoStock = Inventory::where('stock', '<=', $umbral)
            ->orderBy('stock', 'asc')
            ->get();

        return response()->json([
            'productos' => $productosBajoStock,
            'total' => $productosBajoStock->count(),
            'umbral' => $umbral
        ]);
        
    }
}
