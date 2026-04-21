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

    public function destroy($id)
    {
        $curriculum = Curriculum::findOrFail($id);
        $curriculum->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
