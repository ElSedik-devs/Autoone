<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users','role')) $table->string('role')->default('user')->after('password');
            if (!Schema::hasColumn('users','business_type')) $table->string('business_type')->nullable()->after('role'); // workshop|carwash|rental|parts
            if (!Schema::hasColumn('users','company_name')) $table->string('company_name')->nullable()->after('business_type');
            if (!Schema::hasColumn('users','phone')) $table->string('phone', 40)->nullable()->after('company_name');
            if (!Schema::hasColumn('users','preferred_language')) $table->string('preferred_language', 5)->nullable()->after('phone'); // en|de|ar
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users','preferred_language')) $table->dropColumn('preferred_language');
            if (Schema::hasColumn('users','phone')) $table->dropColumn('phone');
            if (Schema::hasColumn('users','company_name')) $table->dropColumn('company_name');
            if (Schema::hasColumn('users','business_type')) $table->dropColumn('business_type');
            // keep role
        });
    }
};
