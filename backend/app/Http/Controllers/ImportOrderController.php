<?php

namespace App\Http\Controllers;

use App\Models\ImportOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImportOrderController extends Controller
{
    // POST /api/import/orders
    public function store(Request $req)
    {
        $data = $req->validate([
            'region'            => ['required','in:europe,china,usa'],
            'make'              => ['required','string'],
            'model'             => ['required','string'],
            'year'              => ['nullable','integer','min:1980','max:2100'],
            'vin'               => ['nullable','string','max:32'],
            'destinationCountry'=> ['nullable','string','size:2'],
            'notes'             => ['nullable','string','max:2000'],
            'purchasePrice'     => ['required','numeric','min:0'],
            // client passes a fresh calc so backend persists what user saw
            'estimate'          => ['required','array'],
            'estimate.base'     => ['required','numeric'],
            'estimate.shipping' => ['required','numeric'],
            'estimate.customs'  => ['required','numeric'],
            'estimate.handling' => ['required','numeric'],
            'estimate.vat'      => ['required','numeric'],
            'estimate.total'    => ['required','numeric'],
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $order = ImportOrder::create([
            'user_id'            => $user->id,
            'region'             => $data['region'],
            'make'               => $data['make'],
            'model'              => $data['model'],
            'year'               => $data['year'] ?? null,
            'vin'                => $data['vin'] ?? null,
            'destination_country'=> strtoupper($data['destinationCountry'] ?? 'DE'),
            'notes'              => $data['notes'] ?? null,
            'purchase_price'     => $data['purchasePrice'],
            'estimate_breakdown' => [
                'base'     => (float)$data['estimate']['base'],
                'shipping' => (float)$data['estimate']['shipping'],
                'customs'  => (float)$data['estimate']['customs'],
                'handling' => (float)$data['estimate']['handling'],
                'vat'      => (float)$data['estimate']['vat'],
                'total'    => (float)$data['estimate']['total'],
            ],
            'total_estimated'    => (float)$data['estimate']['total'],
            'status'             => 'submitted',
        ]);

        return response()->json($order, 201);
    }

    // GET /api/import/orders/me
    public function mine(Request $req)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return ImportOrder::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();
    }
}
