<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            if (!Schema::hasColumn('users', 'partner_approved_at')) {
                $t->timestamp('partner_approved_at')->nullable()->after('partner_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $t) {
            if (Schema::hasColumn('users', 'partner_approved_at')) {
                $t->dropColumn('partner_approved_at');
            }
        });
    }
};
