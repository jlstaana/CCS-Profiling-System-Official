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
        ]);

        $faculty_id = $request->user()->id;
        $course_id = $validated['course_id'];
        $semester = $validated['semester'];
        $academic_year = $validated['academic_year'];

        foreach ($validated['grades'] as $gradeData) {
            $prelim = $gradeData['prelim'] ?? null;
            $midterm = $gradeData['midterm'] ?? null;
            $finals = $gradeData['finals'] ?? null;

            $computed = null;
            $remarks = null;
            $count = 0;
            $sum = 0;

            if ($prelim !== null) { $sum += $prelim; $count++; }
            if ($midterm !== null) { $sum += $midterm; $count++; }
            if ($finals !== null) { $sum += $finals; $count++; }

            if ($count > 0) {
                // Determine grade scale (Assuming 1.0 - 5.0 system in PH where lower is better, or 1-100 where higher is better).
                // Usually grading average is simple average of prelim, midterm, final. Let's do simple average.
                // Or maybe the frontend computes it and sends it? The prompt says "there should be automatic calculation".
                // Doing it in backend ensures validity.
                $computed = round($sum / $count, 2);
                
                // Zero-based grading typically considers 50% as the passing mark (which maps to 3.0 depending on the school's transmutation table).
                if ($computed <= 3.0 && $computed >= 1.0) {
                     $remarks = 'Passed';
                } elseif ($computed > 3.0 && $computed <= 5.0) {
                     $remarks = 'Failed';
                } else if ($computed >= 50) { // Changed to 50 for zero-based passing criteria
                     $remarks = 'Passed';
                } else {
                     $remarks = 'Failed';
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
