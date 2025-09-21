<?php

namespace App\Http\Controllers;

use App\Models\Part;
use App\Models\PartOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PartOrderController extends Controller
{
    // POST /api/part-orders
    public function store(Request $req)
    {
        $data = $req->validate([
            'partId' => ['required','integer','exists:parts,id'],
            'qty'    => ['required','integer','min:1','max:20'],
            'notes'  => ['nullable','string','max:2000'],
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $part = Part::findOrFail($data['partId']);

        // simple stock check (optional; demo-safe)
        if ($part->stock < $data['qty']) {
            return response()->json(['message' => 'Insufficient stock'], 422);
        }

        $unit = (float)$part->price;
        $qty  = (int)$data['qty'];
        $total = $unit * $qty;

        $order = PartOrder::create([
            'user_id'     => $user->id,
            'part_id'     => $part->id,
            'qty'         => $qty,
            'unit_price'  => $unit,
            'total_price' => $total,
            'status'      => 'submitted',
            'notes'       => $data['notes'] ?? null,
        ]);

        // optional: decrement stock just for demo feel
        // $part->decrement('stock', $qty);

        return response()->json($order->load('part'), 201);
    }

    // GET /api/part-orders/me
    public function mine(Request $req)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return PartOrder::with('part')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();
    }

    public function checkout(Request $req)
{
    $data = $req->validate([
        'items' => ['required','array','min:1'],
        'items.*.partId' => ['required','integer','exists:parts,id'],
        'items.*.qty'    => ['required','integer','min:1','max:20'],
        'notes'          => ['nullable','string','max:2000'],
    ]);

    /** @var \App\Models\User $user */
    $user = \Illuminate\Support\Facades\Auth::user();

    $created = [];
    $grand = 0.0;

    \DB::transaction(function () use (&$created, &$grand, $data, $user) {
        foreach ($data['items'] as $it) {
            /** @var \App\Models\Part $part */
            $part = \App\Models\Part::lockForUpdate()->findOrFail($it['partId']);
            $qty  = (int)$it['qty'];
            if ($part->stock < $qty) {
                abort(422, "Insufficient stock for {$part->name}");
            }
            $unit  = (float)$part->price;
            $total = $unit * $qty;

            $order = \App\Models\PartOrder::create([
                'user_id'     => $user->id,
                'part_id'     => $part->id,
                'qty'         => $qty,
                'unit_price'  => $unit,
                'total_price' => $total,
                'status'      => 'submitted',
                'notes'       => $data['notes'] ?? null,
            ]);
            // Optional: decrement stock for demo feel
            // $part->decrement('stock', $qty);

            $grand += $total;
            $created[] = $order->id;
        }
    });

    return response()->json([
        'orderIds' => $created,
        'total'    => round($grand, 2),
    ], 201);
}

}
