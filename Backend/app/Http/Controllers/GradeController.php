<?php

namespace App\Http\Controllers;

use App\Models\StudentGrade;
use App\Models\User;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'student') {
            return response()->json(StudentGrade::with(['faculty', 'course'])->where('student_id', $user->id)->get());
        }

        return response()->json(StudentGrade::with(['student', 'faculty', 'course'])->get());
    }

    public function getEnrolledStudents($course_id)
    {
        $enrolledIds = \App\Models\Enrollment::where('course_id', $course_id)->pluck('student_id');
        $students = User::whereIn('id', $enrolledIds)->get();
        return response()->json($students);
    }

    public function batchStore(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'semester' => 'required|string',
            'academic_year' => 'required|string',
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|exists:users,id',
            'grades.*.prelim' => 'nullable|numeric',
            'grades.*.midterm' => 'nullable|numeric',
            'grades.*.finals' => 'nullable|numeric',
            'grades.*.final_grade' => 'nullable|string',
        ]);

        $faculty_id = $request->user()->id;
        $course_id = $validated['course_id'];
        $semester = $validated['semester'];
        $academic_year = $validated['academic_year'];

        foreach ($validated['grades'] as $gradeData) {
            $prelim = $gradeData['prelim'] ?? null;
            $midterm = $gradeData['midterm'] ?? null;
            $finals = $gradeData['finals'] ?? null;
            $override_grade = $gradeData['final_grade'] ?? null;

            $computed = null;
            $remarks = null;

            if (in_array($override_grade, ['INC', 'OD', 'UD'])) {
                $computed = $override_grade;
                if ($override_grade === 'INC') $remarks = 'INC';
                if ($override_grade === 'OD') $remarks = 'OD';
                if ($override_grade === 'UD') $remarks = 'UD';
            } else {
                $count = 0;
                $sum = 0;

                if ($prelim !== null) { $sum += $prelim; $count++; }
                if ($midterm !== null) { $sum += $midterm; $count++; }
                if ($finals !== null) { $sum += $finals; $count++; }

                if ($count > 0) {
                    $average = round($sum / $count);
                    
                    if ($average >= 96) $computed = '1.00';
                    elseif ($average >= 92) $computed = '1.25';
                    elseif ($average >= 88) $computed = '1.50';
                    elseif ($average >= 84) $computed = '1.75';
                    elseif ($average >= 80) $computed = '2.00';
                    elseif ($average >= 75) $computed = '2.25';
                    elseif ($average >= 70) $computed = '2.50';
                    elseif ($average >= 65) $computed = '2.75';
                    elseif ($average >= 60) $computed = '3.00';
                    else $computed = '5.00';

                    $remarks = ($computed === '5.00') ? 'FAILED' : 'PASSED';
                }
            }

            StudentGrade::updateOrCreate(
                [
                    'student_id' => $gradeData['student_id'],
                    'course_id' => $course_id,
                    'faculty_id' => $faculty_id,
                    'semester' => $semester,
                    'academic_year' => $academic_year,
                ],
                [
                    'prelim' => $prelim,
                    'midterm' => $midterm,
                    'finals' => $finals,
                    'grade' => $computed,
                    'remarks' => $remarks
                ]
            );
        }

        return response()->json(['message' => 'Grades saved successfully']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'grade' => 'nullable|string',
            'prelim' => 'nullable|numeric',
            'midterm' => 'nullable|numeric',
            'finals' => 'nullable|numeric',
            'remarks' => 'nullable|string',
            'semester' => 'nullable|string',
            'academic_year' => 'nullable|string',
        ]);

        $validated['faculty_id'] = $request->user()->id;

        $grade = StudentGrade::create($validated);
        return response()->json($grade->load(['student', 'faculty', 'course']), 201);
    }

    public function destroy($id)
    {
        $grade = StudentGrade::findOrFail($id);
        $grade->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
