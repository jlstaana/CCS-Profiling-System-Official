<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $guarded = [];
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function schedules() { return $this->hasMany(Schedule::class); }
    public function materials() { return $this->hasMany(CourseMaterial::class); }
}
