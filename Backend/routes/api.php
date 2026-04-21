<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ViolationController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::get('/health', function () {
    return response()->json(['status' => 'online', 'timestamp' => now()]);
});

Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile/update', [ProfileController::class, 'update']);

    // Admin — Profile Requests
    Route::get('/admin/profile-requests', [AdminController::class, 'getRequests']);
    Route::post('/admin/profile-requests/{id}/approve', [AdminController::class, 'approveRequest']);
    Route::post('/admin/profile-requests/{id}/reject', [AdminController::class, 'rejectRequest']);
    // Admin — User Management
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::post('/admin/users', [AdminController::class, 'createUser']);
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('/admin/dashboard-stats', [AdminController::class, 'getDashboardStats']);

    // Courses (admin/faculty create, all read)
    Route::get('/courses', [CourseController::class, 'getCourses']);
    Route::post('/courses', [CourseController::class, 'createCourse']);
    Route::delete('/courses/{id}', [CourseController::class, 'deleteCourse']);

    // Schedules (admin only create/delete)
    Route::get('/schedules', [CourseController::class, 'getAllSchedules']);
    Route::post('/courses/{courseId}/schedules', [CourseController::class, 'addSchedule']);
    Route::delete('/schedules/{id}', [CourseController::class, 'deleteSchedule']);

    // Course Materials (admin + faculty upload)
    Route::get('/courses/{courseId}/materials', [CourseController::class, 'getMaterials']);
    Route::post('/courses/{courseId}/materials', [CourseController::class, 'uploadMaterial']);
    Route::delete('/materials/{id}', [CourseController::class, 'deleteMaterial']);

    // Social & Network
    Route::get('/social/posts', [App\Http\Controllers\SocialController::class, 'getPosts']);
    Route::post('/social/posts', [App\Http\Controllers\SocialController::class, 'createPost']);
    Route::post('/social/posts/{id}/like', [App\Http\Controllers\SocialController::class, 'likePost']);
    Route::post('/social/posts/{id}/comments', [App\Http\Controllers\SocialController::class, 'addComment']);

    Route::get('/social/users', [App\Http\Controllers\SocialController::class, 'getAllUsers']);
    Route::get('/social/connections', [App\Http\Controllers\SocialController::class, 'getConnections']);
    Route::post('/social/connections/{id}', [App\Http\Controllers\SocialController::class, 'sendConnection']);
    Route::post('/social/connections/request/{id}/accept', [App\Http\Controllers\SocialController::class, 'acceptConnection']);
    Route::post('/social/connections/request/{id}/decline', [App\Http\Controllers\SocialController::class, 'declineConnection']);

    // Study Groups
    Route::get('/social/study-groups', [App\Http\Controllers\SocialController::class, 'getStudyGroups']);
    Route::post('/social/study-groups', [App\Http\Controllers\SocialController::class, 'createStudyGroup']);
    Route::post('/social/study-groups/{id}/join', [App\Http\Controllers\SocialController::class, 'joinStudyGroup']);
    Route::post('/social/study-groups/{id}/leave', [App\Http\Controllers\SocialController::class, 'leaveStudyGroup']);

    // Messages
    Route::get('/messages/conversations', [App\Http\Controllers\MessageController::class, 'getConversations']);
    Route::get('/messages/conversations/{id}/messages', [App\Http\Controllers\MessageController::class, 'getMessages']);
    Route::post('/messages/conversations/{id}', [App\Http\Controllers\MessageController::class, 'sendMessage']);
    Route::post('/messages/conversations/{id}/read', [App\Http\Controllers\MessageController::class, 'markAsRead']);

    // Events
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    // Violations
    Route::get('/violations', [ViolationController::class, 'index']);
    Route::post('/violations', [ViolationController::class, 'store']);
    Route::put('/violations/{id}', [ViolationController::class, 'update']);
    Route::delete('/violations/{id}', [ViolationController::class, 'destroy']);

    // Curriculums
    Route::get('/curriculums', [\App\Http\Controllers\CurriculumController::class, 'index']);
    Route::post('/curriculums', [\App\Http\Controllers\CurriculumController::class, 'store']);
    Route::delete('/curriculums/{id}', [\App\Http\Controllers\CurriculumController::class, 'destroy']);

    // Grades
    Route::get('/grades', [\App\Http\Controllers\GradeController::class, 'index']);
    Route::post('/grades', [\App\Http\Controllers\GradeController::class, 'store']);
    Route::delete('/grades/{id}', [\App\Http\Controllers\GradeController::class, 'destroy']);
});
