<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /** GET /notifications — list the current user's notifications (latest 30) */
    public function index(Request $request)
    {
        $notifs = Notification::where('user_id', $request->user()->id)
            ->with('actor')
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn($n) => [
                'id'      => $n->id,
                'type'    => $n->type,
                'message' => $n->message,
                'link'    => $n->link,
                'read'    => $n->read,
                'time'    => $n->created_at->diffForHumans(),
                'actor'   => $n->actor ? ['name' => $n->actor->name, 'role' => $n->actor->role] : null,
            ]);

        return response()->json($notifs);
    }

    /** POST /notifications/{id}/read — mark one as read */
    public function markRead(Request $request, $id)
    {
        Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->update(['read' => true]);

        return response()->json(['success' => true]);
    }

    /** POST /notifications/read-all — mark all as read */
    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('read', false)
            ->update(['read' => true]);

        return response()->json(['success' => true]);
    }

    /** DELETE /notifications/{id} — delete one */
    public function destroy(Request $request, $id)
    {
        Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['success' => true]);
    }
}
