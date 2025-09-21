<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('import_orders', function (Blueprint $t) {
      $t->id();
      $t->foreignId('user_id')->constrained()->cascadeOnDelete();
      $t->enum('region', ['europe','china','usa']);
      $t->string('make');
      $t->string('model');
      $t->unsignedSmallInteger('year')->nullable();
      $t->string('vin')->nullable();
      $t->string('destination_country')->default('DE'); // default Germany
      $t->text('notes')->nullable();

      // Estimation at submission time
      $t->decimal('purchase_price', 10, 2);
      $t->json('estimate_breakdown'); // {shipping, customs, vat, handling, total}
      $t->decimal('total_estimated', 10, 2);

      $t->enum('status', ['submitted','review','quoted','ordered','cancelled'])->default('submitted');

      $t->timestamps();
    });
  }

  public function down(): void {
    Schema::dropIfExists('import_orders');
  }
};
