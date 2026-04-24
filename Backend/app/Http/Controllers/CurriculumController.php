<?php

namespace App\Http\Controllers;

use App\Models\Curriculum;
use Illuminate\Http\Request;

class CurriculumController extends Controller
{
    public function index()
    {
        return response()->json(Curriculum::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program' => 'required|string',
            'year_level' => 'required|string',
            'semester' => 'required|string',
            'course_code' => 'required|string',
            'course_title' => 'required|string',
            'units' => 'required|integer',
            'prerequisites' => 'nullable|string',
        ]);

        $curriculum = Curriculum::create($validated);
        return response()->json($curriculum, 201);
    }

    public function update(Request $request, $id)
    {
        $curriculum = Curriculum::findOrFail($id);
        $validated = $request->validate([
            'program' => 'required|string',
            'year_level' => 'required|string',
            'semester' => 'required|string',
            'course_code' => 'required|string',
            'course_title' => 'required|string',
            'units' => 'required|integer',
            'prerequisites' => 'nullable|string',
        ]);
        $curriculum->update($validated);
        return response()->json($curriculum);
    }

    public function destroy($id)
    {
        $curriculum = Curriculum::findOrFail($id);
        $curriculum->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'subjects' => 'required|array',
            'subjects.*.program' => 'required|string',
            'subjects.*.year_level' => 'required|string',
            'subjects.*.semester' => 'required|string',
            'subjects.*.course_code' => 'required|string',
            'subjects.*.course_title' => 'required|string',
            'subjects.*.units' => 'required|integer',
            'subjects.*.prerequisites' => 'nullable|string',
        ]);

        foreach ($validated['subjects'] as $subject) {
            Curriculum::create($subject);
        }
        
        return response()->json(['message' => 'Bulk insert successful']);
    }
}
