<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use Carbon\Carbon; // ← add this

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'serviceId' => 'required|integer|exists:services,id',
            'datetime'  => 'required|date',   // accepts ISO or MySQL styles
            'notes'     => 'nullable|string',
        ]);

        // Parse any format (e.g., "2025-09-22T10:30:00Z") to Carbon
        $dt = Carbon::parse($data['datetime']); // optionally ->setTimezone('UTC')

        $booking = Booking::create([
            'user_id'    => $request->user()->id,
            'service_id' => $data['serviceId'],
            'datetime'   => $dt,              // Carbon is fine; Eloquent stores correctly
            'status'     => 'pending',
            'notes'      => $data['notes'] ?? null,
        ]);

        return response()->json($booking->load('service'), 201);
    }

    public function myBookings(Request $request)
    {
        return Booking::with('service.workshop')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();
    }
}
