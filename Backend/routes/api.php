<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\ClientController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ProductController;
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

// Inventario: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('products', ProductController::class);
});

// citas: accesibles a todos los roles autenticados
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('citas', AppointmentController::class);
});
