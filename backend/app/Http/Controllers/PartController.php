<?php

namespace App\Http\Controllers;

use App\Models\Part;
use Illuminate\Http\Request;

class PartController extends Controller
{
    // GET /api/parts?category=tires&q=golf&min=10&max=200
public function index(Request $req)
{
    $q = \App\Models\Part::query();

    if ($req->filled('category')) $q->where('category', $req->string('category'));
    if ($req->filled('q')) {
        $term = $req->string('q');
        $q->where(function($qq) use ($term) {
            $qq->where('name','like',"%{$term}%")
               ->orWhere('description','like',"%{$term}%");
        });
    }
    if ($req->filled('min')) $q->where('price','>=',(float)$req->min);
    if ($req->filled('max')) $q->where('price','<=',(float)$req->max);

   /// NEW: by car model (partial match in JSON arrays + legacy strings)
if ($req->filled('model')) {
    $model = trim((string)$req->input('model'));
    $like  = '%'.$model.'%';

    $q->where(function ($qq) use ($like) {
        // compat_models JSON array
        $qq->orWhereRaw("
            EXISTS (
              SELECT 1 FROM JSON_TABLE(parts.compat_models, '$[*]'
                COLUMNS (val VARCHAR(255) PATH '$')
              ) jt WHERE jt.val LIKE ?
            )
        ", [$like]);

        // compat JSON array (legacy)
        $qq->orWhereRaw("
            EXISTS (
              SELECT 1 FROM JSON_TABLE(parts.compat, '$[*]'
                COLUMNS (val VARCHAR(255) PATH '$')
              ) jt2 WHERE jt2.val LIKE ?
            )
        ", [$like]);

        // fallback for stringified storage
        $qq->orWhere('compat_models', 'like', $like);
        $qq->orWhere('compat', 'like', $like);

        // plus a soft fallback on part name
        $qq->orWhere('name', 'like', $like);
    });
}

// NEW: by VIN (partial match)
if ($req->filled('vin')) {
    $vin  = trim((string)$req->input('vin'));
    $like = '%'.$vin.'%';

    $q->where(function ($qq) use ($like) {
        $qq->orWhereRaw("
            EXISTS (
              SELECT 1 FROM JSON_TABLE(parts.vin_codes, '$[*]'
                COLUMNS (val VARCHAR(255) PATH '$')
              ) jt WHERE jt.val LIKE ?
            )
        ", [$like]);

        // fallback if stored as string
        $qq->orWhere('vin_codes', 'like', $like);
    });
}


    return $q->orderBy('category')->orderBy('name')->paginate(24);
}


    // GET /api/parts/{id}
    public function show(int $id)
    {
        return Part::findOrFail($id);
    }
}
