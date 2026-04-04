<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Schedule;
use App\Models\CourseMaterial;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // ── COURSES ──────────────────────────────────
    public function getCourses() {
        return response()->json(
            Course::with('creator', 'schedules', 'materials.uploader')->get()
        );
    }

    public function createCourse(Request $request) {
        $request->validate([
            'code'  => 'required|string',
            'title' => 'required|string',
        ]);
        $course = Course::create([
            'code'       => $request->code,
            'title'      => $request->title,
            'created_by' => $request->user()->id,
        ]);

        // Notify all users about new course
        $users = User::where('id', '!=', $request->user()->id)->get();
        foreach ($users as $u) {
            Notification::send(
                $u->id,
                $request->user(),
                'new_course',
                "New Course added: {$course->code} - {$course->title}",
                '/search'
            );
        }

        return response()->json($course->load('creator'), 201);
    }

    public function deleteCourse(Request $request, $id) {
        Course::findOrFail($id)->delete();
        return response()->json(['message' => 'Course deleted']);
    }

    // ── SCHEDULES ────────────────────────────────
    public function addSchedule(Request $request, $courseId) {
        $request->validate([
            'day'        => 'required|string',
            'time_start' => 'required|string',
            'time_end'   => 'required|string',
            'room'       => 'required|string',
            'year_level' => 'nullable|string',
            'section'    => 'nullable|string',
            'program'    => 'nullable|string',
        ]);
        $schedule = Schedule::create([
            'course_id'  => $courseId,
            'day'        => $request->day,
            'time_start' => $request->time_start,
            'time_end'   => $request->time_end,
            'room'       => $request->room,
            'year_level' => $request->year_level,
            'section'    => $request->section,
            'program'    => $request->program,
        ]);
        return response()->json($schedule->load('course'), 201);
    }

    public function deleteSchedule(Request $request, $id) {
        Schedule::findOrFail($id)->delete();
        return response()->json(['message' => 'Schedule deleted']);
    }

    public function getAllSchedules() {
        return response()->json(Schedule::with('course')->get());
    }

    // ── MATERIALS ────────────────────────────────
    public function getMaterials(Request $request, $courseId) {
        return response()->json(
            CourseMaterial::where('course_id', $courseId)->with('uploader')->get()
        );
    }

    public function uploadMaterial(Request $request, $courseId) {
        $request->validate([
            'title' => 'required|string',
        ]);
        $course = Course::findOrFail($courseId);

        $material = CourseMaterial::create([
            'course_id'   => $courseId,
            'uploaded_by' => $request->user()->id,
            'title'       => $request->title,
            'file_base64' => $request->file_base64 ?? null,
        ]);

        // Notify all users about new material
        $users = User::where('id', '!=', $request->user()->id)->get();
        foreach ($users as $u) {
            Notification::send(
                $u->id,
                $request->user(),
                'new_material',
                "New Material uploaded for {$course->code}: {$material->title}",
                '/search'
            );
        }

        return response()->json($material->load('uploader'), 201);
    }

    public function deleteMaterial(Request $request, $id) {
        $material = CourseMaterial::findOrFail($id);
        // Only uploader or admin can delete
        if ($material->uploaded_by !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $material->delete();
        return response()->json(['message' => 'Material deleted']);
    }
}
