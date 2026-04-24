<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('curriculums', function (Blueprint $table) {
            $table->string('curriculum_year')->default('2024-2025')->after('program');
        });

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->enum('student_status', ['Regular', 'Irregular'])->default('Regular')->after('nationality');
        });
    }

    public function down(): void
    {
        Schema::table('curriculums', function (Blueprint $table) {
            $table->dropColumn('curriculum_year');
        });

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn('student_status');
        });
    }
};
