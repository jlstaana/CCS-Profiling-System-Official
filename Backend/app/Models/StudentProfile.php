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
        'affiliations'            => 'array',
        'birth_date'              => 'date',
    ];

    // New fields: gender, zip_code, guardian_name, guardian_relationship,
    //             guardian_contact, guardian_address are all plain strings —
    //             no extra cast needed (already handled by guarded=[]).

    public function user() {
        return $this->belongsTo(User::class);
    }
}
