<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('workshops', function (Blueprint $table) {
            $table->string('type')->default('workshop')->after('id'); // workshop | carwash
            // Optional coords (if you want map pins now)
            if (!Schema::hasColumn('workshops', 'lat')) $table->decimal('lat', 10, 7)->nullable()->after('rating');
            if (!Schema::hasColumn('workshops', 'lng')) $table->decimal('lng', 10, 7)->nullable()->after('lat');
        });
    }

    public function down(): void
    {
        Schema::table('workshops', function (Blueprint $table) {
            if (Schema::hasColumn('workshops', 'type')) $table->dropColumn('type');
            if (Schema::hasColumn('workshops', 'lat')) $table->dropColumn('lat');
            if (Schema::hasColumn('workshops', 'lng')) $table->dropColumn('lng');
        });
    }
};
