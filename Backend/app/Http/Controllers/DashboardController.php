<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function dashboardStats()
    {
        $hoy = Carbon::today()->toDateString();

        return response()->json([
            'success' => true,
            'stats' => [
                'citasHoy' => Appointment::whereDate('fecha', $hoy)->count(),
                'clientes' => Client::count(),
                'servicios' => Service::count(),
            ]
        ]);
    }

    public function ingresosPorDia(Request $request)
    {
        $inicio = $request->input('inicio') ?? Carbon::today()->startOfMonth()->toDateString();
        $fin = $request->input('fin') ?? Carbon::today()->toDateString();

        // Validar fechas
        if (!strtotime($inicio) || !strtotime($fin)) {
            return response()->json(['success' => false, 'message' => 'Fechas inválidas'], 400);
        }

        // Obtener ingresos de la tabla ventas
        $ventas = DB::table('ventas')
            ->select(DB::raw('DATE(fecha) as dia'), DB::raw('SUM(total) as total'))
            ->whereDate('fecha', '>=', $inicio)
            ->whereDate('fecha', '<=', $fin)
            ->groupBy('dia')
            ->orderBy('dia', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'ingresosPorDia' => $ventas
        ]);
    }

    public function CitasPorDia(Request $request)
    {
        $inicio = $request->input('inicio') ?? Carbon::today()->startOfMonth()->toDateString();
        $fin = $request->input('fin') ?? Carbon::today()->toDateString();

        // Validar fechas
        if (!strtotime($inicio) || !strtotime($fin)) {
            return response()->json(['success' => false, 'message' => 'Fechas inválidas'], 400);
        }

        // Contar TODAS las citas por día (sin importar estado)
        $citas = DB::table('citas')
            ->select(DB::raw('DATE(fecha) as dia'), DB::raw('COUNT(*) as total'))
            ->whereDate('fecha', '>=', $inicio)
            ->whereDate('fecha', '<=', $fin)
            ->groupBy('dia')
            ->orderBy('dia', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'citasPorDia' => $citas
        ]);
    }

    public function citasCompletadas(Request $request)
    {
        $inicio = $request->input('inicio') ?? Carbon::today()->startOfMonth()->toDateString();
        $fin = $request->input('fin') ?? Carbon::today()->toDateString();

        // Validar fechas
        if (!strtotime($inicio) || !strtotime($fin)) {
            return response()->json(['success' => false, 'message' => 'Fechas inválidas'], 400);
        }

        // Contar citas completadas en el rango
        $totalCompletadas = DB::table('citas')
            ->whereDate('fecha', '>=', $inicio)
            ->whereDate('fecha', '<=', $fin)
            ->where('estado', 'completada')
            ->count();

        return response()->json([
            'success' => true,
            'totalCompletadas' => $totalCompletadas
        ]);
    }


    public function citasCanceladas(Request $request)
    {
        $inicio = $request->input('inicio') ?? Carbon::today()->startOfMonth()->toDateString();
        $fin = $request->input('fin') ?? Carbon::today()->toDateString();

        // Validar fechas
        if (!strtotime($inicio) || !strtotime($fin)) {
            return response()->json(['success' => false, 'message' => 'Fechas inválidas'], 400);
        }

        // Contar citas completadas en el rango
        $totalCompletadas = DB::table('citas')
            ->whereDate('fecha', '>=', $inicio)
            ->whereDate('fecha', '<=', $fin)
            ->where('estado', 'cancelada')
            ->count();

        return response()->json([
            'success' => true,
            'totalCanceladas' => $totalCompletadas
        ]);
    }

    public function IngresosPorServicio(Request $request)
    {
        $inicio = $request->input('inicio') ?? Carbon::today()->startOfMonth()->toDateString();
        $fin = $request->input('fin') ?? Carbon::today()->toDateString();

        if (!strtotime($inicio) || !strtotime($fin)) {
            return response()->json(['success' => false, 'message' => 'Fechas inválidas'], 400);
        }

        $ingresos = DB::table('detalle_ventas')
            ->join('ventas', 'detalle_ventas.venta_id', '=', 'ventas.id')
            ->join('servicios', 'detalle_ventas.servicio_id', '=', 'servicios.id')
            ->select('servicios.nombre', DB::raw('SUM(detalle_ventas.subtotal) as total'))
            ->whereDate('ventas.fecha', '>=', $inicio)
            ->whereDate('ventas.fecha', '<=', $fin)
            ->groupBy('servicios.nombre')
            ->orderBy('total', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'ingresosPorServicio' => $ingresos
        ]);
    }

    public function DetalleCitasPorDia(Request $request)
    {
        $inicio = $request->input('inicio');
        $fin = $request->input('fin');

        $ultimas = DB::table('citas')
            ->join('clientes', 'citas.cliente_id', '=', 'clientes.id')
            ->join('servicios', 'citas.servicio_id', '=', 'servicios.id')
            ->join('users', 'citas.empleado_id', '=', 'users.id')
            ->select(
                'citas.id',
                'clientes.nombre as clientes',
                'servicios.nombre as servicios',
                'users.name as users',
                'citas.fecha',
                'citas.estado',
                'servicios.precio as servicio_precio'
            )
            ->whereBetween('citas.fecha', [$inicio, $fin])
            ->orderBy('citas.fecha', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'ultimasCitas' => $ultimas
        ]);
    }

    // ============================================
    // NUEVOS REPORTES MEJORADOS
    // ============================================

    public function topServicios(Request $request)
    {
        $inicio = $request->input('inicio') ?? Carbon::today()->startOfMonth()->toDateString();
        $fin = $request->input('fin') ?? Carbon::today()->toDateString();
        $limit = $request->input('limit', 10);

        // Cache key basado en parámetros
        $cacheKey = "top_servicios_{$inicio}_{$fin}_{$limit}";

        $topServicios = Cache::remember($cacheKey, 3600, function () use ($inicio, $fin, $limit) {
            return DB::table('citas')
                ->join('servicios', 'citas.servicio_id', '=', 'servicios.id')
                ->select(
                    'servicios.nombre',
                    DB::raw('COUNT(citas.id) as total_citas'),
                    DB::raw('SUM(servicios.precio) as monto_total'),
                    'servicios.precio'
                )
                ->whereDate('citas.fecha', '>=', $inicio)
                ->whereDate('citas.fecha', '<=', $fin)
                ->where('citas.estado', 'completada')
                ->groupBy('servicios.id', 'servicios.nombre', 'servicios.precio')
                ->orderBy('total_citas', 'desc')
                ->limit($limit)
                ->get();
        });

        return response()->json([
            'success' => true,
            'topServicios' => $topServicios
        ]);
    }

    public function topEstilistas(Request $request)
    {
        $inicio = $request->input('inicio') ?? Carbon::today()->startOfMonth()->toDateString();
        $fin = $request->input('fin') ?? Carbon::today()->toDateString();
        $limit = $request->input('limit', 10);

        // Cache key basado en parámetros
        $cacheKey = "top_estilistas_{$inicio}_{$fin}_{$limit}";

        $topEstilistas = Cache::remember($cacheKey, 3600, function () use ($inicio, $fin, $limit) {
            return DB::table('citas')
                ->join('users', 'citas.empleado_id', '=', 'users.id')
                ->join('servicios', 'citas.servicio_id', '=', 'servicios.id')
                ->select(
                    'users.name',
                    'users.id',
                    DB::raw('COUNT(citas.id) as total_citas'),
                    DB::raw('SUM(servicios.precio) as monto_total')
                )
                ->whereDate('citas.fecha', '>=', $inicio)
                ->whereDate('citas.fecha', '<=', $fin)
                ->where('citas.estado', 'completada')
                ->groupBy('users.id', 'users.name')
                ->orderBy('total_citas', 'desc')
                ->limit($limit)
                ->get();
        });

        return response()->json([
            'success' => true,
            'topEstilistas' => $topEstilistas
        ]);
    }

    public function rankingServicios(Request $request)
    {
        $inicio = $request->input('inicio') ?? Carbon::today()->startOfMonth()->toDateString();
        $fin = $request->input('fin') ?? Carbon::today()->toDateString();

        // Ranking por conteo
        $rankingConteo = DB::table('citas')
            ->join('servicios', 'citas.servicio_id', '=', 'servicios.id')
            ->select(
                'servicios.nombre',
                DB::raw('COUNT(citas.id) as total_citas'),
                DB::raw('SUM(servicios.precio) as monto_total')
            )
            ->whereDate('citas.fecha', '>=', $inicio)
            ->whereDate('citas.fecha', '<=', $fin)
            ->where('citas.estado', 'completada')
            ->groupBy('servicios.id', 'servicios.nombre')
            ->orderBy('total_citas', 'desc')
            ->get();

        // Ranking por monto
        $rankingMonto = DB::table('citas')
            ->join('servicios', 'citas.servicio_id', '=', 'servicios.id')
            ->select(
                'servicios.nombre',
                DB::raw('COUNT(citas.id) as total_citas'),
                DB::raw('SUM(servicios.precio) as monto_total')
            )
            ->whereDate('citas.fecha', '>=', $inicio)
            ->whereDate('citas.fecha', '<=', $fin)
            ->where('citas.estado', 'completada')
            ->groupBy('servicios.id', 'servicios.nombre')
            ->orderBy('monto_total', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'rankingConteo' => $rankingConteo,
            'rankingMonto' => $rankingMonto
        ]);
    }

    public function productosRotacion(Request $request)
    {
        // Productos con rotación (usados en servicios)
        $productosRotacion = DB::table('prod_servicio')
            ->join('inventario', 'prod_servicio.inventario_id', '=', 'inventario.id')
            ->select(
                'inventario.id',
                'inventario.nombre',
                'inventario.stock',
                'inventario.precio',
                DB::raw('SUM(prod_servicio.cant_usada) as cantidad_usada'),
                DB::raw('COUNT(DISTINCT prod_servicio.servicio_id) as servicios_asociados')
            )
            ->groupBy('inventario.id', 'inventario.nombre', 'inventario.stock', 'inventario.precio')
            ->orderBy('cantidad_usada', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'productosRotacion' => $productosRotacion
        ]);
    }

    public function productosBajoStock(Request $request)
    {
        $umbral = $request->input('umbral', 10);

        // Cache key basado en umbral
        $cacheKey = "productos_bajo_stock_{$umbral}";

        // Reducido a 5 minutos (300 segundos) para actualizaciones más rápidas
        $productosBajoStock = Cache::remember($cacheKey, 300, function () use ($umbral) {
            return DB::table('inventario')
                ->select(
                    'id',
                    'nombre',
                    'stock',
                    'precio',
                    DB::raw('(stock * precio) as valor_total')
                )
                ->where('stock', '<=', $umbral)
                ->orderBy('stock', 'asc')
                ->get();
        });

        return response()->json([
            'success' => true,
            'productosBajoStock' => $productosBajoStock,
            'umbral' => $umbral
        ]);
    }
}
