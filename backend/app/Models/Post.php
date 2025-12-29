<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'images',
        'type',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    protected $appends = ['likes_count', 'comments_count', 'is_liked'];

    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    public function getCommentsCountAttribute()
    {
        return $this->comments()->count();
    }

    public function getIsLikedAttribute()
    {
        $userId = auth('api')->id();
        if (!$userId) return false;
        return $this->likes()->where('user_id', $userId)->exists();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function bookmarks()
    {
        return $this->morphMany(Bookmark::class, 'bookmarkable');
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }
}
