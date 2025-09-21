<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportOrder extends Model
{
    protected $fillable = [
        'user_id','region','make','model','year','vin','destination_country','notes',
        'purchase_price','estimate_breakdown','total_estimated','status',
    ];

    protected $casts = [
        'estimate_breakdown' => 'array',
    ];

    public function user() {
        return $this->belongsTo(\App\Models\User::class);
    }
}
