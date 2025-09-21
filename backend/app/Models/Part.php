<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Part extends Model
{
    protected $fillable = [
        'owner_user_id',
        'is_active',
        'category',
        'name',
        'price',
        'stock',
        'image_url',
        'compat',
        'compat_models',
        'vin_codes',
        'description',
    ];

    protected $casts = [
        'compat'         => 'array',
        'compat_models'  => 'array',
        'vin_codes'      => 'array',
        'is_active'      => 'boolean',
        'price'          => 'decimal:2',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }
}
