<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use App\Models\RentalBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class RentalBookingController extends Controller
{
    public function store(Request $req)
    {
        $data = $req->validate([
            'rentalId' => ['required', 'integer', 'exists:rentals,id'],
            'startAt'  => ['required', 'date'],
            'endAt'    => ['required', 'date', 'after:startAt'],
            'unit'     => ['required', Rule::in(['hour', 'day', 'week', 'month', 'year'])],
            'notes'    => ['nullable', 'string'],
        ]);

        /** @var \App\Models\User $user */
        $user   = Auth::user();
        $rental = Rental::findOrFail($data['rentalId']);

        $start = Carbon::parse($data['startAt']);
        $end   = Carbon::parse($data['endAt']);
        $unit  = $data['unit'];

        // derive unit price from rental (supports sparse pricing)
        $pricePerDay   = $rental->price_per_day   !== null ? (float) $rental->price_per_day   : null;
        $pricePerWeek  = $rental->price_per_week  !== null ? (float) $rental->price_per_week  : null;
        $pricePerMonth = $rental->price_per_month !== null ? (float) $rental->price_per_month : null;

        $pricePerHour = $pricePerDay   !== null ? $pricePerDay / 24.0 : null;
        $pricePerYear = $pricePerMonth !== null ? $pricePerMonth * 12.0 : null;

        $unitPrice = match ($unit) {
            'hour'  => $pricePerHour,
            'day'   => $pricePerDay,
            'week'  => $pricePerWeek,
            'month' => $pricePerMonth,
            'year'  => $pricePerYear,
        };

        if ($unitPrice === null) {
            return response()->json(['message' => 'Pricing for selected unit is unavailable.'], 422);
        }

        $qty = match ($unit) {
            'hour'  => max(1, (int) ceil($start->diffInMinutes($end) / 60)),
            'day'   => max(1, (int) ceil($start->diffInHours($end) / 24)),
            'week'  => max(1, (int) ceil($start->diffInDays($end) / 7)),
            'month' => max(1, (int) ceil($start->diffInDays($end) / 30)),
            'year'  => max(1, (int) ceil($start->diffInDays($end) / 365)),
        };

        $total = $unitPrice * $qty;

        // create booking (make sure RentalBooking::$fillable contains these fields)
        $booking = RentalBooking::create([
            'user_id'     => $user->id,
            'rental_id'   => $rental->id,
            'start_date'  => $start,    // uses model cast to datetime if set
            'end_date'    => $end,
            'unit'        => $unit,
            'total_price' => $total,
            'status'      => 'pending',
            'notes'       => $data['notes'] ?? null,
        ]);

        // generate contract PDF
        $html = view('pdf.rental_contract', [
            'booking'   => $booking->fresh(['rental']),
            'rental'    => $rental,
            'user'      => $user,
            'qty'       => $qty,
            'unit'      => $unit,
            'unitPrice' => $unitPrice,
        ])->render();

        $pdfBytes = PDF::loadHTML($html)->setPaper('a4', 'portrait')->output();

        // save to public disk so it’s web-accessible
        $path = "contracts/rental_booking_{$booking->id}.pdf";
        Storage::disk('public')->put($path, $pdfBytes);

        // (optional) persist the path if you added a column
        // $booking->update(['contract_path' => $path]);

        return response()->json([
            'id'          => $booking->id,
            'total'       => number_format($total, 2, '.', ''),
            'unit'        => $unit,
            'qty'         => $qty,
            'contractUrl' => asset('storage/' . $path),
        ], 201);
    }

    public function mine(Request $req)
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    $rows = RentalBooking::with('rental')
        ->where('user_id', $user->id)
        ->orderByDesc('created_at')
        ->get()
        ->map(function (RentalBooking $b) {
            // we saved files as contracts/rental_booking_{id}.pdf
            $path = "contracts/rental_booking_{$b->id}.pdf";
            return [
                'id'          => $b->id,
                'rental_id'   => $b->rental_id,
                'rental'      => [
                    'title'         => $b->rental?->title,
                    'location_city' => $b->rental?->location_city,
                    'thumbnail'     => $b->rental?->images[0] ?? null,
                ],
                'start_date'  => optional($b->start_date)->toIso8601String(),
                'end_date'    => optional($b->end_date)->toIso8601String(),
                'unit'        => $b->unit,
                'total_price' => $b->total_price,
                'status'      => $b->status,
                'contractUrl' => \Storage::disk('public')->exists($path) ? asset('storage/'.$path) : null,
                'created_at'  => $b->created_at->toIso8601String(),
            ];
        });

    return response()->json($rows);
}

}
