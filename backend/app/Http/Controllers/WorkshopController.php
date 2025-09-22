<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Workshop;

class WorkshopController extends Controller
{
    // GET /api/workshops?q=...
public function index(Request $request)
{
    $q         = $request->query('q');
    $minPrice  = $request->query('minPrice');
    $maxPrice  = $request->query('maxPrice');
    $minRating = $request->query('minRating');
    $type      = $request->query('type'); // <-- "workshop" | "carwash" | null

    $query = \App\Models\Workshop::query();

    if ($type) {
        $query->where('type', $type);
    }
    if ($q) {
        $query->where('name', 'like', "%{$q}%");
    }
    if ($minRating !== null && $minRating !== '') {
        $query->where('rating', '>=', (float) $minRating);
    }
    if ($minPrice !== null && $minPrice !== '') {
        $query->where('price_min', '>=', (float) $minPrice);
    }
    if ($maxPrice !== null && $maxPrice !== '') {
        $query->where('price_max', '<=', (float) $maxPrice);
    }

    return $query->withCount('services')
                 ->orderByDesc('rating')
                 ->get();
}



   public function show(Request $request, int $id)
{
    $lng = substr($request->header('Accept-Language', 'en'), 0, 2);

    $workshop = Workshop::with('services')->findOrFail($id);

    // include workshop metadata
    $out = $workshop->toArray();   // <— you were missing this line

    $out['services'] = $workshop->services->map(function ($s) use ($lng) {
        $title_i18n = null;
        if (is_array($s->title_translations)) {
            $title_i18n = $s->title_translations[$lng] ?? ($s->title_translations['en'] ?? null);
        }
        return [
            'id'           => $s->id,
            'workshop_id'  => $s->workshop_id,
            'title'        => $s->title,
            'title_i18n'   => $title_i18n,
            'price'        => $s->price,

            // service-info template fields
            'summary'      => $s->summary,
            'duration_min' => $s->duration_min,
            'included'     => $s->included,
            'excluded'     => $s->excluded,
            'preparation'  => $s->preparation,
            'policy'       => $s->policy,
            'faqs'         => $s->faqs,
            'notes'        => $s->notes,

            'created_at'   => $s->created_at,
            'updated_at'   => $s->updated_at,
        ];
    })->values();

    return response()->json($out);
}

}
