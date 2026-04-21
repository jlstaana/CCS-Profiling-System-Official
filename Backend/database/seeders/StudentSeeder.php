<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Faker\Factory as Faker;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        // Try en_PH locale for Filipino names, fallback to default if not fully supported but manual arrays help guarantee context.
        $faker = Faker::create('en_PH');

        $firstNames = ['Juan', 'Jose', 'Maria', 'Ana', 'Pedro', 'Miguel', 'Carlos', 'Luis', 'Antonio', 'Francisco', 'Manuel', 'Raymund', 'Jayson', 'Kevin', 'Mark', 'John', 'Christian', 'Michael', 'Angelo', 'Paolo', 'Vincent', 'Ryan', 'Joel', 'Erwin', 'Bryan', 'Dennis', 'Edgar', 'Rico', 'Rene', 'Romeo', 'Mary', 'Jane', 'Princess', 'Angel', 'Christine', 'Michelle', 'Sarah', 'Joy', 'Grace', 'Anna', 'Diane', 'Catherine', 'Cherry', 'Jessa', 'Rhea', 'Kaye'];
        $lastNames = ['Dela Cruz', 'Garcia', 'Reyes', 'Ramos', 'Mendoza', 'Santos', 'Flores', 'Gonzales', 'Bautista', 'Villanueva', 'Fernandez', 'Cruz', 'De Leon', 'Ocampo', 'Navarro', 'Tolentino', 'Corpuz', 'Alvarez', 'Domingo', 'Valdez', 'Del Rosario', 'Soriano', 'Palma', 'Castillo', 'Rivera', 'Perez', 'Aquino', 'Marquez', 'Sarmiento', 'Pascual', 'Gomez'];
        $courses = ['BSIT', 'BSCS'];
        $departments = ['Information Technology', 'Computer Science'];
        $years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

        $users = [];
        $password = Hash::make('password123'); // standard mock password

        for ($i = 0; $i < 500; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            // randomize a bit using faker to add variety or initials
            $fullName = $firstName . ' ' . $lastName;
            $email = strtolower(str_replace(' ', '.', $firstName . '_' . $lastName)) . random_int(100, 9999) . '@student.ccs.edu.ph';
            
            $cIndex = array_rand($courses);

            $users[] = [
                'name' => $fullName,
                'email' => $email,
                'password' => $password,
                'role' => 'student',
                'department' => $departments[$cIndex],
                'course' => $courses[$cIndex],
                'year' => $years[array_rand($years)],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Chunk insert to avoid memory/packet exhaustion on 500 items
        foreach (array_chunk($users, 100) as $chunk) {
            User::insert($chunk);
        }
    }
}
