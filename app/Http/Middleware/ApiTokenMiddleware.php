<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Obter o token do header Authorization
        $authHeader = $request->header('Authorization');
        
        if (!$authHeader) {
            return response()->json([
                'error' => 'Token de autorização não fornecido',
                'message' => 'O header Authorization é obrigatório'
            ], 401);
        }

        // Verificar se o header está no formato correto (Bearer token)
        if (!str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'error' => 'Formato de token inválido',
                'message' => 'O token deve estar no formato: Bearer {token}'
            ], 401);
        }

        // Extrair o token (remover "Bearer " do início)
        $token = substr($authHeader, 7);
        
        if (empty($token)) {
            return response()->json([
                'error' => 'Token vazio',
                'message' => 'O token não pode estar vazio'
            ], 401);
        }

        // Verificar se o token é válido
        $validToken = config('app.api_token');
        
        if (!$validToken) {
            return response()->json([
                'error' => 'Configuração de token não encontrada',
                'message' => 'Token de API não configurado no sistema'
            ], 500);
        }

        if ($token !== $validToken) {
            return response()->json([
                'error' => 'Token inválido',
                'message' => 'O token fornecido não é válido'
            ], 401);
        }

        return $next($request);
    }
}
