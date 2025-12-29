<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'industry',
        'skills',
        'education',
        'experience',
        'is_open_to_work',
        'profile_link_slug',
        'privacy_settings',
    ];


    protected $casts = [
        'skills' => 'json',
        'education' => 'json',
        'experience' => 'json',
        'is_open_to_work' => 'boolean',
        'privacy_settings' => 'json',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
