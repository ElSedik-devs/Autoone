<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('import_listings', function (Blueprint $t) {
      $t->id();
      $t->enum('region', ['europe','china','usa']);
      $t->string('make');
      $t->string('model');
      $t->unsignedSmallInteger('year_from')->nullable();
      $t->unsignedSmallInteger('year_to')->nullable();
      $t->decimal('base_price', 10, 2); // purchase price at source
      $t->string('image_url')->nullable();
      $t->timestamps();
    });
  }

  public function down(): void {
    Schema::dropIfExists('import_listings');
  }
};
