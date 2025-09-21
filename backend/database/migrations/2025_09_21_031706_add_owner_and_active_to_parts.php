<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('parts', function (Blueprint $t) {
            if (!Schema::hasColumn('parts', 'owner_user_id')) {
                $t->foreignId('owner_user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('parts', 'is_active')) {
                $t->boolean('is_active')->default(true)->after('stock');
            }
            if (!Schema::hasColumn('parts', 'compat_models')) {
                $t->json('compat_models')->nullable()->after('compat');
            }
            if (!Schema::hasColumn('parts', 'vin_codes')) {
                $t->json('vin_codes')->nullable()->after('compat_models');
            }
        });
    }

    public function down(): void
    {
        Schema::table('parts', function (Blueprint $t) {
            if (Schema::hasColumn('parts', 'vin_codes')) $t->dropColumn('vin_codes');
            if (Schema::hasColumn('parts', 'compat_models')) $t->dropColumn('compat_models');
            if (Schema::hasColumn('parts', 'is_active')) $t->dropColumn('is_active');
            if (Schema::hasColumn('parts', 'owner_user_id')) $t->dropConstrainedForeignId('owner_user_id');
        });
    }
};
