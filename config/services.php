<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | External APIs Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for external APIs used by the application.
    |
    */

    'sintegra' => [
        'api_key' => env('SINTEGRA_API_KEY'),
        'api_url' => env('SINTEGRA_API_URL', 'https://api.sintegrapi.com.br/consultas/v2/cnpj-receita-federal/'),
    ],

    'cnpj_ws' => [
        'api_key' => env('CNPJ_WS_API_KEY'),
        'api_uri' => env('CNPJ_WS_URI', 'https://comercial.cnpj.ws/cnpj/'),
    ],

    'viacep' => [
        'api_url' => 'https://viacep.com.br/ws/',
    ],

];
