<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    use HasFactory;

    protected $fillable = [
        'title','provider_type','location_city','lat','lng','price','price_unit',
        'images','specs','description','rating'
    ];

    protected $casts = [
        'images' => 'array',
        'specs'  => 'array',
        'price'  => 'decimal:2',
    ];

public function bookings()
{
    return $this->hasMany(\App\Models\RentalBooking::class);
}
}
