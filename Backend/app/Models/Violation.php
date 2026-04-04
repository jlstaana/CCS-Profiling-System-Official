<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Violation extends Model
{
    protected $guarded = [];
    protected $casts = ['date_occurred' => 'datetime'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function reporter() {
        return $this->belongsTo(User::class, 'reporter_id');
    }
}
