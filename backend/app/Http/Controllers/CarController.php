<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    public function index(Request $req)
    {
        $q = Car::query();

        $s    = trim((string) $req->query('q', ''));
        $cond = (string) $req->query('condition', '');
        $fuel = (string) $req->query('fuel', '');
        $min  = $req->query('minPrice', null);
        $max  = $req->query('maxPrice', null);

        if ($s !== '') {
            $q->where('title', 'like', "%{$s}%");
        }
        if (in_array($cond, ['new','used'], true)) {
            $q->where('condition', $cond);
        }
        if (in_array($fuel, ['petrol','diesel','hybrid','ev'], true)) {
            $q->where('fuel', $fuel);
        }
        if ($min !== null && $min !== '') {
            $q->where('price', '>=', (float) $min);
        }
        if ($max !== null && $max !== '') {
            $q->where('price', '<=', (float) $max);
        }

        return $q->orderBy('price')->get([
            'id','title','price','year','mileage_km','fuel','condition','thumbnail_url'
        ]);
    }

    public function show(Car $car)
    {
        return $car;
    }
}
