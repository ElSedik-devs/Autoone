<?php

// database/migrations/2025_09_22_103920_add_info_fields_to_services_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('services', function (Blueprint $t) {
            $t->text('summary')->nullable();
            $t->unsignedSmallInteger('duration_min')->nullable();
            $t->json('included')->nullable();
            $t->json('excluded')->nullable();
            $t->json('preparation')->nullable();
            $t->json('policy')->nullable();
            $t->json('faqs')->nullable();
            $t->text('notes')->nullable();
            // REMOVE: $t->json('title_translations')->nullable();
        });
    }

    public function down(): void {
        Schema::table('services', function (Blueprint $t) {
            $t->dropColumn([
                'summary','duration_min','included','excluded',
                'preparation','policy','faqs','notes',
                // REMOVE from drop list: 'title_translations'
            ]);
        });
    }
};
