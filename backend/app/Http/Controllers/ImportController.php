<?php

namespace App\Http\Controllers;

use App\Models\ImportListing;
use Illuminate\Http\Request;

class ImportController extends Controller
{
    // GET /api/import/listings?region=china&q=tesla
    public function listings(Request $req)
    {
        $q = ImportListing::query();

        if ($req->filled('region')) {
            $q->where('region', $req->string('region'));
        }
        if ($req->filled('q')) {
            $term = $req->string('q');
            $q->where(function($qq) use ($term) {
                $qq->where('make','like',"%{$term}%")
                   ->orWhere('model','like',"%{$term}%");
            });
        }

        return $q->orderBy('make')->orderBy('model')->limit(50)->get();
    }

    // POST /api/import/calc { region, purchasePrice, destinationCountry? }
    public function calc(Request $req)
    {
        $data = $req->validate([
            'region'           => ['required','in:europe,china,usa'],
            'purchasePrice'    => ['required','numeric','min:0'],
            'destinationCountry' => ['nullable','string','size:2'],
        ]);

        $region = $data['region'];
        $base   = (float)$data['purchasePrice'];
        $dest   = strtoupper($data['destinationCountry'] ?? 'DE');

        // --- Simple, transparent rules (documented & deterministic) ---
        // shipping fees (flat) by region:
        $shipping = match($region) {
            'europe' => 1200.0,   // intra-EU logistics/transport
            'china'  => 2200.0,   // ocean/rail freight
            'usa'    => 2000.0,   // ocean freight
        };

        // customs (as a % of base) – simplified, not legal/tariff advice
        $customsRate = match($region) {
            'europe' => 0.00,     // intra-EU simplified (example)
            'china'  => 0.10,
            'usa'    => 0.10,
        };
        $customs = $base * $customsRate;

        // handling/admin
        $handling = 350.00;

        // VAT (destination), simplified flat 19% for DE
        $vatRate = ($dest === 'DE') ? 0.19 : 0.19;
        $vatBase = $base + $shipping + $customs + $handling;
        $vat     = $vatBase * $vatRate;

        $total = $base + $shipping + $customs + $handling + $vat;

        return response()->json([
            'region'  => $region,
            'dest'    => $dest,
            'base'    => round($base,2),
            'shipping'=> round($shipping,2),
            'customs' => round($customs,2),
            'handling'=> round($handling,2),
            'vat'     => round($vat,2),
            'total'   => round($total,2),
            'notes'   => 'Estimator uses simplified rules for demo. Not a legal quote.',
        ]);
    }
}
