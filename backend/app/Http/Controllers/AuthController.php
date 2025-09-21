<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'accessToken' => $token,
            'refreshToken' => null,
            'user' => [
    'id' => $user->id,
    'name' => $user->name,
    'email' => $user->email,
    'role' => $user->role,
    'partner_status' => $user->partner_status, // <-- add
]
        ]);
    }
    public function updateMe(Request $request) {
    $data = $request->validate([
        'name' => ['sometimes','string','max:255'],
        'preferred_language' => ['sometimes','string','in:en,de,ar'],
    ]);
    $user = $request->user();
    $user->fill($data)->save();

    return response()->json($user->only('id','name','email','role','preferred_language'));
}
    public function me(Request $request)
    {
        return $request->user();
    }
    public function register(Request $request)
{
    $data = $request->validate([
        'name' => ['required','string','max:255'],
        'email' => ['required','email','max:255','unique:users,email'],
        'password' => ['required','string','min:6'],
    ]);

    $user = User::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => Hash::make($data['password']),
        'role' => 'user', // new signups are normal users
    ]);

    $token = $user->createToken('web')->plainTextToken;

    return response()->json([
        'accessToken' => $token,
        'refreshToken' => null,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            // 'preferred_language' => $user->preferred_language,
        ],
    ]);
}
public function forgot(Request $request)
{
    $request->validate(['email' => ['required','email']]);

    // Always respond success (do not reveal account existence)
    $user = User::where('email', $request->email)->first();
    if ($user) {
        $token = Password::createToken($user);

        $url = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/')
             . '/reset-password?token=' . urlencode($token)
             . '&email=' . urlencode($user->email);

        // For dev: log the URL so you can grab it from storage/logs/laravel.log
        Log::info('Password reset link', ['url' => $url]);

        // If you want to also send mail via log driver, you could use:
        // Password::sendResetLink(['email' => $user->email]);
        // But generating our own link gives us SPA-friendly URL.
    }

    return response()->json([
        'message' => 'If an account exists, a reset link has been sent.',
        // In local/dev it’s convenient to also return it:
        'dev' => app()->environment('local') ? [
            'url' => isset($url) ? $url : null,
        ] : null,
    ]);
}

public function reset(Request $request)
{
    $request->validate([
        'email' => ['required','email'],
        'token' => ['required','string'],
        'password' => ['required','string','min:6','confirmed'],
    ]);

    $status = Password::reset(
        $request->only('email','password','password_confirmation','token'),
        function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password),
            ])->setRememberToken(Str::random(60));

            $user->save();

            event(new PasswordReset($user));
        }
    );

    if ($status === Password::PASSWORD_RESET) {
        return response()->json(['message' => 'Password has been reset.']);
    }

    return response()->json(['message' => __($status)], 422);
}
public function partnerRegister(Request $req)
{
    try {
        // Validation (same as before; keep it strict)
        $data = $req->validate([
            'name'            => ['required','string','max:120'],
            'email'           => ['required','email','max:190','unique:users,email'],
            'password'        => ['required','string','min:6'],
            'business_type'   => ['required','in:workshop,carwash,rental,parts'],
            'company_name'    => ['required','string','max:160'],
            'phone'           => ['nullable','string','max:40'],
        ]);

        // Build only attributes that exist as columns on users
        $attrs = [
    'name'     => $data['name'],
    'email'    => $data['email'],
    'password' => Hash::make($data['password']),
    'role'     => 'partner',
    'partner_status' => 'pending', // <-- add this
];

        if (Schema::hasColumn('users', 'business_type')) {
            $attrs['business_type'] = $data['business_type'];
        }
        if (Schema::hasColumn('users', 'company_name')) {
            $attrs['company_name'] = $data['company_name'];
        }
        if (Schema::hasColumn('users', 'phone') && !empty($data['phone'])) {
            $attrs['phone'] = $data['phone'];
        }

        $user = User::create($attrs);

        // Optionally create a starter workshop ONLY if all needed columns exist
        $canCreateWorkshop =
            Schema::hasTable('workshops') &&
            Schema::hasColumn('workshops','name') &&
            Schema::hasColumn('workshops','type') &&
            Schema::hasColumn('workshops','rating') &&
            Schema::hasColumn('workshops','price_min') &&
            Schema::hasColumn('workshops','price_max') &&
            Schema::hasColumn('workshops','owner_user_id');

        if ($canCreateWorkshop && in_array($data['business_type'], ['workshop','carwash'], true)) {
            \App\Models\Workshop::create([
                'name'          => $data['company_name'],
                'type'          => $data['business_type'] === 'carwash' ? 'carwash' : 'workshop',
                'rating'        => 0,
                'price_min'     => 0,
                'price_max'     => 0,
                'owner_user_id' => $user->id,
            ]);
        }

        $token = $user->createToken('partner')->plainTextToken;

        return response()->json([
            'accessToken'  => $token,
            'refreshToken' => null,
            'user' => [
    'id' => $user->id,
    'name' => $user->name,
    'email' => $user->email,
    'role' => $user->role,
    'partner_status' => $user->partner_status, // <-- add
    // ...
],
        ], 201);

    } catch (\Throwable $e) {
        // Log full server-side error
        Log::error('Partner register failed', [
            'err' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        // In local, surface the message to help you debug UI without checking logs
        return response()->json([
            'message' => 'Partner signup failed.',
            'dev' => app()->environment('local') ? $e->getMessage() : null,
        ], 500);
    }
}


}
