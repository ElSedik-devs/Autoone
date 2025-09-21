<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (Schema::hasTable('bookings') && !Schema::hasColumn('bookings','price')) {
            Schema::table('bookings', function (Blueprint $t) {
                $t->decimal('price', 10, 2)->nullable()->after('status');
            });
        }
    }
    public function down(): void {
        if (Schema::hasTable('bookings') && Schema::hasColumn('bookings','price')) {
            Schema::table('bookings', function (Blueprint $t) {
                $t->dropColumn('price');
            });
        }
    }
};
