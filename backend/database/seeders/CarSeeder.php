<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Car;

class CarSeeder extends Seeder
{
    public function run(): void
    {
        Car::factory()->count(18)->create();

        Car::create([
            'title' => 'Tesla Model 3 Long Range',
            'year' => 2023,
            'fuel' => 'ev',
            'condition' => 'new',
            'price' => 47990,
            'thumbnail_url' => 'https://picsum.photos/seed/model3/400/260',
            'images' => ['https://picsum.photos/seed/model3a/900/600','https://picsum.photos/seed/model3b/900/600'],
            'specs' => ['Power'=>'258 kW','Transmission'=>'Automatic','Color'=>'White','Doors'=>5],
            'description' => 'Brand-new Long Range with Autopilot.',
        ]);

        Car::create([
            'title' => 'BMW 320d',
            'year' => 2019,
            'mileage_km' => 92000,
            'fuel' => 'diesel',
            'condition' => 'used',
            'price' => 19990,
            'thumbnail_url' => 'https://picsum.photos/seed/bmw320d/400/260',
            'images' => ['https://picsum.photos/seed/bmw320d1/900/600','https://picsum.photos/seed/bmw320d2/900/600'],
            'specs' => ['Power'=>'140 kW','Transmission'=>'Automatic','Color'=>'Black','Doors'=>5],
            'description' => 'Well maintained, single owner, service history.',
        ]);
    }
}
