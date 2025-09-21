<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'title','year','mileage_km','fuel','condition','price',
        'thumbnail_url','images','specs','description'
    ];

    protected $casts = [
        'images' => 'array',
        'specs'  => 'array',
        'price'  => 'decimal:2',
    ];
}
