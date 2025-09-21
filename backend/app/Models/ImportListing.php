<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportListing extends Model
{
    protected $fillable = [
        'region','make','model','year_from','year_to','base_price','image_url',
    ];
}
