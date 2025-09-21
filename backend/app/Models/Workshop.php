<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workshop extends Model
{
    protected $fillable = ['name','price_min','price_max','rating','type','lat','lng','owner_user_id'];

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }
}
