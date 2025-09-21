<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Part;

class PartSeeder extends Seeder
{
    public function run(): void
    {
        // category, name, price, stock, image_url, compat, description, compat_models, vin_codes
        $rows = [
            [
                'tires','Michelin Pilot Sport 4 (225/45 R17)', 129.99, 50,
                'https://picsum.photos/seed/tires1/900/600',
                ['VW Golf','BMW 3 Series'],
                'High-performance summer tire.',
                ['VW Golf','BMW 3 Series'],
                ['WVWZZZ1JZXW000001','WBA8A9C50GK000001'],
            ],
            [
                'brakes','Brembo Front Brake Pads', 89.50, 30,
                'https://picsum.photos/seed/brake1/900/600',
                ['Audi A4','BMW 3 Series'],
                'Ceramic pads, low dust.',
                ['Audi A4','BMW 3 Series'],
                ['WAUZZZF49JA000001'],
            ],
            [
                'batteries','Varta AGM 70Ah Battery', 159.00, 20,
                'https://picsum.photos/seed/batt1/900/600',
                ['Mercedes C-Class','VW Passat'],
                'AGM for start/stop systems.',
                ['Mercedes C-Class','VW Passat'],
                ['WDDGF8AB9ER000001'],
            ],
            [
                'oils','Castrol Edge 5W-30 (5L)', 42.90, 100,
                'https://picsum.photos/seed/oil1/900/600',
                null,
                'Fully synthetic engine oil.',
                null,
                null,
            ],
            [
                'accessories','Thule Roof Rack (Universal)', 199.00, 12,
                'https://picsum.photos/seed/roof1/900/600',
                null,
                'Aero bars, lockable.',
                ['VW Golf','Audi A4'],
                null,
            ],
        ];

        foreach ($rows as [$cat,$name,$price,$stock,$img,$compat,$desc,$cm,$vins]) {
            Part::updateOrCreate(
                ['name' => $name],
                [
                    'category'      => $cat,
                    'price'         => $price,
                    'stock'         => $stock,
                    'image_url'     => $img,
                    'compat'        => $compat,
                    'description'   => $desc,
                    'compat_models' => $cm,
                    'vin_codes'     => $vins,
                ]
            );
        }
    }
}
