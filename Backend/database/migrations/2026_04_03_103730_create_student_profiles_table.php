<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            
            // Personal Info (More detailed)
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('nationality')->nullable();
            
            // JSON Columns for Multi-entry data
            $table->json('academic_history')->nullable();      // [{school, degree, year}]
            $table->json('non_academic_activities')->nullable(); // [strings or {title, date}]
            $table->json('skills')->nullable();                // [strings]
            $table->json('affiliations')->nullable();         // [strings or {org, role}]
            
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('student_profiles');
    }
};
