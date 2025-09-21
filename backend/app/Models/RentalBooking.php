<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalBooking extends Model
{
    use HasFactory;

protected $fillable = [
  'user_id','rental_id','start_date','end_date','unit','total_price','status','notes','contract_path'
];
protected $casts = [
  'start_date' => 'datetime',
  'end_date' => 'datetime',
];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }
}
