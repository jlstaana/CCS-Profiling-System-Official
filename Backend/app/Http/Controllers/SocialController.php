<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use App\Models\StudyGroup;
use App\Models\StudyGroupMember;
use App\Models\Connection;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class SocialController extends Controller
{
    // --- POSTS ---
    public function getPosts() {
        return response()->json(Post::with('user', 'comments.user')->latest()->get());
    }

    public function createPost(Request $request) {
        $request->validate(['content' => 'nullable|string']);
        $post = Post::create([
            'user_id'    => $request->user()->id,
            'content'    => $request->input('content'),
            'image_path' => $request->input('image_path'),
        ]);

        // Notify all other users of new post (optional — only relevant in small-community apps)
        // We skip mass-notification here to avoid spam; connections are notified instead.
        // Notify connected users of new post
        $actor = $request->user();
        $connectionIds = Connection::where(function($q) use ($actor) {
                $q->where('requester_id', $actor->id)->orWhere('receiver_id', $actor->id);
            })->where('status', 'accepted')->get()
            ->map(fn($c) => $c->requester_id === $actor->id ? $c->receiver_id : $c->requester_id);

        foreach ($connectionIds as $cid) {
            Notification::send($cid, $actor, 'new_post',
                "{$actor->name} shared a new post.",
                '/social/feed'
            );
        }

        return response()->json($post->load('user', 'comments'));
    }

    public function likePost(Request $request, $id) {
        $post = Post::with('user')->findOrFail($id);
        $post->increment('likes_count');

        Notification::send(
            $post->user_id,
            $request->user(),
            'post_like',
            "{$request->user()->name} liked your post.",
            '/social/feed'
        );

        return response()->json(['message' => 'Liked', 'likes_count' => $post->likes_count]);
    }

    public function addComment(Request $request, $id) {
        $request->validate(['content' => 'required|string']);
        $post = Post::with('user')->findOrFail($id);
        $comment = Comment::create([
            'post_id' => $id,
            'user_id' => $request->user()->id,
            'content' => $request->input('content'),
        ]);

        Notification::send(
            $post->user_id,
            $request->user(),
            'post_comment',
            "{$request->user()->name} commented on your post.",
            '/social/feed'
        );

        return response()->json($comment->load('user'));
    }

    // --- NETWORK DIRECTORY ---
    public function getAllUsers(Request $request) {
        $users = User::where('id', '!=', $request->user()->id)
            ->with('studentProfile')
            ->get()
            ->map(fn($u) => [
                'id'             => $u->id,
                'name'           => $u->name,
                'role'           => $u->role,
                'department'     => $u->department,
                'course'         => $u->course,
                'email'          => $u->email,
                'specialization' => $u->specialization,
                'affiliations'   => $u->studentProfile ? $u->studentProfile->affiliations : [],
            ]);
        return response()->json($users);
    }

    public function getConnections(Request $request) {
        $userId = $request->user()->id;
        $connections = Connection::where(function($q) use ($userId) {
            $q->where('requester_id', $userId)->orWhere('receiver_id', $userId);
        })->with('requester', 'receiver')->get();
        return response()->json($connections);
    }

    public function sendConnection(Request $request, $id) {
        $receiver = User::findOrFail($id);
        $conn = Connection::create([
            'requester_id' => $request->user()->id,
            'receiver_id'  => $id,
            'status'       => 'pending',
        ]);

        Notification::send(
            $id,
            $request->user(),
            'connection_request',
            "{$request->user()->name} sent you a connection request.",
            '/social/network'
        );

        return response()->json($conn);
    }

    public function acceptConnection(Request $request, $id) {
        $conn = Connection::findOrFail($id);
        $conn->update(['status' => 'accepted']);

        Notification::send(
            $conn->requester_id,
            $request->user(),
            'connection_accepted',
            "{$request->user()->name} accepted your connection request.",
            '/social/network'
        );

        return response()->json(['message' => 'Accepted']);
    }

    public function declineConnection(Request $request, $id) {
        $conn = Connection::findOrFail($id);
        $conn->update(['status' => 'declined']);
        return response()->json(['message' => 'Declined']);
    }

    // --- STUDY GROUPS ---
    public function getStudyGroups() {
        return response()->json(StudyGroup::with('creator', 'members.user')->get());
    }

    public function createStudyGroup(Request $request) {
        $request->validate(['name' => 'required|string']);
        $group = StudyGroup::create([
            'name'       => $request->input('name'),
            'schedule'   => $request->input('schedule'),
            'agenda'     => $request->input('description') ?? $request->input('agenda'),
            'created_by' => $request->user()->id,
        ]);
        StudyGroupMember::create(['study_group_id' => $group->id, 'user_id' => $request->user()->id]);
        return response()->json($group->load('creator', 'members'));
    }

    public function joinStudyGroup(Request $request, $id) {
        $group = StudyGroup::with('creator')->findOrFail($id);
        StudyGroupMember::firstOrCreate(['study_group_id' => $id, 'user_id' => $request->user()->id]);

        Notification::send(
            $group->created_by,
            $request->user(),
            'group_join',
            "{$request->user()->name} joined your study group \"{$group->name}\".",
            '/social/study-groups'
        );

        return response()->json(['message' => 'Joined']);
    }

    public function leaveStudyGroup(Request $request, $id) {
        StudyGroupMember::where('study_group_id', $id)->where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Left']);
    }
}

