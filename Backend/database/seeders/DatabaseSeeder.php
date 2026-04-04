<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Schedule;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Demo Users ───────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin123@ccs.edu'],
            ['name' => 'Demo Admin', 'password' => bcrypt('any'), 'role' => 'admin']
        );

        User::firstOrCreate(
            ['email' => 'faculty123@ccs.edu'],
            ['name' => 'Demo Faculty', 'password' => bcrypt('any'), 'role' => 'faculty', 'department' => 'Computer Science']
        );

        User::firstOrCreate(
            ['email' => 'student123@ccs.edu'],
            ['name' => 'Demo Student', 'password' => bcrypt('any'), 'role' => 'student', 'course' => 'BSCS']
        );
    }
}
