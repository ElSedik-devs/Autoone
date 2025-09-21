<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('part_orders', function (Blueprint $t) {
      $t->id();
      $t->foreignId('user_id')->constrained()->cascadeOnDelete();
      $t->foreignId('part_id')->constrained('parts')->cascadeOnDelete();
      $t->unsignedInteger('qty');
      $t->decimal('unit_price', 10, 2);
      $t->decimal('total_price', 10, 2);
      $t->enum('status', ['submitted','processing','completed','cancelled'])->default('submitted');
      $t->text('notes')->nullable();
      $t->timestamps();
    });
  }
  public function down(): void {
    Schema::dropIfExists('part_orders');
  }
};
