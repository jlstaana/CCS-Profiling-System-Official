<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');     // Student
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade'); // Faculty / Admin
            $table->string('type');        // Dress Code, Late, Academic, etc.
            $table->text('description');
            $table->string('status')->default('pending'); // pending, resolved, contested
            $table->dateTime('date_occurred');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('violations');
    }
};
