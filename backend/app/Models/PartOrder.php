<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartOrder extends Model
{
    protected $fillable = [
        'user_id',
        'part_id',
        'qty',
        'unit_price',
        'total_price',
        'status',
        'notes',
    ];

    protected $casts = [
        'unit_price'  => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
