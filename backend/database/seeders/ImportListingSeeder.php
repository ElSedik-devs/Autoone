<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ImportListing;

class ImportListingSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['europe','BMW','3 Series',2019,2024, 18500.00,'https://picsum.photos/seed/bmw3/900/600'],
            ['europe','VW','Golf',    2018,2023,  12000.00,'https://picsum.photos/seed/golf/900/600'],
            ['usa',   'Tesla','Model 3',2019,2024,26000.00,'https://picsum.photos/seed/model3/900/600'],
            ['china', 'BYD','Atto 3', 2022,2025, 21000.00,'https://picsum.photos/seed/atto3/900/600'],
            ['china', 'Geely','Coolray',2020,2024,15000.00,'https://picsum.photos/seed/coolray/900/600'],
        ];
        foreach ($rows as [$region,$make,$model,$yf,$yt,$price,$img]) {
            ImportListing::updateOrCreate(
                ['region'=>$region,'make'=>$make,'model'=>$model],
                ['year_from'=>$yf,'year_to'=>$yt,'base_price'=>$price,'image_url'=>$img]
            );
        }
    }
}
