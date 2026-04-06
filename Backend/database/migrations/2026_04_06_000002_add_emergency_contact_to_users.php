<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('gender')->nullable()->after('bio');
            $table->string('zip_code')->nullable()->after('gender');
            $table->string('emergency_contact_name')->nullable()->after('zip_code');
            $table->string('emergency_contact_relationship')->nullable()->after('emergency_contact_name');
            $table->string('emergency_contact_number')->nullable()->after('emergency_contact_relationship');
            $table->text('emergency_contact_address')->nullable()->after('emergency_contact_number');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'gender',
                'zip_code',
                'emergency_contact_name',
                'emergency_contact_relationship',
                'emergency_contact_number',
                'emergency_contact_address',
            ]);
        });
    }
};
