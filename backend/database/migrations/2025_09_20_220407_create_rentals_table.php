<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->year('year')->nullable();
            $table->decimal('price_per_day', 10, 2);
            $table->decimal('price_per_week', 10, 2)->nullable();
            $table->decimal('price_per_month', 10, 2)->nullable();
            $table->enum('provider_type', ['company', 'individual'])->default('company');
            $table->string('location')->nullable(); // city / region
            $table->unsignedBigInteger('owner_user_id')->nullable();
            $table->text('description')->nullable();
            $table->json('images')->nullable(); // store array of image URLs
            $table->timestamps();

            $table->foreign('owner_user_id')
                  ->references('id')->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
