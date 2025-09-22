<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

use App\Models\Booking;
use App\Models\Service;
use App\Models\Workshop;
use App\Models\PartOrder;

class PartnerController extends Controller
{
    private function toLinesArray($val): ?array {
    if ($val === null) return null;
    if (is_array($val)) return array_values(array_filter(array_map('trim', $val), fn($s)=>$s!==''));
    // string from textarea
    return array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', (string)$val)), fn($s)=>$s!==''));
}

    /* ----------------- helpers ----------------- */

    private function assertPartner(Request $request): void
    {
        $role = $request->user()?->role;
        // allow admin too for testing
        if (!in_array($role, ['partner', 'admin'], true)) {
            abort(403, 'Partner only');
        }
    }

    private function pid(Request $r): int
    {
        return (int) $r->user()->id;
    }

    /* ----------------- KPIs (bookings + parts) ----------------- */
    // GET /api/partner/kpis
    public function kpis(Request $request)
    {
        $this->assertPartner($request);
        $pid = $this->pid($request);

        // Count bookings belonging to this partner’s workshops
        $bookingCount = Booking::whereHas('service.workshop', fn($q) => $q->where('owner_user_id', $pid))
            ->count();

        // Revenue from service bookings (confirmed)
        $serviceRevenue = (float) Booking::whereHas('service.workshop', fn($q) => $q->where('owner_user_id', $pid))
            ->where('status', 'confirmed')
            ->sum('price');

        // Revenue from part orders (exclude cancelled)
        $partsRevenue = (float) PartOrder::whereHas('part', fn($q) => $q->where('owner_user_id', $pid))
            ->where('status', '!=', 'cancelled')
            ->sum('total_price');

        // Avg rating of partner workshops (if you store a rating)
        $avgRating = DB::table('workshops')
            ->where('owner_user_id', $pid)
            ->avg('rating');

        return response()->json([
            'bookingCount' => (int) $bookingCount,
            'revenue'      => round($serviceRevenue + $partsRevenue, 2),
            'avgRating'    => $avgRating ? round((float) $avgRating, 1) : null,
        ]);
    }

    /* ----------------- Monthly revenue (bookings + parts) ----------------- */
    // GET /api/partner/revenue-monthly
    // returns: [{ "month": "YYYY-MM", "total": 1234.56 }, ...] for last 6 months
    public function revenueMonthly(Request $request)
    {
        $this->assertPartner($request);
        $pid = $this->pid($request);

        // Last 6 months including current
        $months = [];
        $cursor = now()->startOfMonth()->subMonths(5);
        for ($i = 0; $i < 6; $i++) {
            $months[] = $cursor->copy()->format('Y-m');
            $cursor->addMonth();
        }
        $since = now()->startOfMonth()->subMonths(5);

        // Service bookings per month (confirmed only)
        $svc = Booking::selectRaw("DATE_FORMAT(created_at, '%Y-%m') AS ym, SUM(price) AS total")
            ->whereHas('service.workshop', fn($q) => $q->where('owner_user_id', $pid))
            ->where('status', 'confirmed')
            ->where('created_at', '>=', $since)
            ->groupBy('ym')
            ->pluck('total', 'ym'); // ['YYYY-MM' => total]

        // Part orders per month (exclude cancelled)
        $parts = PartOrder::selectRaw("DATE_FORMAT(created_at, '%Y-%m') AS ym, SUM(total_price) AS total")
            ->whereHas('part', fn($q) => $q->where('owner_user_id', $pid))
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $since)
            ->groupBy('ym')
            ->pluck('total', 'ym');

        $out = [];
        foreach ($months as $ym) {
            $total = (float) ($svc[$ym] ?? 0) + (float) ($parts[$ym] ?? 0);
            $out[] = ['month' => $ym, 'total' => round($total, 2)];
        }

        return response()->json($out);
    }

    /* ----------------- Most booked services (unchanged) ----------------- */
    // GET /api/partner/top-services
    public function topServices(Request $request)
    {
        $this->assertPartner($request);
        $pid = $this->pid($request);

        $rows = DB::table('bookings')
            ->join('services', 'bookings.service_id', '=', 'services.id')
            ->join('workshops', 'services.workshop_id', '=', 'workshops.id')
            ->where('workshops.owner_user_id', $pid)
            ->select('services.title', DB::raw('COUNT(bookings.id) AS cnt'))
            ->groupBy('services.title')
            ->orderByDesc('cnt')
            ->limit(10)
            ->get();

        return response()->json($rows);
    }

    /* ----------------- Bookings list + status update ----------------- */
    // GET /api/partner/bookings
    public function bookings(Request $request)
    {
        $this->assertPartner($request);
        $pid = $this->pid($request);

        $items = Booking::with(['user', 'service.workshop'])
            ->whereHas('service.workshop', fn($q) => $q->where('owner_user_id', $pid))
            ->latest()
            ->get();

        return $items;
    }

    // PATCH /api/partner/bookings/{id}  { status: 'pending'|'confirmed'|'rejected' }
    public function updateBookingStatus(Request $request, int $id)
    {
        $this->assertPartner($request);
        $pid = $this->pid($request);

        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'rejected'])],
        ]);

        $booking = Booking::where('id', $id)
            ->whereHas('service.workshop', fn($q) => $q->where('owner_user_id', $pid))
            ->firstOrFail();

        $booking->status = $data['status'];
        $booking->save();

        return $booking->load(['user', 'service.workshop']);
    }

    /* ----------------- Services CRUD (unchanged) ----------------- */
    // GET /api/partner/services
    public function services(Request $request)
    {
        $this->assertPartner($request);
        $pid = $this->pid($request);

        return Service::with('workshop')
            ->whereHas('workshop', fn($q) => $q->where('owner_user_id', $pid))
            ->orderBy('id')
            ->get();
    }

    // POST /api/partner/services
    public function storeService(Request $request)
    {
        $this->assertPartner($request);
        $pid = $this->pid($request);

        $data = $request->validate([
    'workshop_id'        => ['required','integer','exists:workshops,id'],
    'title'              => ['required','string','max:255'],
    'price'              => ['required','numeric','min:0'],
    'title_translations' => ['nullable','array'],

    'summary'            => ['nullable','string','max:1000'],
    'duration_min'       => ['nullable','integer','min:1','max:600'],
    'included'           => ['nullable'], // string (textarea) OR array
    'excluded'           => ['nullable'],
    'preparation'        => ['nullable'],
    'policy'             => ['nullable','array'], // e.g. { cancellation, warranty_days }
    'faqs'               => ['nullable','array'], // [{q,a}]
    'notes'              => ['nullable','string'],
]);

        // ensure the workshop belongs to this partner
$ws = Workshop::where('id', $data['workshop_id'])
    ->where('owner_user_id', $pid)->firstOrFail();

$svc = Service::create([
    'workshop_id'        => $ws->id,
    'title'              => $data['title'],
    'price'              => $data['price'],
    'title_translations' => $data['title_translations'] ?? null,

    'summary'            => $data['summary'] ?? null,
    'duration_min'       => $data['duration_min'] ?? null,
    'included'           => $this->toLinesArray($data['included'] ?? null),
    'excluded'           => $this->toLinesArray($data['excluded'] ?? null),
    'preparation'        => $this->toLinesArray($data['preparation'] ?? null),
    'policy'             => $data['policy'] ?? null,
    'faqs'               => $data['faqs'] ?? null,
    'notes'              => $data['notes'] ?? null,
]);

        return $svc->load('workshop');
    }

    // PATCH /api/partner/services/{id}
    public function updateService(Request $request, int $id)
    {
        $this->assertPartner($request);
        $pid = $this->pid($request);

        $svc = Service::with('workshop')
            ->where('id', $id)
            ->whereHas('workshop', fn($q) => $q->where('owner_user_id', $pid))
            ->firstOrFail();

       $data = $request->validate([
    'title'              => ['sometimes','string','max:255'],
    'price'              => ['sometimes','numeric','min:0'],
    'title_translations' => ['sometimes','nullable','array'],

    'summary'            => ['sometimes','nullable','string','max:1000'],
    'duration_min'       => ['sometimes','nullable','integer','min:1','max:600'],
    'included'           => ['sometimes','nullable'],
    'excluded'           => ['sometimes','nullable'],
    'preparation'        => ['sometimes','nullable'],
    'policy'             => ['sometimes','nullable','array'],
    'faqs'               => ['sometimes','nullable','array'],
    'notes'              => ['sometimes','nullable','string'],
]);

// Normalize textareas to arrays if present
foreach (['included','excluded','preparation'] as $k) {
    if (array_key_exists($k, $data)) {
        $data[$k] = $this->toLinesArray($data[$k]);
    }
}

        $svc->fill($data);
        $svc->save();

        return $svc->load('workshop');
    }

    // DELETE /api/partner/services/{id}
    public function destroyService(Request $request, int $id)
    {
        $this->assertPartner($request);
        $pid = $this->pid($request);

        $svc = Service::where('id', $id)
            ->whereHas('workshop', fn($q) => $q->where('owner_user_id', $pid))
            ->firstOrFail();

        $svc->delete();
        return response()->noContent();
    }
    // GET /api/partner/workshops
public function myWorkshops(Request $request)
{
    $this->assertPartner($request);
    $pid = $this->pid($request);

    return \App\Models\Workshop::where('owner_user_id', $pid)
        ->orderBy('name')
        ->get(['id', 'name']);
}
}
