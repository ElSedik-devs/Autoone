<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('parts', function (Blueprint $t) {
      $t->id();
      $t->enum('category', ['tires','brakes','batteries','oils','accessories']);
      $t->string('name');
      $t->decimal('price', 10, 2);
      $t->unsignedInteger('stock')->default(0);
      $t->string('image_url')->nullable();
      $t->json('compat')->nullable();   // e.g. ["VW Golf", "BMW 3"]
      $t->text('description')->nullable();
      $t->timestamps();
    });
  }
  public function down(): void {
    Schema::dropIfExists('parts');
  }
};
