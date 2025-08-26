<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTokenMiddlewareTest extends TestCase
{
    /**
     * Testa se a requisição sem token retorna erro 401
     */
    public function test_request_without_token_returns_401(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(401)
                ->assertJson([
                    'error' => 'Token de autorização não fornecido',
                    'message' => 'O header Authorization é obrigatório'
                ]);
    }

    /**
     * Testa se a requisição com formato de token inválido retorna erro 401
     */
    public function test_request_with_invalid_token_format_returns_401(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'InvalidToken'
        ])->getJson('/api/health');

        $response->assertStatus(401)
                ->assertJson([
                    'error' => 'Formato de token inválido',
                    'message' => 'O token deve estar no formato: Bearer {token}'
                ]);
    }

    /**
     * Testa se a requisição com token vazio retorna erro 401
     */
    public function test_request_with_empty_token_returns_401(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '
        ])->getJson('/api/health');

        $response->assertStatus(401)
                ->assertJson([
                    'error' => 'Token vazio',
                    'message' => 'O token não pode estar vazio'
                ]);
    }

    /**
     * Testa se a requisição com token inválido retorna erro 401
     */
    public function test_request_with_invalid_token_returns_401(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid-token'
        ])->getJson('/api/health');

        $response->assertStatus(401)
                ->assertJson([
                    'error' => 'Token inválido',
                    'message' => 'O token fornecido não é válido'
                ]);
    }

    /**
     * Testa se a requisição com token válido retorna sucesso
     */
    public function test_request_with_valid_token_returns_success(): void
    {
        // Configurar o token válido para o teste
        config(['app.api_token' => 'test-valid-token']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer test-valid-token'
        ])->getJson('/api/health');

        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'ok'
                ]);
    }

    /**
     * Testa se todas as rotas da API estão protegidas
     */
    public function test_all_api_routes_are_protected(): void
    {
        $routes = [
            '/api/newClients',
            '/api/consultClients',
            '/api/process/statistics'
        ];

        foreach ($routes as $route) {
            $response = $this->getJson($route);
            $response->assertStatus(401);
        }
    }
}
