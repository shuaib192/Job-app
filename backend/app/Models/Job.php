<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'employer_id',
        'company_id',
        'title',
        'description',
        'skills',
        'location',
        'salary_range',
        'type',
        'status',
    ];

    protected $casts = [
        'skills' => 'json',
    ];

    public function employer()
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }


    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function bookmarks()
    {
        return $this->morphMany(Bookmark::class, 'bookmarkable');
    }
}
