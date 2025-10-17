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
        $request->validate([
            'nombre' => 'required|string|max:255',
            'stock' => 'required|integer',
            'precio' => 'required|numeric',
        ]);
        $Inventory = Inventory::create($request->all());
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
        $request->validate([
            'nombre' => 'required|string|max:255',
            'stock' => 'required|integer',
            'precio' => 'required|numeric',
        ]);

        $inventory = Inventory::findOrFail($id);
        $inventory->update($request->all());

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
}
