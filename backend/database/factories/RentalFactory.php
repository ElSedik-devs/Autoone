<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RentalFactory extends Factory
{
    public function definition(): array
    {
        $cities = ['Berlin','Munich','Hamburg','Frankfurt'];
        $units  = ['hour','day','week','month','year'];
        $models = ['VW Golf','BMW 320d','Audi A3','Tesla Model 3','Toyota Corolla'];

        $title = $this->faker->randomElement($models).' - '.$this->faker->randomElement($cities);

        return [
            'title' => $title,
            'provider_type' => $this->faker->randomElement(['company','individual']),
            'location_city' => $this->faker->randomElement($cities),
            'lat' => $this->faker->optional(0.7)->randomFloat(7, 52.3, 52.6),
            'lng' => $this->faker->optional(0.7)->randomFloat(7, 13.2, 13.6),
            'price' => $this->faker->numberBetween(10, 120),
            'price_unit' => $this->faker->randomElement($units),
            'images' => [
                'https://picsum.photos/seed/'.\Str::uuid().'/900/600',
                'https://picsum.photos/seed/'.\Str::uuid().'/900/600',
            ],
            'specs' => [
                'Seats' => $this->faker->randomElement([4,5,7]),
                'Gearbox' => $this->faker->randomElement(['Manual','Automatic']),
                'Fuel' => $this->faker->randomElement(['Petrol','Diesel','Hybrid','Electric']),
            ],
            'description' => $this->faker->paragraph(),
            'rating' => $this->faker->optional()->randomFloat(1, 3.5, 5.0),
        ];
    }
}
