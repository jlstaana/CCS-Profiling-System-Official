<?php

namespace App\Http\Controllers;

use App\Models\StudentGrade;
use App\Models\User;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        // For students, show their grades. For faculty/admin, show all or filtered.
        $user = $request->user();
        if ($user->role === 'student') {
            return response()->json(StudentGrade::with(['faculty', 'course'])->where('student_id', $user->id)->get());
        }

        return response()->json(StudentGrade::with(['student', 'faculty', 'course'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'grade' => 'required|string',
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
