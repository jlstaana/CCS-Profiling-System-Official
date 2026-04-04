<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $guarded = [];
    protected $casts = ['read' => 'boolean'];

    public function user()  { return $this->belongsTo(User::class); }
    public function actor() { return $this->belongsTo(User::class, 'actor_id'); }

    /**
     * Convenience factory — pushes a notification to $recipientId triggered by $actor.
     */
    public static function send(int $recipientId, User $actor, string $type, string $message, ?string $link = null): void
    {
        if ($recipientId === $actor->id) return; // never notify yourself
        static::create([
            'user_id'  => $recipientId,
            'actor_id' => $actor->id,
            'type'     => $type,
            'message'  => $message,
            'link'     => $link,
            'read'     => false,
        ]);
    }
}
