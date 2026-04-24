<?php

namespace App\Http\Controllers;

use App\Models\ProfileRequest;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getRequests() {
        return response()->json(ProfileRequest::with('user')->where('status', 'pending')->get());
    }

    public function approveRequest(Request $request, $id) {
        $profileReq = ProfileRequest::findOrFail($id);
        $user = User::findOrFail($profileReq->user_id);

        $changes = $profileReq->changes;
        if (is_string($changes)) {
            $changes = json_decode($changes, true);
        }

        if ($changes) {
            // Define which fields belong to which table
            $userFields = [
                'name', 'email', 'user_id', 'role', 'department', 'course', 'year',
                'specialization', 'bio', 'qualifications',
                // Faculty-level personal fields (stored on users table)
                'gender', 'zip_code', 'phone',
                'emergency_contact_name', 'emergency_contact_relationship',
                'emergency_contact_number', 'emergency_contact_address',
            ];
            $profileFields = [
                'phone', 'address', 'birth_date', 'nationality',
                // New student profile fields
                'gender', 'zip_code',
                'guardian_name', 'guardian_relationship',
                'guardian_contact', 'guardian_address',
            ];

            $userUpdates   = array_intersect_key($changes, array_flip($userFields));
            $profileUpdates = array_intersect_key($changes, array_flip($profileFields));

            if (!empty($userUpdates)) {
                $user->update($userUpdates);
            }

            if (!empty($profileUpdates) && $user->role === 'student') {
                $user->studentProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $profileUpdates
                );
            }
        }
        $profileReq->update(['status' => 'approved']);

        Notification::send(
            $user->id,
            $request->user(),
            'profile_approved',
            'Your profile update request has been approved by the admin.',
            '/profile'
        );

        return response()->json(['message' => 'Request approved', 'user' => $user]);
    }

    public function rejectRequest(Request $request, $id) {
        $profileReq = ProfileRequest::findOrFail($id);
        $targetUser = User::findOrFail($profileReq->user_id);
        $profileReq->update(['status' => 'rejected']);

        Notification::send(
            $targetUser->id,
            $request->user(),
            'profile_rejected',
            'Your profile update request was reviewed and could not be approved.',
            '/profile'
        );

        return response()->json(['message' => 'Request rejected']);
    }

    public function getUsers() {
        return response()->json(User::with('studentProfile')->orderBy('created_at', 'desc')->get());
    }

    public function createUser(Request $request) {
        $fields = $request->validate([
            'name'       => 'required|string',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:3',
            'role'       => 'required|in:student,faculty,admin',
            'department' => 'nullable|string',
            'course'     => 'nullable|string',
            'student_status' => 'nullable|string|in:Regular,Irregular',
        ]);

        $user = User::create([
            'user_id'    => $this->generateUserId($fields['role']),
            'name'       => $fields['name'],
            'email'      => $fields['email'],
            'password'   => bcrypt($fields['password']),
            'role'       => $fields['role'],
            'department' => $fields['department'] ?? null,
            'course'     => $fields['course'] ?? null,
        ]);

        if ($user->role === 'student' && isset($fields['student_status'])) {
            $user->studentProfile()->create(['student_status' => $fields['student_status']]);
        }

        return response()->json($user, 201);
    }

    private function generateUserId($role) {
        $prefix = [
            'student' => 'S',
            'faculty' => 'F',
            'admin'   => 'A'
        ][$role] ?? 'U';

        $year = date('Y');
        
        $latestUser = User::where('role', $role)
            ->where('user_id', 'like', "{$prefix}-{$year}-%")
            ->orderBy('user_id', 'desc')
            ->first();

        if ($latestUser && preg_match('/-(\d{4})$/', $latestUser->user_id, $matches)) {
            $nextSequence = intval($matches[1]) + 1;
        } else {
            // Fallback if no users for this year yet
            $nextSequence = User::where('role', $role)->count() + 1;
        }
        
        $sequence = str_pad($nextSequence, 4, '0', STR_PAD_LEFT);

        return "{$prefix}-{$year}-{$sequence}";
    }

    public function updateUser(Request $request, $id) {
        $user = User::findOrFail($id);
        $data = $request->only(['name', 'email', 'role', 'department', 'course', 'bio']);
        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->input('password'));
        }
        $user->update($data);

        if ($user->role === 'student' && $request->has('student_status')) {
            $user->studentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                ['student_status' => $request->input('student_status')]
            );
        }

        return response()->json($user);
    }

    public function getDashboardStats() {
        $totalUsers = User::count();
        $studentsCount = User::where('role', 'student')->count();
        $facultyCount = User::where('role', 'faculty')->count();
        $pendingRequests = ProfileRequest::where('status', 'pending')->count();
        $recentUsers = User::orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'total_users' => $totalUsers,
            'students'    => $studentsCount,
            'faculty'     => $facultyCount,
            'pending'     => $pendingRequests,
            'recent_users' => $recentUsers
        ]);
    }

    public function deleteUser(Request $request, $id) {
        $user = User::findOrFail($id);
        // Prevent deleting yourself
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
