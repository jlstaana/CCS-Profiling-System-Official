<?php

namespace App\Http\Controllers;

use App\Models\Violation;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class ViolationController extends Controller
{
    /**
     * Display a listing of violations.
     * Students only see their own.
     * Admin and Faculty see all students' violations.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'student') {
            return response()->json(Violation::with('reporter')->where('user_id', $user->id)->latest()->get());
        }

        return response()->json(Violation::with(['user', 'reporter'])->latest()->get());
    }

    /**
     * Store a newly created violation.
     * Admin and Faculty only.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'student') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $fields = $request->validate([
            'user_id'       => 'required|exists:users,id',
            'type'          => 'required|string',
            'description'   => 'required|string',
            'date_occurred' => 'required|date',
            'status'        => 'nullable|string'
        ]);

        $violation = Violation::create([
            'user_id'       => $fields['user_id'],
            'reporter_id'   => $user->id,
            'type'          => $fields['type'],
            'description'   => $fields['description'],
            'date_occurred' => $fields['date_occurred'],
            'status'        => $fields['status'] ?? 'pending',
        ]);

        // Send notification to the student
        Notification::send(
            $fields['user_id'],
            $user,
            'violation_reported',
            "A new violation record ({$fields['type']}) has been added to your profile.",
            '/violations'
        );

        return response()->json($violation->load(['user', 'reporter']), 201);
    }

    /**
     * Update the specified violation record.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role === 'student') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $violation = Violation::findOrFail($id);
        $violation->update($request->only(['type', 'description', 'status', 'date_occurred']));

        return response()->json($violation->load(['user', 'reporter']));
    }

    /**
     * Remove the specified violation from storage.
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admins can delete violation records'], 403);
        }

        Violation::findOrFail($id)->delete();
        return response()->json(['message' => 'Violation record deleted']);
    }
}
