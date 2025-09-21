<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('rental_bookings', function (Blueprint $table) {
            // place notes after status, make it optional
            if (!Schema::hasColumn('rental_bookings', 'notes')) {
                $table->text('notes')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rental_bookings', function (Blueprint $table) {
            if (Schema::hasColumn('rental_bookings', 'notes')) {
                $table->dropColumn('notes');
            }
        });
    }
};
