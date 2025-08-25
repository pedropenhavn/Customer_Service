<?php

namespace App\Providers;

use App\Services\ClientValidationService;
use App\Services\CnpjValidationService;
use App\Services\ViaCepService;
use App\Services\SintegraService;
use App\Services\CnpjWsService;
use Illuminate\Support\ServiceProvider;

class ValidationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(ClientValidationService::class);
        $this->app->singleton(CnpjValidationService::class);
        $this->app->singleton(ViaCepService::class);
        $this->app->singleton(SintegraService::class);
        $this->app->singleton(CnpjWsService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
