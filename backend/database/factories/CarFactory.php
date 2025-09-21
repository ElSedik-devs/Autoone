<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CarFactory extends Factory
{
    public function definition(): array
    {
        $fuels = ['petrol','diesel','hybrid','ev'];
        $conds = ['new','used'];

        $title = fake()->randomElement([
            'VW Golf', 'BMW 3 Series', 'Audi A3', 'Toyota Corolla', 'Hyundai Ioniq', 'Tesla Model 3'
        ]).' '.fake()->randomElement(['1.5 TSI','2.0 TDI','Hybrid','Long Range']);

        return [
            'title' => $title,
            'year' => fake()->numberBetween(2016, 2025),
            'mileage_km' => fake()->optional(0.7)->numberBetween(5000, 180000),
            'fuel' => fake()->randomElement($fuels),
            'condition' => fake()->randomElement($conds),
            'price' => fake()->numberBetween(9000, 55000),
            'thumbnail_url' => 'https://picsum.photos/seed/'.fake()->uuid().'/400/260',
            'images' => [
                'https://picsum.photos/seed/'.fake()->uuid().'/900/600',
                'https://picsum.photos/seed/'.fake()->uuid().'/900/600',
                'https://picsum.photos/seed/'.fake()->uuid().'/900/600',
            ],
            'specs' => [
                'Power' => fake()->numberBetween(80, 250).' kW',
                'Transmission' => fake()->randomElement(['Manual','Automatic']),
                'Color' => fake()->safeColorName(),
                'Doors' => fake()->randomElement([3,5]),
            ],
            'description' => fake()->paragraph(),
        ];
    }
}
