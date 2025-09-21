<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Workshop;
use App\Models\Service;

class DemoCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $partner = User::where('email', 'partner@auto.one')->first();

        // -------- Regular workshops --------
        $w1 = Workshop::updateOrCreate(
            ['name' => 'FastFix Garage'],
            [
                'type' => 'workshop',
                'rating' => 4.6,
                'price_min' => 20,
                'price_max' => 120,
                'owner_user_id' => $partner?->id,
                'lat' => 52.5200,
                'lng' => 13.4050,
            ]
        );

        Service::updateOrCreate(
            ['workshop_id' => $w1->id, 'title' => 'Oil change'],
            [
                'price' => 40,
                'title_translations' => [
                    'en' => 'Oil change',
                    'de' => 'Ölwechsel',
                    'ar' => 'تغيير الزيت',
                ],
            ]
        );
        Service::updateOrCreate(
            ['workshop_id' => $w1->id, 'title' => 'Brake check'],
            [
                'price' => 60,
                'title_translations' => [
                    'en' => 'Brake check',
                    'de' => 'Bremsenprüfung',
                    'ar' => 'فحص الفرامل',
                ],
            ]
        );

        $w2 = Workshop::updateOrCreate(
            ['name' => 'City Auto Care'],
            [
                'type' => 'workshop',
                'rating' => 4.3,
                'price_min' => 25,
                'price_max' => 150,
                'owner_user_id' => $partner?->id,
                'lat' => 52.5155,
                'lng' => 13.3776,
            ]
        );

        Service::updateOrCreate(
            ['workshop_id' => $w2->id, 'title' => 'Tire rotation'],
            [
                'price' => 30,
                'title_translations' => [
                    'en' => 'Tire rotation',
                    'de' => 'Reifenrotation',
                    'ar' => 'تبديل الإطارات',
                ],
            ]
        );
        Service::updateOrCreate(
            ['workshop_id' => $w2->id, 'title' => 'AC inspection'],
            [
                'price' => 50,
                'title_translations' => [
                    'en' => 'AC inspection',
                    'de' => 'Klimaanlagenprüfung',
                    'ar' => 'فحص التكييف',
                ],
            ]
        );

        // -------- Car wash providers --------
        $cw1 = Workshop::updateOrCreate(
            ['name' => 'Sparkle Wash'],
            [
                'type' => 'carwash',
                'rating' => 4.5,
                'price_min' => 10,
                'price_max' => 80,
                'owner_user_id' => $partner?->id,
                'lat' => 52.5208,
                'lng' => 13.4095,
            ]
        );
        $cw2 = Workshop::updateOrCreate(
            ['name' => 'City Shine'],
            [
                'type' => 'carwash',
                'rating' => 4.2,
                'price_min' => 8,
                'price_max' => 70,
                'owner_user_id' => $partner?->id,
                'lat' => 52.5155,
                'lng' => 13.3776,
            ]
        );

        Service::updateOrCreate(
            ['workshop_id' => $cw1->id, 'title' => 'Exterior wash'],
            [
                'price' => 15,
                'title_translations' => [
                    'en' => 'Exterior wash',
                    'de' => 'Außenwäsche',
                    'ar' => 'غسيل خارجي',
                ],
            ]
        );
        Service::updateOrCreate(
            ['workshop_id' => $cw1->id, 'title' => 'Interior cleaning'],
            [
                'price' => 25,
                'title_translations' => [
                    'en' => 'Interior cleaning',
                    'de' => 'Innenreinigung',
                    'ar' => 'تنظيف داخلي',
                ],
            ]
        );
        Service::updateOrCreate(
            ['workshop_id' => $cw1->id, 'title' => 'Polishing'],
            [
                'price' => 60,
                'title_translations' => [
                    'en' => 'Polishing',
                    'de' => 'Polieren',
                    'ar' => 'تلميع',
                ],
            ]
        );

        Service::updateOrCreate(
            ['workshop_id' => $cw2->id, 'title' => 'Exterior wash'],
            [
                'price' => 12,
                'title_translations' => [
                    'en' => 'Exterior wash',
                    'de' => 'Außenwäsche',
                    'ar' => 'غسيل خارجي',
                ],
            ]
        );
        Service::updateOrCreate(
            ['workshop_id' => $cw2->id, 'title' => 'Interior cleaning'],
            [
                'price' => 22,
                'title_translations' => [
                    'en' => 'Interior cleaning',
                    'de' => 'Innenreinigung',
                    'ar' => 'تنظيف داخلي',
                ],
            ]
        );
    }
}
