<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsurePartnerApproved
{
    public function handle(Request $request, Closure $next)
    {
        $u = $request->user();
        if ($u && $u->role === 'partner' && ($u->partner_status ?? 'pending') !== 'approved') {
            return response()->json([
                'message' => 'Partner account is not approved.',
                'status' => $u->partner_status ?? 'pending',
            ], 403);
        }
        return $next($request);
    }
}
