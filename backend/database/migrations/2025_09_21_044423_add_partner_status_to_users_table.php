// backend/database/migrations/2025_09_21_000300_add_partner_status_to_users.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users','partner_status')) {
                $table->string('partner_status', 20)->nullable()->after('role');
            }
        });
        // auto-approve existing partners so you don't lock yourself out
        DB::table('users')
          ->where('role', 'partner')
          ->whereNull('partner_status')
          ->update(['partner_status' => 'approved']);
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users','partner_status')) {
                $table->dropColumn('partner_status');
            }
        });
    }
};
