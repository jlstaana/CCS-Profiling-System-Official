<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Connection extends Model
{
    protected $guarded = [];
    public function requester() { return $this->belongsTo(User::class, 'requester_id'); }
    public function receiver() { return $this->belongsTo(User::class, 'receiver_id'); }
}
