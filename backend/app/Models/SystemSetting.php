<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set($key, $value)
    {
        return self::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function hasForbiddenKeywords($text)
    {
        $keywords = explode(',', self::get('forbidden_keywords', ''));
        foreach ($keywords as $keyword) {
            $keyword = trim($keyword);
            if (!empty($keyword) && stripos($text, $keyword) !== false) {
                return true;
            }
        }
        return false;
    }

    public static function filterContent($text)
    {
        $keywords = explode(',', self::get('forbidden_keywords', ''));
        foreach ($keywords as $keyword) {
            $keyword = trim($keyword);
            if (!empty($keyword)) {
                $text = str_ireplace($keyword, '[Filtered]', $text);
            }
        }
        return $text;
    }
}
