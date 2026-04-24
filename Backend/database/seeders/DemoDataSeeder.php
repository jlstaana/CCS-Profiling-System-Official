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
    use GeneratesUserId;

    public function run(): void
    {
        $password = Hash::make('password123');

        // ── 1. Faculty (5 professors) with clean F-YYYY-NNNN IDs ─────────
        $facultyData = [
            ['name' => 'Prof. Ricardo Dela Cruz', 'email' => 'rdelacruz@ccs.edu', 'specialization' => 'Web Technologies',           'department' => 'Information Technology'],
            ['name' => 'Prof. Maricel Santos',     'email' => 'msantos@ccs.edu',   'specialization' => 'Database Systems',             'department' => 'Information Technology'],
            ['name' => 'Prof. Jose Garcia',        'email' => 'jgarcia@ccs.edu',   'specialization' => 'Algorithms & Data Structures', 'department' => 'Computer Science'],
            ['name' => 'Prof. Ana Reyes',          'email' => 'areyes@ccs.edu',    'specialization' => 'Software Engineering',         'department' => 'Computer Science'],
            ['name' => 'Prof. Miguel Bautista',    'email' => 'mbautista@ccs.edu', 'specialization' => 'Networking & Security',        'department' => 'Information Technology'],
        ];

        $faculty = [];
        foreach ($facultyData as $fd) {
            $existing = User::where('email', $fd['email'])->first();
            if ($existing) {
                // Backfill user_id if missing
                if (!$existing->user_id) {
                    $existing->user_id = $this->genUserId('faculty', 2023);
                    $existing->save();
                }
                $faculty[] = $existing;
                continue;
            }
            $faculty[] = User::create([
                'user_id'        => $this->genUserId('faculty', 2023),   // F-2023-0001 style
                'name'           => $fd['name'],
                'email'          => $fd['email'],
                'password'       => $password,
                'role'           => 'faculty',
                'department'     => $fd['department'],
                'specialization' => $fd['specialization'],
            ]);
        }

        // ── 2. Courses ───────────────────────────────────────────────────
        $courseDefs = [
            ['code' => 'ITEW6', 'title' => 'Web Systems and Technologies',      'fi' => 0],
            ['code' => 'CC105', 'title' => 'Information Management',             'fi' => 1],
            ['code' => 'IT105', 'title' => 'Database Systems',                   'fi' => 1],
            ['code' => 'CC104', 'title' => 'Data Structures and Algorithms',     'fi' => 2],
            ['code' => 'CS103', 'title' => 'Software Engineering 1',             'fi' => 3],
            ['code' => 'IT103', 'title' => 'Networking 1',                       'fi' => 4],
            ['code' => 'IT104', 'title' => 'Information Assurance and Security', 'fi' => 4],
            ['code' => 'CC102', 'title' => 'Fundamentals of Programming',        'fi' => 2],
        ];

        $courses = [];
        foreach ($courseDefs as $cd) {
            $courses[] = Course::firstOrCreate(
                ['code' => $cd['code']],
                ['title' => $cd['title'], 'created_by' => $faculty[$cd['fi']]->id]
            );
        }

        // ── 3. Schedules ─────────────────────────────────────────────────
        $days       = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        $timeSlots  = [
            ['7:00 AM','9:00 AM'], ['9:00 AM','11:00 AM'], ['11:00 AM','1:00 PM'],
            ['1:00 PM','3:00 PM'], ['3:00 PM','5:00 PM'],
        ];
        $yearLevels = ['1st Year','2nd Year','3rd Year','4th Year'];
        $sections   = ['A','B','C'];
        $programs   = ['BSIT','BSCS'];

        foreach ($courses as $i => $course) {
            if (!Schedule::where('course_id', $course->id)->exists()) {
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

        // ── 4. Students with RANDOM IRREGULAR IDs (S-20XX-XXXX) ──────────
        $firstNames = [
            'Juan','Maria','Jose','Ana','Pedro','Michelle','Kevin','Christine',
            'Mark','Angel','Bryan','Sarah','Dennis','Rhea','Angelo','Kaye',
            'Ryan','Grace','Joel','Joy','Erwin','Jessa','Paolo','Cherry',
            'Vincent','Jane','Christian','Princess','Michael','Catherine',
        ];
        $lastNames = [
            'Dela Cruz','Reyes','Santos','Garcia','Ramos','Mendoza',
            'Flores','Gonzales','Bautista','Villanueva','Fernandez','Cruz',
            'Ocampo','Navarro','Corpuz','Alvarez','Domingo','Castillo',
            'Rivera','Perez','Aquino','Marquez','Sarmiento','Pascual',
            'Gomez','Del Rosario','Soriano','Palma','De Leon','Tolentino',
        ];
        $progMap = ['BSIT','BSCS'];
        $deptMap = ['Information Technology','Computer Science'];
        $yearMap = ['1st Year','2nd Year','3rd Year','4th Year'];

        $students = [];
        for ($i = 0; $i < 30; $i++) {
            $fn      = $firstNames[$i];
            $ln      = $lastNames[$i];
            $progIdx = $i % 2;
            $email   = strtolower(str_replace([' ','.'], ['.',''], "{$fn}_{$ln}"))
                     . rand(10, 99) . '@student.ccs.edu.ph';

            $existing = User::where('email', $email)->first();
            if ($existing) {
                if (!$existing->user_id) {
                    $existing->user_id = $this->genUserId('student', 0, true); // random irregular
                    $existing->save();
                }
                $students[] = $existing;
                continue;
            }

            $students[] = User::create([
                'user_id'    => $this->genUserId('student', 0, true), // S-202X-XXXX (random/irregular)
                'name'       => "{$fn} {$ln}",
                'email'      => $email,
                'password'   => $password,
                'role'       => 'student',
                'department' => $deptMap[$progIdx],
                'course'     => $progMap[$progIdx],
                'year'       => $yearMap[$i % 4],
            ]);
        }

        // ── 5. Enrollments & Grades ──────────────────────────────────────
        $semester     = 'First Semester';
        $academicYear = '2024-2025';

        $courseFacultyMap = [];
        foreach ($courses as $i => $course) {
            $courseFacultyMap[$course->id] = $faculty[$courseDefs[$i]['fi']]->id;
        }

        $courseIds = collect($courses)->pluck('id')->toArray();

        foreach ($students as $student) {
            $numCourses  = rand(2, 5);
            $shuffled    = $courseIds;
            shuffle($shuffled);
            $enrolledIds = array_slice($shuffled, 0, min($numCourses, count($shuffled)));

            foreach ($enrolledIds as $courseId) {
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

                if (rand(1, 100) <= 75) {
                    $prelim  = rand(55, 99);
                    $midterm = rand(55, 99);
                    $finals  = rand(55, 99);
                    $avg     = round(($prelim + $midterm + $finals) / 3);

                    if      ($avg >= 96) $grade = '1.00';
                    elseif  ($avg >= 92) $grade = '1.25';
                    elseif  ($avg >= 88) $grade = '1.50';
                    elseif  ($avg >= 84) $grade = '1.75';
                    elseif  ($avg >= 80) $grade = '2.00';
                    elseif  ($avg >= 75) $grade = '2.25';
                    elseif  ($avg >= 70) $grade = '2.50';
                    elseif  ($avg >= 65) $grade = '2.75';
                    elseif  ($avg >= 60) $grade = '3.00';
                    else                 $grade = '5.00';

                    StudentGrade::updateOrCreate(
                        [
                            'student_id'    => $student->id,
                            'course_id'     => $courseId,
                            'faculty_id'    => $courseFacultyMap[$courseId],
                            'semester'      => $semester,
                            'academic_year' => $academicYear,
                        ],
                        [
                            'prelim'  => $prelim,
                            'midterm' => $midterm,
                            'finals'  => $finals,
                            'grade'   => $grade,
                            'remarks' => ($grade === '5.00') ? 'FAILED' : 'PASSED',
                        ]
                    );
                }
            }
        }

        $this->command->info('✅ DemoDataSeeder: 5 faculty (F-2023-XXXX) + 30 students (S-20XX-XXXX random) seeded.');
    }
}
