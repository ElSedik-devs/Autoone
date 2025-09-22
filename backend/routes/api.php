<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\WorkshopController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\RentalBookingController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ImportOrderController;
use App\Http\Controllers\PartController;
use App\Http\Controllers\PartOrderController;
use App\Http\Controllers\PartnerPartsController;

// Health check
Route::get('/health', fn () => response()->json(['status' => 'ok']));

// ---- Auth (public) ----
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/register-partner', [AuthController::class, 'partnerRegister']);
Route::post('/auth/forgot', [AuthController::class, 'forgot']);
Route::post('/auth/reset',  [AuthController::class, 'reset']);

// ---- Public browse ----
Route::get('/workshops', [WorkshopController::class, 'index']);
Route::get('/workshops/{id}', [WorkshopController::class, 'show']);
Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/{car}', [CarController::class, 'show']);
Route::get('/rentals', [RentalController::class, 'index']);
Route::get('/rentals/{rental}', [RentalController::class, 'show']);
Route::get('/import/listings', [ImportController::class, 'listings']);
Route::post('/import/calc',   [ImportController::class, 'calc']);
Route::get('/parts',      [PartController::class, 'index']);
Route::get('/parts/{id}', [PartController::class, 'show']);

// ---- Authed-only ----
Route::middleware('auth:sanctum')->group(function () {
    // me
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateMe']);

    // User bookings
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/me', [BookingController::class, 'myBookings']);

    // Rentals bookings
    Route::post('/rentals/bookings',    [RentalBookingController::class, 'store']);
    Route::get('/rentals/bookings/me',  [RentalBookingController::class, 'myBookings']);
    Route::get('/rental-bookings/me',   [RentalBookingController::class, 'mine']); // (kept if used elsewhere)

    // Import / Parts orders (user)
    Route::post('/import/orders',   [ImportOrderController::class, 'store']);
    Route::get('/import/orders/me', [ImportOrderController::class, 'mine']);
    Route::post('/part-orders',     [PartOrderController::class, 'store']);
    Route::get('/part-orders/me',   [PartOrderController::class, 'mine']);
    Route::post('/parts/checkout',  [PartOrderController::class, 'checkout']);

    // ---- Admin basics ----
    Route::get('/admin/kpis',     [AdminController::class, 'kpis']);
    Route::get('/admin/bookings', [AdminController::class, 'bookings']);
    
    // ---- Partner routes (approved partners only) ----
    // IMPORTANT: this group is the change you were asking about
    Route::middleware('partner.approved')->group(function () {
        // Partner KPIs / reports
        Route::get('/partner/kpis',             [PartnerController::class, 'kpis']);
        Route::get('/partner/revenue-monthly',  [PartnerController::class, 'revenueMonthly']);
        Route::get('/partner/top-services',     [PartnerController::class, 'topServices']);

        // Partner bookings management
        Route::get('/partner/bookings',                 [PartnerController::class, 'bookings']);
        Route::patch('/partner/bookings/{id}',          [PartnerController::class, 'updateBookingStatus']);

        // Partner services (CRUD)
        Route::get('/partner/services',                 [PartnerController::class, 'services']);
        Route::post('/partner/services',                [PartnerController::class, 'storeService']);
        Route::patch('/partner/services/{id}',          [PartnerController::class, 'updateService']);
        Route::delete('/partner/services/{id}',         [PartnerController::class, 'destroyService']);

        // Partner parts (CRUD)
        Route::get('/partner/parts',                    [PartnerPartsController::class,'index']);
        Route::post('/partner/parts',                   [PartnerPartsController::class,'store']);
        Route::patch('/partner/parts/{id}',             [PartnerPartsController::class,'update']);
        Route::delete('/partner/parts/{id}',            [PartnerPartsController::class,'destroy']);
        Route::patch('/partner/parts/{id}/stock',       [PartnerPartsController::class,'setStock']);

        // Partner part orders
        Route::get('/partner/part-orders',              [PartnerPartsController::class,'orders']);
        Route::patch('/partner/part-orders/{id}',       [PartnerPartsController::class,'updateOrderStatus']);

        Route::get('/admin/partners/pending', [AdminController::class,'pendingPartners']);
Route::patch('/admin/partners/{user}/approve', [AdminController::class,'approvePartner']);
Route::patch('/admin/partners/{user}/reject', [AdminController::class,'rejectPartner']);

Route::get('/partner/workshops', [PartnerController::class, 'myWorkshops']);
    });
});
