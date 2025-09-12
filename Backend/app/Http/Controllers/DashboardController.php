<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;

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
                'servicios' => Service::count(), // 👈 ajusta según tu tabla
            ]
        ]);
    }
}
