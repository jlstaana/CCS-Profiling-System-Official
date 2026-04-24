<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Course;
use App\Models\Schedule;
use App\Models\Enrollment;
use App\Models\StudentGrade;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password123');

        // ── 1. Faculty (5 professors) ────────────────────────────────────
        $facultyData = [
            ['name' => 'Prof. Ricardo Dela Cruz',  'email' => 'rdelacruz@ccs.edu',  'specialization' => 'Web Technologies',          'department' => 'Information Technology'],
            ['name' => 'Prof. Maricel Santos',      'email' => 'msantos@ccs.edu',    'specialization' => 'Database Systems',            'department' => 'Information Technology'],
            ['name' => 'Prof. Jose Garcia',         'email' => 'jgarcia@ccs.edu',    'specialization' => 'Algorithms & Data Structures','department' => 'Computer Science'],
            ['name' => 'Prof. Ana Reyes',           'email' => 'areyes@ccs.edu',     'specialization' => 'Software Engineering',        'department' => 'Computer Science'],
            ['name' => 'Prof. Miguel Bautista',     'email' => 'mbautista@ccs.edu',  'specialization' => 'Networking & Security',       'department' => 'Information Technology'],
        ];

        $faculty = [];
        foreach ($facultyData as $fd) {
            $faculty[] = User::firstOrCreate(
                ['email' => $fd['email']],
                [
                    'name'           => $fd['name'],
                    'password'       => $password,
                    'role'           => 'faculty',
                    'department'     => $fd['department'],
                    'specialization' => $fd['specialization'],
                ]
            );
        }

        // ── 2. Courses (8 courses mapped to faculty) ─────────────────────
        $courseDefs = [
            ['code' => 'ITEW6',  'title' => 'Web Systems and Technologies',       'faculty_idx' => 0],
            ['code' => 'CC105',  'title' => 'Information Management',              'faculty_idx' => 1],
            ['code' => 'IT105',  'title' => 'Database Systems',                    'faculty_idx' => 1],
            ['code' => 'CC104',  'title' => 'Data Structures and Algorithms',      'faculty_idx' => 2],
            ['code' => 'CS103',  'title' => 'Software Engineering 1',              'faculty_idx' => 3],
            ['code' => 'IT103',  'title' => 'Networking 1',                        'faculty_idx' => 4],
            ['code' => 'IT104',  'title' => 'Information Assurance and Security',  'faculty_idx' => 4],
            ['code' => 'CC102',  'title' => 'Fundamentals of Programming',         'faculty_idx' => 2],
        ];

        $courses = [];
        foreach ($courseDefs as $cd) {
            $courses[] = Course::firstOrCreate(
                ['code' => $cd['code']],
                [
                    'title'      => $cd['title'],
                    'created_by' => $faculty[$cd['faculty_idx']]->id,
                ]
            );
        }

        // ── 3. Schedules (one schedule per course) ───────────────────────
        $days      = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $timeSlots = [
            ['7:00 AM',  '9:00 AM'],
            ['9:00 AM',  '11:00 AM'],
            ['11:00 AM', '1:00 PM'],
            ['1:00 PM',  '3:00 PM'],
            ['3:00 PM',  '5:00 PM'],
        ];
        $sections   = ['A', 'B', 'C'];
        $programs   = ['BSIT', 'BSCS'];
        $yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

        foreach ($courses as $i => $course) {
            $existing = Schedule::where('course_id', $course->id)->first();
            if (!$existing) {
                [$ts, $te] = $timeSlots[$i % count($timeSlots)];
                Schedule::create([
                    'course_id'  => $course->id,
                    'day'        => $days[$i % count($days)],
                    'time_start' => $ts,
                    'time_end'   => $te,
                    'room'       => 'Room ' . (300 + $i + 1),
                    'year_level' => $yearLevels[$i % count($yearLevels)],
                    'section'    => $sections[$i % count($sections)],
                    'program'    => $programs[$i % count($programs)],
                ]);
            }
        }

        // ── 4. Students (30 realistic Filipino students) ─────────────────
        $firstNames = [
            'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Michelle', 'Kevin', 'Christine',
            'Mark', 'Angel', 'Bryan', 'Sarah', 'Dennis', 'Rhea', 'Angelo', 'Kaye',
            'Ryan', 'Grace', 'Joel', 'Joy', 'Erwin', 'Jessa', 'Paolo', 'Cherry',
            'Vincent', 'Jane', 'Christian', 'Princess', 'Michael', 'Catherine',
        ];
        $lastNames = [
            'Dela Cruz', 'Reyes', 'Santos', 'Garcia', 'Ramos', 'Mendoza',
            'Flores', 'Gonzales', 'Bautista', 'Villanueva', 'Fernandez', 'Cruz',
            'Ocampo', 'Navarro', 'Corpuz', 'Alvarez', 'Domingo', 'Castillo',
            'Rivera', 'Perez', 'Aquino', 'Marquez', 'Sarmiento', 'Pascual',
            'Gomez', 'Del Rosario', 'Soriano', 'Palma', 'De Leon', 'Tolentino',
        ];
        $studentPrograms = ['BSIT', 'BSCS'];
        $studentDepts    = ['Information Technology', 'Computer Science'];
        $studentYears    = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

        $students = [];
        for ($i = 0; $i < 30; $i++) {
            $firstName = $firstNames[$i];
            $lastName  = $lastNames[$i];
            $fullName  = $firstName . ' ' . $lastName;
            $progIdx   = $i % 2;
            $email     = strtolower(str_replace(' ', '.', $firstName . '_' . $lastName))
                       . ($i + 100) . '@student.ccs.edu.ph';

            $student = User::firstOrCreate(
                ['email' => $email],
                [
                    'name'       => $fullName,
                    'password'   => $password,
                    'role'       => 'student',
                    'department' => $studentDepts[$progIdx],
                    'course'     => $studentPrograms[$progIdx],
                    'year'       => $studentYears[$i % 4],
                ]
            );
            $students[] = $student;
        }

        // ── 5. Enrollments & Grades ──────────────────────────────────────
        // Each student is enrolled in 2-4 randomly chosen courses
        $semester    = 'First Semester';
        $academicYear = '2024-2025';

        // Faculty mapped to courses (same index as $courses / $courseDefs)
        $courseFacultyMap = [];
        foreach ($courses as $i => $course) {
            $fIdx = $courseDefs[$i]['faculty_idx'];
            $courseFacultyMap[$course->id] = $faculty[$fIdx]->id;
        }

        $courseIds = collect($courses)->pluck('id')->toArray();

        $gradeOptions = [
            // [prelim, midterm, finals]
            [92, 88, 90], [85, 80, 83], [78, 76, 80], [95, 97, 96],
            [70, 72, 75], [88, 90, 91], [60, 65, 68], [75, 78, 80],
            [82, 84, 86], [55, 58, 60],
        ];

        foreach ($students as $si => $student) {
            // Pick 2-4 courses for this student
            $numCourses = rand(2, 4);
            $shuffled   = $courseIds;
            shuffle($shuffled);
            $enrolledIds = array_slice($shuffled, 0, $numCourses);

            foreach ($enrolledIds as $courseId) {
                // Enrollment
                $exists = Enrollment::where('student_id', $student->id)
                    ->where('course_id', $courseId)
                    ->where('semester', $semester)
                    ->where('academic_year', $academicYear)
                    ->exists();

                if (!$exists) {
                    Enrollment::create([
                        'student_id'    => $student->id,
                        'course_id'     => $courseId,
                        'semester'      => $semester,
                        'academic_year' => $academicYear,
                    ]);
                }

                // Grade (not all students have grades yet — 80% chance)
                if (rand(1, 10) <= 8) {
                    $gradeSet  = $gradeOptions[($si + $courseId) % count($gradeOptions)];
                    [$prelim, $midterm, $finals] = $gradeSet;
                    $avg = round(($prelim + $midterm + $finals) / 3);

                    if ($avg >= 96)      $grade = '1.00';
                    elseif ($avg >= 92)  $grade = '1.25';
                    elseif ($avg >= 88)  $grade = '1.50';
                    elseif ($avg >= 84)  $grade = '1.75';
                    elseif ($avg >= 80)  $grade = '2.00';
                    elseif ($avg >= 75)  $grade = '2.25';
                    elseif ($avg >= 70)  $grade = '2.50';
                    elseif ($avg >= 65)  $grade = '2.75';
                    elseif ($avg >= 60)  $grade = '3.00';
                    else                 $grade = '5.00';

                    $remarks = ($grade === '5.00') ? 'FAILED' : 'PASSED';

                    StudentGrade::updateOrCreate(
                        [
                            'student_id'    => $student->id,
                            'course_id'     => $courseId,
                            'faculty_id'    => $courseFacultyMap[$courseId],
                            'semester'      => $semester,
                            'academic_year' => $academicYear,
                        ],
                        [
                            'prelim'   => $prelim,
                            'midterm'  => $midterm,
                            'finals'   => $finals,
                            'grade'    => $grade,
                            'remarks'  => $remarks,
                        ]
                    );
                }
            }
        }

        $this->command->info('✅ DemoDataSeeder complete: 5 faculty, 8 courses, 30 students, enrollments & grades seeded.');
    }
}
