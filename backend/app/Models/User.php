<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use App\Models\Connection;
use App\Models\Notification;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'location',
        'avatar',
        'is_active',
        'push_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'connections_count',
        'posts_count',
        'connection_status',
    ];

    public function getAvatarAttribute($value)
    {
        if (!$value) return null;
        
        // If the stored URL contains a local IP or localhost, fix it for production
        $appUrl = config('app.url');
        if (str_contains($value, '192.168.') || str_contains($value, '127.0.0.1') || str_contains($value, 'localhost')) {
            // Replace everything before the first /storage/ or just the domain part
            return preg_replace('/^https?:\/\/[^\/]+(?:\:[0-9]+)?/', $appUrl, $value);
        }

        return $value;
    }

    public function getConnectionStatusAttribute()
    {
        $authUserId = auth('api')->id();
        if (!$authUserId || $authUserId === $this->id) {
            return null;
        }

        $connection = Connection::where(function($query) use ($authUserId) {
            $query->where('user_id', $authUserId)->where('connection_id', $this->id);
        })->orWhere(function($query) use ($authUserId) {
            $query->where('user_id', $this->id)->where('connection_id', $authUserId);
        })->first();

        if (!$connection) return null;

        if ($connection->status === 'pending') {
            return $connection->user_id === $authUserId ? 'pending_sent' : 'pending_received';
        }

        return $connection->status;
    }

    public function getConnectionsCountAttribute()
    {
        return Connection::where(function($query) {
            $query->where('user_id', $this->id)
                  ->orWhere('connection_id', $this->id);
        })->where('status', 'accepted')->count();
    }

    public function getPostsCountAttribute()
    {
        return $this->posts()->count();
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
        ];
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class, 'employer_id');
    }

    public function connections()
    {
        return $this->hasMany(Connection::class, 'user_id');
    }

    public function connectedTo()
    {
        return $this->hasMany(Connection::class, 'connection_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function companies()
    {
        return $this->hasMany(Company::class, 'owner_id');
    }

    public function blockedUsers()
    {
        return $this->hasMany(Block::class, 'user_id');
    }

    public function blockedBy()
    {
        return $this->hasMany(Block::class, 'blocked_user_id');
    }
}

