<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('rental_bookings', function (Blueprint $table) {
            // hour/day/week/month/year
            if (!Schema::hasColumn('rental_bookings', 'unit')) {
                $table->string('unit', 10)->default('day')->after('end_date');
            }
            if (!Schema::hasColumn('rental_bookings', 'contract_path')) {
                $table->string('contract_path')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rental_bookings', function (Blueprint $table) {
            if (Schema::hasColumn('rental_bookings', 'unit')) $table->dropColumn('unit');
            if (Schema::hasColumn('rental_bookings', 'contract_path')) $table->dropColumn('contract_path');
        });
    }
};
