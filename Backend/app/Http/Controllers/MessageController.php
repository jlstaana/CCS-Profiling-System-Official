<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Returns a deduplicated list of "conversations" (one per other user).
     */
    public function getConversations(Request $request)
    {
        $userId = $request->user()->id;

        $messages = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender.studentProfile', 'receiver.studentProfile'])
            ->latest()
            ->get();

        $conversations = [];
        $seenUsers = [];

        foreach ($messages as $msg) {
            $otherUser = $msg->sender_id === $userId ? $msg->receiver : $msg->sender;
            if (!$otherUser) continue;

            if (!in_array($otherUser->id, $seenUsers)) {
                $seenUsers[] = $otherUser->id;

                $unreadCount = Message::where('sender_id', $otherUser->id)
                    ->where('receiver_id', $userId)
                    ->where('read', false)
                    ->count();

                $conversations[] = [
                    'id'           => $otherUser->id,
                    'other_user'   => [
                        'id'             => $otherUser->id,
                        'name'           => $otherUser->name,
                        'role'           => $otherUser->role,
                        'department'     => $otherUser->department,
                        'course'         => $otherUser->course,
                        'specialization' => $otherUser->specialization,
                        'affiliations'   => $otherUser->studentProfile ? $otherUser->studentProfile->affiliations : [],
                    ],
                    'last_message' => [
                        'content'    => $msg->content,
                        'created_at' => $msg->created_at,
                        'sender_id'  => $msg->sender_id,
                    ],
                    'unread_count' => $unreadCount,
                ];
            }
        }

        return response()->json($conversations);
    }

    /**
     * Returns all messages between the current user and $otherUserId.
     */
    public function getMessages(Request $request, $otherUserId)
    {
        $userId = $request->user()->id;

        $messages = Message::where(function ($q) use ($userId, $otherUserId) {
            $q->where('sender_id', $userId)->where('receiver_id', $otherUserId);
        })->orWhere(function ($q) use ($userId, $otherUserId) {
            $q->where('sender_id', $otherUserId)->where('receiver_id', $userId);
        })->oldest()->get();

        return response()->json($messages->map(fn($m) => [
            'id'         => $m->id,
            'sender_id'  => $m->sender_id,
            'content'    => $m->content,
            'created_at' => $m->created_at,
            'read'       => $m->read,
        ]));
    }

    /**
     * Sends a message from the current user TO $otherUserId.
     */
    public function sendMessage(Request $request, $otherUserId)
    {
        $request->validate(['content' => 'required|string']);

        $msg = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $otherUserId,
            'content'     => $request->input('content'),
            'read'        => false,
        ]);

        // Push a notification to the receiver
        Notification::send(
            $otherUserId,
            $request->user(),
            'new_message',
            "{$request->user()->name} sent you a message.",
            '/messages'
        );

        return response()->json([
            'id'         => $msg->id,
            'sender_id'  => $msg->sender_id,
            'content'    => $msg->content,
            'created_at' => $msg->created_at,
            'read'       => false,
        ], 201);
    }

    /**
     * Marks all messages from $otherUserId to the current user as read.
     */
    public function markAsRead(Request $request, $otherUserId)
    {
        Message::where('sender_id', $otherUserId)
            ->where('receiver_id', $request->user()->id)
            ->where('read', false)
            ->update(['read' => true]);

        return response()->json(['success' => true]);
    }
}

