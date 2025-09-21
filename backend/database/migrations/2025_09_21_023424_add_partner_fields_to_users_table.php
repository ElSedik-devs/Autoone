<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $t) {
            if (!Schema::hasColumn('users','business_type')) {
                $t->enum('business_type', ['workshop','carwash','rental','parts'])->nullable()->after('role');
            }
            if (!Schema::hasColumn('users','company_name')) {
                $t->string('company_name')->nullable()->after('business_type');
            }
            if (!Schema::hasColumn('users','phone')) {
                $t->string('phone')->nullable()->after('company_name');
            }
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $t) {
            if (Schema::hasColumn('users','phone')) $t->dropColumn('phone');
            if (Schema::hasColumn('users','company_name')) $t->dropColumn('company_name');
            if (Schema::hasColumn('users','business_type')) $t->dropColumn('business_type');
        });
    }
};
