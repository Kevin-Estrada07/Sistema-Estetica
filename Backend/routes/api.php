<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\InventarioServicioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\ReembolsoController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TestimonioController;
use Illuminate\Http\Request;
use Carbon\Carbon;

// Conexión de prueba
Route::get('/conexion', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Conexión exitosa con el backend'
    ]);
});

// Endpoint para verificar fecha y hora del servidor
Route::get('/server-time', function () {
    $now = Carbon::now();
    return response()->json([
        'server_time' => $now->toDateTimeString(),
        'server_date' => $now->toDateString(),
        'server_hour' => $now->format('H:i:s'),
        'timezone' => config('app.timezone'),
        'timestamp' => $now->timestamp,
    ]);
});

// Login y logout
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Obtener info del usuario logueado
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user()->load('role');
});

// Rutas protegidas solo para admin
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/users', [AdminUserController::class, 'getAllUsers']);          // Listado de usuarios
    Route::post('/admin/register', [AdminUserController::class, 'registerUser']); // Registro de usuarios
    Route::delete('/users/{id}', [AdminUserController::class, 'deleteUser']); // Eliminar usuario
});

// Clientes: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('clients', ClientController::class);
    // Obtener historial del cliente (citas y ventas)
    Route::get('/clients/{id}/history', [ClientController::class, 'getHistory']);
});

// Servicios: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('services', ServiceController::class);
});

// Productos eliminados - ahora se usa inventario

// citas: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('citas', AppointmentController::class);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::put('/citas/{cita}/estado', [AppointmentController::class, 'updateEstado']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/info', [AppointmentController::class, 'InfTabla']);
}); 

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/empleados', [EmpleadoController::class, 'index']);
});

//Datos de Dashboard Inicio - Reportes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'dashboardStats']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/citas-completadas', [DashboardController::class, 'citasCompletadas']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/citas-canceladas', [DashboardController::class, 'citasCanceladas']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/ingresos-por-dia', [DashboardController::class, 'ingresosPorDia']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/citas-por-dia', [DashboardController::class, 'CitasPorDia']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/ingresos-por-servicio', [DashboardController::class, 'IngresosPorServicio']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/detalle-citas-dia', [DashboardController::class, 'DetalleCitasPorDia']);
});

// Nuevos reportes mejorados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/top-servicios', [DashboardController::class, 'topServicios']);
    Route::get('/dashboard/top-estilistas', [DashboardController::class, 'topEstilistas']);
    Route::get('/dashboard/ranking-servicios', [DashboardController::class, 'rankingServicios']);
    Route::get('/dashboard/productos-rotacion', [DashboardController::class, 'productosRotacion']);
    Route::get('/dashboard/productos-bajo-stock', [DashboardController::class, 'productosBajoStock']);
});

// Ventas: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('ventas', SaleController::class);
});

// Reembolsos: todos pueden crear y ver, solo admin puede aprobar/rechazar
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('reembolsos', ReembolsoController::class);
});

// Aprobar/Rechazar reembolsos: solo admin
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::patch('/reembolsos/{id}/estado', [ReembolsoController::class, 'updateEstado']);
});

// Inventario: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('inventario', InventarioController::class);
    Route::get('/inventario-bajo-stock', [InventarioController::class, 'bajoStock']);
});


Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/servicios/{id}/productos', [InventarioServicioController::class, 'attachProductos']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/servicios/{id}/productos', [InventarioServicioController::class, 'getProductos']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::delete('/servicios/{id}/productos', [InventarioServicioController::class, 'detachProducto']);
});

// Testimonios - Rutas públicas
Route::get('/testimonios', [TestimonioController::class, 'index']); // Todos los aprobados
Route::get('/testimonios/destacados', [TestimonioController::class, 'destacados']); // Solo destacados
Route::post('/testimonios', [TestimonioController::class, 'store']); // Crear nuevo (público)

// Testimonios - Rutas protegidas (admin)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/testimonios/todos', [TestimonioController::class, 'todos']); // Todos incluyendo no aprobados
    Route::patch('/testimonios/{id}/aprobar', [TestimonioController::class, 'aprobar']);
    Route::patch('/testimonios/{id}/destacar', [TestimonioController::class, 'destacar']);
    Route::delete('/testimonios/{id}', [TestimonioController::class, 'destroy']);
});
