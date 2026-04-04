<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index() {
        return response()->json(
            Event::with('creator')->orderBy('start_at')->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'title'    => 'required|string',
            'start_at' => 'required|date',
            'type'     => 'nullable|string',
        ]);

        $event = Event::create([
            'created_by'  => $request->user()->id,
            'title'       => $request->title,
            'description' => $request->description ?? null,
            'type'        => $request->type ?? 'social',
            'location'    => $request->location ?? null,
            'start_at'    => $request->start_at,
            'end_at'      => $request->end_at ?? null,
        ]);

        // Notify all users about new event
        $users = User::where('id', '!=', $request->user()->id)->get();
        foreach ($users as $u) {
            Notification::send(
                $u->id,
                $request->user(),
                'new_event',
                "New event: {$event->title} on " . (new \DateTime($event->start_at))->format('F d, h:i A'),
                '/events'
            );
        }

        return response()->json($event->load('creator'), 201);
    }

    public function update(Request $request, $id) {
        $event = Event::findOrFail($id);

        if ($event->created_by !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $event->update($request->only(['title', 'description', 'type', 'location', 'start_at', 'end_at']));
        return response()->json($event->load('creator'));
    }

    public function destroy(Request $request, $id) {
        $event = Event::findOrFail($id);

        if ($event->created_by !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $event->delete();
        return response()->json(['message' => 'Event deleted']);
    }
}
