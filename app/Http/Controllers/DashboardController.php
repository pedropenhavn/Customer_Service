<?php

namespace App\Http\Controllers;

use App\Models\NewClient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Obter estatísticas gerais do dashboard
     */
    public function getStatistics(): JsonResponse
    {
        try {
            // Estatísticas por status
            $statusStats = NewClient::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->get()
                ->keyBy('status');

            // Total de clientes
            $totalClients = NewClient::count();

            // Clientes por origem
            $originStats = NewClient::select('origem', DB::raw('count(*) as total'))
                ->groupBy('origem')
                ->orderBy('total', 'desc')
                ->get();

            // Clientes por flag
            $flagStats = NewClient::select('flag', DB::raw('count(*) as total'))
                ->groupBy('flag')
                ->get()
                ->keyBy('flag');

            // Clientes dos últimos 7 dias
            $recentClients = NewClient::where('created_at', '>=', now()->subDays(7))
                ->count();

            // Clientes dos últimos 30 dias
            $monthlyClients = NewClient::where('created_at', '>=', now()->subDays(30))
                ->count();

            // Status com labels mais amigáveis
            $statusLabels = [
                'PEN' => 'Pendente',
                'PRO' => 'Processando',
                'ERR' => 'Erro',
                'RPV' => 'Reprovado',
                'APV' => 'Aprovado'
            ];

            // Preparar dados de status
            $formattedStatusStats = [];
            foreach ($statusLabels as $code => $label) {
                $count = $statusStats->get($code)?->total ?? 0;
                $percentage = $totalClients > 0 ? round(($count / $totalClients) * 100, 1) : 0;
                
                $formattedStatusStats[] = [
                    'code' => $code,
                    'label' => $label,
                    'count' => $count,
                    'percentage' => $percentage
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total_clients' => $totalClients,
                    'recent_clients_7d' => $recentClients,
                    'recent_clients_30d' => $monthlyClients,
                    'status_statistics' => $formattedStatusStats,
                    'origin_statistics' => $originStats,
                    'flag_statistics' => [
                        'flag_0' => $flagStats->get(0)?->total ?? 0,
                        'flag_1' => $flagStats->get(1)?->total ?? 0,
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter dados para gráficos
     */
    public function getChartData(Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            
            // Dados por dia dos últimos X dias
            $dailyData = NewClient::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as total'),
                'status'
            )
                ->where('created_at', '>=', now()->subDays($days))
                ->groupBy('date', 'status')
                ->orderBy('date')
                ->get();

            // Agrupar por data
            $chartData = [];
            foreach ($dailyData as $item) {
                $date = $item->date;
                if (!isset($chartData[$date])) {
                    $chartData[$date] = [
                        'date' => $date,
                        'PEN' => 0,
                        'PRO' => 0,
                        'ERR' => 0,
                        'RPV' => 0,
                        'APV' => 0,
                        'total' => 0
                    ];
                }
                $chartData[$date][$item->status] = $item->total;
                $chartData[$date]['total'] += $item->total;
            }

            // Converter para array
            $chartData = array_values($chartData);

            return response()->json([
                'success' => true,
                'data' => $chartData
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter clientes recentes
     */
    public function getRecentClients(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 10);
            
            $recentClients = NewClient::select('id', 'cnpj', 'status', 'origem', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $recentClients
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }
}
