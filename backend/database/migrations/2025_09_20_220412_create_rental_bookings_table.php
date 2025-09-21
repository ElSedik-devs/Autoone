<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rental_bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rental_id');
            $table->unsignedBigInteger('user_id');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->decimal('total_price', 10, 2);
            $table->string('status')->default('pending'); // pending, confirmed, cancelled
            $table->timestamps();

            $table->foreign('rental_id')
                  ->references('id')->on('rentals')
                  ->onDelete('cascade');
            $table->foreign('user_id')
                  ->references('id')->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_bookings');
    }
};
