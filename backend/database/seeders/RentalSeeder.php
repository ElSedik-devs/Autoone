<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Rental;

class RentalSeeder extends Seeder
{
    public function run(): void
    {
        Rental::create([
            'title' => 'Tesla Model 3 - Berlin',
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => 2023,
            'price_per_day' => 90,
            'price_per_week' => 550,
            'price_per_month' => 2000,
            'provider_type' => 'individual',
            'location' => 'Berlin',
            'description' => 'Electric sedan with autopilot.',
            'images' => [
                "https://picsum.photos/seed/tesla/900/600",
                "https://picsum.photos/seed/tesla2/900/600"
            ],
        ]);

        Rental::create([
            'title' => 'BMW X5 - Munich',
            'brand' => 'BMW',
            'model' => 'X5',
            'year' => 2022,
            'price_per_day' => 120,
            'price_per_week' => 700,
            'price_per_month' => 2500,
            'provider_type' => 'company',
            'location' => 'Munich',
            'description' => 'Luxury SUV with full options.',
            'images' => [
                "https://picsum.photos/seed/bmw/900/600",
                "https://picsum.photos/seed/bmw2/900/600"
            ],
        ]);
    }
}