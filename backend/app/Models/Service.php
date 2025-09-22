<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
 protected $fillable = [
    'workshop_id','title','price','title_translations',
    'summary','duration_min','included','excluded',
    'preparation','policy','faqs','notes',
];

    // Cast JSON to array automatically (and back to JSON when saving).
    // Optional: price cast helps when formatting.
    protected $casts = [
        'title_translations' => 'array',
        'price' => 'decimal:2',
    'included'    => 'array',
    'excluded'    => 'array',
    'preparation' => 'array',
    'policy'      => 'array',
    'faqs'        => 'array',
    ];

    public function workshop(): BelongsTo
    {
        return $this->belongsTo(Workshop::class);
    }
}
