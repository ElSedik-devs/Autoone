<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::table('parts', function (Blueprint $t) {
      if (!Schema::hasColumn('parts', 'owner_user_id')) {
        $t->foreignId('owner_user_id')
          ->nullable()
          ->after('id')
          ->constrained('users')
          ->nullOnDelete();
      }
      if (!Schema::hasColumn('parts', 'is_active')) {
        $t->boolean('is_active')->default(true)->after('stock');
      }
    });
  }
  public function down(): void {
    Schema::table('parts', function (Blueprint $t) {
      if (Schema::hasColumn('parts','owner_user_id')) $t->dropConstrainedForeignId('owner_user_id');
      if (Schema::hasColumn('parts','is_active')) $t->dropColumn('is_active');
    });
  }
};
