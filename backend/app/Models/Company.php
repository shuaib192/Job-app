<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = ['name', 'logo', 'description', 'industry', 'website', 'location', 'owner_id'];

    public function getLogoAttribute($value)
    {
        if (!$value) return null;
        $appUrl = config('app.url');
        if (str_contains($value, '192.168.') || str_contains($value, '127.0.0.1') || str_contains($value, 'localhost')) {
            return preg_replace('/^https?:\/\/[^\/]+(?:\:[0-9]+)?/', $appUrl, $value);
        }
        return $value;
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

}
