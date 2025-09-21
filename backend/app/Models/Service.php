<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    // These attributes can be set via create(), update(), updateOrCreate() etc.
    protected $fillable = ['workshop_id', 'title', 'price', 'title_translations'];

    // Cast JSON to array automatically (and back to JSON when saving).
    // Optional: price cast helps when formatting.
    protected $casts = [
        'title_translations' => 'array',
        'price' => 'decimal:2',
    ];

    public function workshop(): BelongsTo
    {
        return $this->belongsTo(Workshop::class);
    }
}
