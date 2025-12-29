<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    public static function send($to, $title, $body, $data = [])
    {
        if (empty($to)) return;

        $payload = [
            'to' => $to,
            'title' => $title,
            'body' => $body,
            'sound' => 'default',
            'data' => $data,
        ];

        try {
            $response = Http::post('https://exp.host/--/api/v2/push/send', $payload);
            return $response->json();
        } catch (\Exception $e) {
            Log::error('Push Notification Error: ' . $e->getMessage());
            return false;
        }
    }

    public static function broadcast($title, $body, $data = [])
    {
        $tokens = \App\Models\User::whereNotNull('push_token')->pluck('push_token')->toArray();
        if (empty($tokens)) return;

        // Expo allows up to 100 tokens per request
        $chunks = array_chunk($tokens, 100);
        foreach ($chunks as $chunk) {
            self::send($chunk, $title, $body, $data);
        }
    }
}
