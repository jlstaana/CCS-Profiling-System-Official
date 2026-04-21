<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentGrade extends Model
{
    protected $table = 'student_grades';
    protected $guarded = [];

    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function faculty() {
        return $this->belongsTo(User::class, 'faculty_id');
    }

    public function course() {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
