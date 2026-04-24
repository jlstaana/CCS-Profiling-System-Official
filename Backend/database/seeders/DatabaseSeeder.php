<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Schedule;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents, GeneratesUserId;

    public function run(): void
    {
        // ── Demo Users (with clean auto-generated IDs) ────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin123@ccs.edu'],
            [
                'user_id'  => $this->genUserId('admin',   2024),
                'name'     => 'Demo Admin',
                'password' => bcrypt('any'),
                'role'     => 'admin',
            ]
        );
        if (!$admin->user_id) {
            $admin->user_id = $this->genUserId('admin', 2024);
            $admin->save();
        }

        $facultyDemo = User::firstOrCreate(
            ['email' => 'faculty123@ccs.edu'],
            [
                'user_id'    => $this->genUserId('faculty', 2024),
                'name'       => 'Demo Faculty',
                'password'   => bcrypt('any'),
                'role'       => 'faculty',
                'department' => 'Computer Science',
            ]
        );
        if (!$facultyDemo->user_id) {
            $facultyDemo->user_id = $this->genUserId('faculty', 2024);
            $facultyDemo->save();
        }

        $studentDemo = User::firstOrCreate(
            ['email' => 'student123@ccs.edu'],
            [
                'user_id' => $this->genUserId('student', 2024, true),
                'name'    => 'Demo Student',
                'password'=> bcrypt('any'),
                'role'    => 'student',
                'course'  => 'BSCS',
            ]
        );
        if (!$studentDemo->user_id) {
            $studentDemo->user_id = $this->genUserId('student', 2024, true);
            $studentDemo->save();
        }

        // ── Rich Demo Data ────────────────────────────────────────
        $this->call([
            DemoDataSeeder::class,
        ]);

        // ── Patch any remaining users without a user_id ───────────
        $this->backfillUserIds();

        $this->command->info('✅ DatabaseSeeder complete – all users have clean IDs.');
    }
}
