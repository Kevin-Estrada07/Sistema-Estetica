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
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\ServiceController;
use Illuminate\Http\Request;

// Conexión de prueba
Route::get('/conexion', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Conexión exitosa con el backend'
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
});

// Servicios: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('services', ServiceController::class);
});

// Productos: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('products', ProductController::class);
});

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

// Ventas: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('ventas', SaleController::class);
});

// Ventas: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('inventario', InventarioController::class);
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

// Route::post('/servicios/{id}/productos', [InventarioServicioController::class, 'attachProductos']);
// Route::get('/servicios/{id}/productos', [InventarioServicioController::class, 'getProductos']);
// Route::delete('/servicios/{id}/productos/{inventario_id}', [InventarioServicioController::class, 'detachProducto']);
