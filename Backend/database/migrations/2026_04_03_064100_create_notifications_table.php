<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');   // recipient
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade'); // who triggered it
            $table->string('type');   // connection_request, connection_accepted, post_like, post_comment, new_message, new_post, profile_approved, profile_rejected
            $table->string('message');
            $table->string('link')->nullable();
            $table->boolean('read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('notifications');
    }
};
