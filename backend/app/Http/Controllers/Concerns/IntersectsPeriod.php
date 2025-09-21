<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait IntersectsPeriod
{
    /**
     * Add where-not-overlapping filter for [start,end) intervals.
     */
    protected function whereAvailable(Builder $q, \DateTimeInterface $start, \DateTimeInterface $end): void
    {
        $q->whereDoesntHave('bookings', function (Builder $b) use ($start, $end) {
            $b->where('status', '!=', 'cancelled')
              ->where(function (Builder $bb) use ($start, $end) {
                  $bb->where(function ($x) use ($start, $end) {
                        $x->where('start_at', '<', $end)->where('end_at', '>', $start);
                  });
              });
        });
    }

    protected function unitsFor(string $unit, \DateTimeInterface $start, \DateTimeInterface $end): int
    {
        $seconds = max(0, $end->getTimestamp() - $start->getTimestamp());
        $div = match ($unit) {
            'hour'  => 3600,
            'day'   => 86400,
            'week'  => 604800,
            'month' => 2592000,   // approx 30d
            'year'  => 31536000,
            default => 86400,
        };
        return (int) ceil($seconds / $div);
    }
}
