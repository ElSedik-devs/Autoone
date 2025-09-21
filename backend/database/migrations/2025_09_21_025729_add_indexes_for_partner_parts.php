<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::table('parts', function (Blueprint $t) {
      if (!Schema::hasColumn('parts','owner_user_id')) return;
      $t->index(['owner_user_id','category']);
    });
    Schema::table('part_orders', function (Blueprint $t) {
      if (!Schema::hasColumn('part_orders','part_id')) return;
      $t->index(['part_id','status']);
    });
  }
  public function down(): void {
    Schema::table('parts', function (Blueprint $t) {
      $t->dropIndex(['owner_user_id','category']);
    });
    Schema::table('part_orders', function (Blueprint $t) {
      $t->dropIndex(['part_id','status']);
    });
  }
};
