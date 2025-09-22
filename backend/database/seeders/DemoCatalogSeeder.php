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
                'type'         => 'workshop',
                'rating'       => 4.6,
                'price_min'    => 20,
                'price_max'    => 120,
                'owner_user_id'=> $partner?->id,
                'lat'          => 52.5200,
                'lng'          => 13.4050,
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
                // --- NEW info fields ---
                'summary'      => 'Standard oil & filter replacement with quick safety check.',
                'duration_min' => 45,
                'included'     => ['Drain old oil','New oil filter','Up to 4L of 5W-30','Top-off fluids','Basic safety check'],
                'excluded'     => ['Engine flush','Specialty oil beyond 4L'],
                'preparation'  => ['Remove valuables','Have service book ready'],
                'policy'       => ['cancellation' => 'Free until 2h before the appointment.', 'warranty_days' => 7],
                'faqs'         => [['q'=>'Can I bring my own oil?','a'=>'Yes—price is reduced by the oil cost.']],
                'notes'        => 'SUVs and vans may require additional oil.',
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
                'summary'      => 'Inspection of pads, discs, lines and brake fluid level.',
                'duration_min' => 40,
                'included'     => ['Visual inspection','Measure pad thickness','Disc condition report','Fluid level check'],
                'excluded'     => ['Pad/disc replacement','Bleeding'],
                'preparation'  => ['Remove wheel locks from trunk','Park on level ground'],
                'policy'       => ['cancellation' => 'Free until 2h before.', 'warranty_days' => 0],
                'faqs'         => [['q'=>'Do you road-test?','a'=>'Short test if safe']],
                'notes'        => null,
            ]
        );

        $w2 = Workshop::updateOrCreate(
            ['name' => 'City Auto Care'],
            [
                'type'         => 'workshop',
                'rating'       => 4.3,
                'price_min'    => 25,
                'price_max'    => 150,
                'owner_user_id'=> $partner?->id,
                'lat'          => 52.5155,
                'lng'          => 13.3776,
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
                'summary'      => 'Cross-rotation to even out tire wear; torque to spec.',
                'duration_min' => 30,
                'included'     => ['Wheel removal','Cross-rotation','Torque to spec','Tire pressure set'],
                'excluded'     => ['Balancing','Alignment'],
                'preparation'  => ['Bring wheel lock key if applicable'],
                'policy'       => ['cancellation' => 'Free until 1h before.', 'warranty_days' => 0],
                'faqs'         => [['q'=>'Do you balance wheels?','a'=>'Not in this service, can be added.']],
                'notes'        => null,
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
                'summary'      => 'Performance check and leak detection (no refill).',
                'duration_min' => 35,
                'included'     => ['Pressure reading','Vent temp check','Visual leak check'],
                'excluded'     => ['Refrigerant refill','Cabin filter'],
                'preparation'  => ['Do not run AC 10 minutes before arrival'],
                'policy'       => ['cancellation' => 'Free until 2h before.', 'warranty_days' => 0],
                'faqs'         => [['q'=>'Do you add gas?','a'=>'Refill is a separate service.']],
                'notes'        => null,
            ]
        );

        // -------- Car wash providers --------
        $cw1 = Workshop::updateOrCreate(
            ['name' => 'Sparkle Wash'],
            [
                'type'         => 'carwash',
                'rating'       => 4.5,
                'price_min'    => 10,
                'price_max'    => 80,
                'owner_user_id'=> $partner?->id,
                'lat'          => 52.5208,
                'lng'          => 13.4095,
            ]
        );

        $cw2 = Workshop::updateOrCreate(
            ['name' => 'City Shine'],
            [
                'type'         => 'carwash',
                'rating'       => 4.2,
                'price_min'    => 8,
                'price_max'    => 70,
                'owner_user_id'=> $partner?->id,
                'lat'          => 52.5155,
                'lng'          => 13.3776,
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
                'summary'      => 'pH-neutral hand wash with safe drying.',
                'duration_min' => 25,
                'included'     => ['Pre-rinse & foam','Two-bucket wash','Wheel clean','Hand dry'],
                'excluded'     => ['Engine bay','Undercarriage'],
                'preparation'  => ['Fold mirrors if possible'],
                'policy'       => ['cancellation' => 'Free until 1h before.', 'warranty_days' => 2],
                'faqs'         => [['q'=>'Matte paint safe?','a'=>'Yes, no wax used.']],
                'notes'        => null,
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
                'summary'      => 'Vacuum, dusting and plastics wiped with gentle cleaner.',
                'duration_min' => 30,
                'included'     => ['Vacuum seats & mats','Plastics wiped','Windows inside'],
                'excluded'     => ['Shampoo extraction','Leather conditioning'],
                'preparation'  => ['Remove personal items'],
                'policy'       => ['cancellation' => 'Free until 1h before.', 'warranty_days' => 2],
                'faqs'         => [],
                'notes'        => null,
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
                'summary'      => 'Single-stage machine polish to enhance gloss.',
                'duration_min' => 90,
                'included'     => ['Paint decontamination','Single-stage polish','Panel wipe'],
                'excluded'     => ['Deep scratch removal','Ceramic coating'],
                'preparation'  => ['Vehicle must be clean (book wash first)'],
                'policy'       => ['cancellation' => 'Free until 24h before.', 'warranty_days' => 7],
                'faqs'         => [['q'=>'Removes swirls?','a'=>'Light swirls only; multi-stage correction not included.']],
                'notes'        => null,
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
                'summary'      => 'Quick exterior wash.',
                'duration_min' => 20,
                'included'     => ['Foam','Rinse','Dry'],
                'excluded'     => ['Wheel detailing'],
                'preparation'  => [],
                'policy'       => ['cancellation' => 'Free until 1h before.', 'warranty_days' => 1],
                'faqs'         => [],
                'notes'        => null,
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
                'summary'      => 'Basic interior tidy-up.',
                'duration_min' => 25,
                'included'     => ['Vacuum','Dusting','Windows inside'],
                'excluded'     => ['Deep stain removal'],
                'preparation'  => ['Remove trash and personal items'],
                'policy'       => ['cancellation' => 'Free until 1h before.', 'warranty_days' => 1],
                'faqs'         => [],
                'notes'        => null,
            ]
        );
    }
}
