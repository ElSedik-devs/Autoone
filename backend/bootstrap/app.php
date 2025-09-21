<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',   // ← add this line
        // commands: __DIR__ . '/../routes/console.php', // optional
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
          // Add this alias so you can use 'partner.approved' in routes
        $middleware->alias([
            'partner.approved' => \App\Http\Middleware\EnsurePartnerApproved::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
