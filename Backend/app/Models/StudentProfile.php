<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    protected $guarded = [];
    protected $casts = [
        'academic_history'        => 'array',
        'non_academic_activities' => 'array',
        'skills'                  => 'array',
        'affiliations'           => 'array',
        'birth_date'             => 'date',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
