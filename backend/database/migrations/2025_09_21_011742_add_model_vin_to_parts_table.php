<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::table('parts', function (Blueprint $t) {
      if (!Schema::hasColumn('parts', 'compat_models')) {
        $t->json('compat_models')->nullable()->after('compat'); // ["VW Golf","BMW 3"]
      }
      if (!Schema::hasColumn('parts', 'vin_codes')) {
        $t->json('vin_codes')->nullable()->after('compat_models'); // ["WVWZZZ1JZXW000001"]
      }
    });
  }
  public function down(): void {
    Schema::table('parts', function (Blueprint $t) {
      if (Schema::hasColumn('parts', 'compat_models')) $t->dropColumn('compat_models');
      if (Schema::hasColumn('parts', 'vin_codes')) $t->dropColumn('vin_codes');
    });
  }
};
