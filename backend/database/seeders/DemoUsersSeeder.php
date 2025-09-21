<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'user@auto.one'],
            ['name' => 'Sara User', 'password' => Hash::make('pass'), 'role' => 'user']
        );

        User::updateOrCreate(
            ['email' => 'partner@auto.one'],
            ['name' => 'Peter Partner', 'password' => Hash::make('pass'), 'role' => 'partner']
        );

        User::updateOrCreate(
            ['email' => 'admin@auto.one'],
            ['name' => 'Amal Admin', 'password' => Hash::make('pass'), 'role' => 'admin']
        );
    }
}
