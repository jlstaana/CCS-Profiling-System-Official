<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class StudentSeeder extends Seeder
{
    use GeneratesUserId;

    public function run(): void
    {
        $faker = \Faker\Factory::create('en_PH');

        $firstNames = ['Juan', 'Jose', 'Maria', 'Ana', 'Pedro', 'Miguel', 'Carlos', 'Luis', 'Antonio', 'Francisco',
                       'Manuel', 'Raymund', 'Jayson', 'Kevin', 'Mark', 'John', 'Christian', 'Michael', 'Angelo', 'Paolo',
                       'Vincent', 'Ryan', 'Joel', 'Erwin', 'Bryan', 'Dennis', 'Edgar', 'Rico', 'Rene', 'Romeo',
                       'Mary', 'Jane', 'Princess', 'Angel', 'Christine', 'Michelle', 'Sarah', 'Joy', 'Grace', 'Anna',
                       'Diane', 'Catherine', 'Cherry', 'Jessa', 'Rhea', 'Kaye'];

        $lastNames = ['Dela Cruz', 'Garcia', 'Reyes', 'Ramos', 'Mendoza', 'Santos', 'Flores', 'Gonzales',
                      'Bautista', 'Villanueva', 'Fernandez', 'Cruz', 'De Leon', 'Ocampo', 'Navarro',
                      'Tolentino', 'Corpuz', 'Alvarez', 'Domingo', 'Valdez', 'Del Rosario', 'Soriano',
                      'Palma', 'Castillo', 'Rivera', 'Perez', 'Aquino', 'Marquez', 'Sarmiento', 'Pascual', 'Gomez'];

        $courses     = ['BSIT', 'BSCS'];
        $departments = ['Information Technology', 'Computer Science'];
        $years       = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        $password    = Hash::make('password123');

        $users = [];

        for ($i = 0; $i < 500; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName  = $lastNames[array_rand($lastNames)];
            $cIndex    = array_rand($courses);

            $users[] = [
                // Random irregular student ID  S-20XX-XXXX  (varied admission year + random number)
                'user_id'    => $this->genUserId('student', 0, true),
                'name'       => "{$firstName} {$lastName}",
                'email'      => strtolower("{$firstName}_{$lastName}") . random_int(100, 9999) . '@student.ccs.edu.ph',
                'password'   => $password,
                'role'       => 'student',
                'department' => $departments[$cIndex],
                'course'     => $courses[$cIndex],
                'year'       => $years[array_rand($years)],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert in chunks; skip any e-mail collisions silently
        foreach (array_chunk($users, 100) as $chunk) {
            try {
                User::insert($chunk);
            } catch (\Illuminate\Database\QueryException $e) {
                // Duplicate email or user_id — regenerate individually
                foreach ($chunk as $row) {
                    try {
                        User::insert([$row]);
                    } catch (\Illuminate\Database\QueryException) {
                        // skip genuine duplicates
                    }
                }
            }
        }

        $this->command->info('✅ StudentSeeder: 500 students seeded with random irregular S-20XX-XXXX IDs.');
    }
}
