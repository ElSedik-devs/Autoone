<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class RentalController extends Controller
{
    // Map unit -> column name
    private const UNIT_COL = [
        'hour'  => null, // we don't store per-hour; we can derive from day
        'day'   => 'price_per_day',
        'week'  => 'price_per_week',
        'month' => 'price_per_month',
        'year'  => null, // derive from month if needed
    ];

    public function index(Request $req)
    {
        $q = Rental::query();

        // text/location search
        if ($s = trim((string)$req->query('q', ''))) {
            $q->where(function(Builder $w) use ($s) {
                $w->where('title','like',"%{$s}%")
                  ->orWhere('location','like',"%{$s}%");
            });
        }

        // provider filter
        $provider = (string)$req->query('providerType', '');
        if (in_array($provider, ['company','individual'], true)) {
            $q->where('provider_type', $provider);
        }

        // unit filter -> require the corresponding price column to be present
        $unit = (string)$req->query('unit', '');
        $col = self::UNIT_COL[$unit] ?? null;
        if ($col) {
            $q->whereNotNull($col)->where($col, '>', 0);
        } elseif ($unit === 'hour') {
            // allow hour by deriving from day; require day present
            $q->whereNotNull('price_per_day')->where('price_per_day', '>', 0);
        } elseif ($unit === 'year') {
            // allow year by deriving from month; require month present
            $q->whereNotNull('price_per_month')->where('price_per_month', '>', 0);
        }

        // availability (optional)
        $start = $req->query('start'); $end = $req->query('end');
        if ($start && $end) {
            try {
                $startAt = new \DateTimeImmutable((string)$start);
                $endAt   = new \DateTimeImmutable((string)$end);
                if ($endAt > $startAt) {
                    $q->whereDoesntHave('bookings', function (Builder $b) use ($startAt, $endAt) {
                        $b->where('status','!=','cancelled')
                          ->where('start_date','<',$endAt)
                          ->where('end_date','>',$startAt);
                    });
                }
            } catch (\Throwable $e) {
                // ignore bad dates
            }
        }

        // Fetch base fields
        $rows = $q->orderBy('price_per_day')->get([
            'id','title','location','provider_type',
            'price_per_day','price_per_week','price_per_month',
            'images'
        ]);

        // Compute price + price_unit for list cards
        $items = $rows->map(function ($r) use ($unit) {
            $chosenUnit = $unit;
            $price = null;

            $pick = function(string $u) use ($r) {
                return match ($u) {
                    'day'   => $r->price_per_day,
                    'week'  => $r->price_per_week,
                    'month' => $r->price_per_month,
                    'hour'  => $r->price_per_day ? (float)$r->price_per_day / 24 : null,
                    'year'  => $r->price_per_month ? (float)$r->price_per_month * 12 : null,
                    default => null,
                };
            };

            if ($unit && ($price = $pick($unit)) !== null) {
                // use requested unit if available/derivable
            } else {
                // fallback preference: day → week → month
                foreach (['day','week','month'] as $u) {
                    $test = $pick($u);
                    if ($test !== null) { $chosenUnit = $u; $price = $test; break; }
                }
                // as a final fallback, derive hour/year if possible
                if ($price === null) {
                    foreach (['hour','year'] as $u) {
                        $test = $pick($u);
                        if ($test !== null) { $chosenUnit = $u; $price = $test; break; }
                    }
                }
            }

            return [
                'id'            => $r->id,
                'title'         => $r->title,
                'location'      => $r->location,
                'provider_type' => $r->provider_type,
                'images'        => $r->images,
                'price'         => $price !== null ? number_format((float)$price, 2, '.', '') : null,
                'price_unit'    => $chosenUnit,
            ];
        });

        return response()->json($items->values());
    }

    public function show(Rental $rental)
{
    // Build unit prices map (from your columns)
    $units = [];
    if ($rental->price_per_day !== null)   $units['day']   = (float)$rental->price_per_day;
    if ($rental->price_per_week !== null)  $units['week']  = (float)$rental->price_per_week;
    if ($rental->price_per_month !== null) $units['month'] = (float)$rental->price_per_month;
    if ($rental->price_per_day !== null)   $units['hour']  = (float)$rental->price_per_day / 24;
    if ($rental->price_per_month !== null) $units['year']  = (float)$rental->price_per_month * 12;

    // Pick a sensible default for the detail page
    $order = ['day','week','month','hour','year'];
    $bestUnit = null; $bestPrice = null;
    foreach ($order as $u) {
        if (array_key_exists($u, $units)) { $bestUnit = $u; $bestPrice = $units[$u]; break; }
    }

    return response()->json([
        'id'            => $rental->id,
        'title'         => $rental->title,
        // expose both "location" and legacy "location_city" for your TS type
        'location'      => $rental->location,
        'location_city' => $rental->location,
        'provider_type' => $rental->provider_type,
        'images'        => $rental->images,
        'description'   => $rental->description,
        'units'         => $units,
        'price'         => $bestPrice !== null ? number_format($bestPrice, 2, '.', '') : null,
        'price_unit'    => $bestUnit, // "day" | "week" | ...
    ]);
}
}
