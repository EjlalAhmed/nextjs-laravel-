<?php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,127.0.0.1,127.0.0.1:3000,localhost:3000')),
    'guard' => ['web'],
    'expiration' => null,
    'token_prefix' => '',
    'middleware' => [
        'authenticate_session' => 'Laravel\\Sanctum\\Http\\Middleware\\EnsureFrontendRequestsAreStateful',
        'encrypt_cookies' => 'Illuminate\\Cookie\\Middleware\\EncryptCookies',
        'verify_csrf_token' => 'Illuminate\\Foundation\\Http\\Middleware\\VerifyCsrfToken',
    ],
    'providers' => [
        'users' => 'users',
    ],
];
