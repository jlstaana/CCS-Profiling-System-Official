<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('gender')->nullable()->after('nationality');
            $table->string('zip_code')->nullable()->after('gender');
            $table->string('guardian_name')->nullable()->after('zip_code');
            $table->string('guardian_relationship')->nullable()->after('guardian_name');
            $table->string('guardian_contact')->nullable()->after('guardian_relationship');
            $table->text('guardian_address')->nullable()->after('guardian_contact');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'gender',
                'zip_code',
                'guardian_name',
                'guardian_relationship',
                'guardian_contact',
                'guardian_address',
            ]);
        });
    }
};
