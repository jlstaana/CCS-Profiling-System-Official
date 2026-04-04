<?php

namespace App\Http\Controllers;

use App\Models\ProfileRequest;
use App\Models\User;
use App\Models\Notification;
use App\Models\StudentProfile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user()->load(['studentProfile', 'violations.reporter']));
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $minorChanges = $request->input('minorChanges', []);
        $majorChanges = $request->input('majorChanges', []);
        $studentProfileData = $request->input('studentProfile', []);

        // Update User table (Minor changes)
        if (!empty($minorChanges)) {
            $user->update($minorChanges);
        }

        // Update StudentProfile table (Directly, no approval needed for skills/history for now)
        if ($user->role === 'student' && !empty($studentProfileData)) {
            $user->studentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $studentProfileData
            );
        }

        if (!empty($majorChanges)) {
            ProfileRequest::create([
                'user_id' => $user->id,
                'changes' => $majorChanges,
                'status' => 'pending'
            ]);

            // Notify all admins about new profile request
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                Notification::send(
                    $admin->id,
                    $user,
                    'profile_request',
                    "New profile update request from {$user->name}",
                    '/approvals'
                );
            }

            return response()->json([
                'message' => 'Profile updated, but major changes await admin approval.', 
                'user' => $user->load(['studentProfile', 'violations'])
            ]);
        }

        return response()->json([
            'message' => 'Profile updated successfully.', 
            'user' => $user->load(['studentProfile', 'violations'])
        ]);
    }
}
