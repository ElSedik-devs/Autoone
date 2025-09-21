<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // keep this list tight; use env so you don't hard-code
    'allowed_origins' => array_filter([
        env('FRONTEND_URL'),         // e.g. https://your-frontend.up.railway.app
        env('FRONTEND_URL_ALT'),     // optional second domain
        'http://localhost:5173',
        'https://localhost:5173',
    ]),

    // if you prefer a pattern (e.g. any *.up.railway.app), use this instead:
    // 'allowed_origins_patterns' => ['#^https://.*\.up\.railway\.app$#'],
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // stay false if you use token/bearer auth. switch to true only for cookie-based auth
    'supports_credentials' => false,
];
