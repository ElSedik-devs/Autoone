<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->string('title');                  // e.g., "VW Golf 1.5 TSI"
            $table->unsignedSmallInteger('year');     // 2019
            $table->unsignedInteger('mileage_km')->nullable();
            $table->enum('fuel', ['petrol','diesel','hybrid','ev']);
            $table->enum('condition', ['new','used']);
            $table->decimal('price', 10, 2);
            $table->string('thumbnail_url')->nullable();
            $table->json('images')->nullable();       // array of URLs
            $table->json('specs')->nullable();        // { "Power": "96 kW", ... }
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('cars');
    }
};
