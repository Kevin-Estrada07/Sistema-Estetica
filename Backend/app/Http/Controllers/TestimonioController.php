<?php

namespace App\Http\Controllers;

use App\Models\Testimonio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TestimonioController extends Controller
{
    /**
     * Obtener todos los testimonios aprobados (para la página pública)
     */
    public function index()
    {
        $testimonios = Testimonio::aprobados()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($testimonios);
    }

    /**
     * Obtener solo testimonios destacados
     */
    public function destacados()
    {
        $testimonios = Testimonio::destacados()
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        return response()->json($testimonios);
    }

    /**
     * Obtener todos los testimonios (para admin - incluye no aprobados)
     */
    public function todos()
    {
        $testimonios = Testimonio::orderBy('created_at', 'desc')->get();
        return response()->json($testimonios);
    }

    /**
     * Crear un nuevo testimonio
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'comentario' => 'required|string|max:1000',
            'calificacion' => 'required|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generar avatar aleatorio
        $avatarNumber = rand(1, 70);
        $avatar = "https://i.pravatar.cc/100?img={$avatarNumber}";

        $testimonio = Testimonio::create([
            'nombre' => $request->nombre,
            'comentario' => $request->comentario,
            'calificacion' => $request->calificacion,
            'avatar' => $avatar,
            'aprobado' => false, // Requiere aprobación del admin
            'destacado' => false,
        ]);

        return response()->json([
            'message' => 'Testimonio enviado. Será visible después de la aprobación.',
            'testimonio' => $testimonio
        ], 201);
    }

    /**
     * Aprobar un testimonio (solo admin)
     */
    public function aprobar($id)
    {
        $testimonio = Testimonio::findOrFail($id);
        $testimonio->aprobado = true;
        $testimonio->save();

        return response()->json([
            'message' => 'Testimonio aprobado',
            'testimonio' => $testimonio
        ]);
    }

    /**
     * Marcar como destacado (solo admin)
     */
    public function destacar($id)
    {
        $testimonio = Testimonio::findOrFail($id);
        $testimonio->destacado = !$testimonio->destacado;
        $testimonio->save();

        return response()->json([
            'message' => $testimonio->destacado ? 'Testimonio marcado como destacado' : 'Testimonio desmarcado',
            'testimonio' => $testimonio
        ]);
    }

    /**
     * Eliminar un testimonio
     */
    public function destroy($id)
    {
        $testimonio = Testimonio::findOrFail($id);
        $testimonio->delete();

        return response()->json([
            'message' => 'Testimonio eliminado'
        ]);
    }
}

