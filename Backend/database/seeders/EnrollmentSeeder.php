<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role', 'student')->pluck('id')->toArray();
        $courses = Course::pluck('id')->toArray();

        // Check if there are any courses first
        if (empty($courses)) {
            // Seed a few dummy courses if none exist
            $course1 = Course::create(['code' => 'ITEW6', 'title' => 'Web Systems and Technologies', 'created_by' => 1]);
            $course2 = Course::create(['code' => 'IT101', 'title' => 'Intro to Computing', 'created_by' => 1]);
            $courses = [$course1->id, $course2->id];
        }

        $enrollments = [];
        $semester = 'First Semester';
        $academicYear = '2023-2024';

        foreach ($students as $studentId) {
            // Randomly enroll each student in 1-3 courses
            $numCourses = rand(1, min(3, count($courses)));
            $enrolledCourses = (array) array_rand(array_flip($courses), $numCourses);

            foreach ($enrolledCourses as $courseId) {
                $enrollments[] = [
                    'student_id' => $studentId,
                    'course_id' => $courseId,
                    'semester' => $semester,
                    'academic_year' => $academicYear,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        foreach (array_chunk($enrollments, 100) as $chunk) {
            Enrollment::insert($chunk);
        }
    }
}
