<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $guarded = [];
    protected $casts = ['start_at' => 'datetime', 'end_at' => 'datetime'];
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
