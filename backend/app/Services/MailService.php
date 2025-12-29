<?php
/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */

namespace App\Services;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use App\Models\SystemSetting;

class MailService
{
    public static function configure()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');

        Config::set('mail.mailers.smtp.host', $settings['mail_host'] ?? env('MAIL_HOST'));
        Config::set('mail.mailers.smtp.port', $settings['mail_port'] ?? env('MAIL_PORT'));
        Config::set('mail.mailers.smtp.username', $settings['mail_username'] ?? env('MAIL_USERNAME'));
        Config::set('mail.mailers.smtp.password', $settings['mail_password'] ?? env('MAIL_PASSWORD'));
        Config::set('mail.mailers.smtp.encryption', $settings['mail_encryption'] ?? env('MAIL_ENCRYPTION'));
        Config::set('mail.from.address', $settings['mail_username'] ?? env('MAIL_FROM_ADDRESS'));
        Config::set('mail.from.name', $settings['mail_from_name'] ?? env('MAIL_FROM_NAME'));
    }

    public static function sendVerificationCode($user, $code)
    {
        self::configure();
        
        try {
            Mail::raw("Your NexaWork verification code is: {$code}", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Email Verification - NexaWork');
            });
            return true;
        } catch (\Exception $e) {
            \Log::error('Mail Error: ' . $e->getMessage());
            return false;
        }
    }

    public static function sendPasswordResetCode($user, $code)
    {
        self::configure();

        try {
            Mail::raw("Your NexaWork password reset code is: {$code}", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Password Reset - NexaWork');
            });
            return true;
        } catch (\Exception $e) {
            \Log::error('Mail Error: ' . $e->getMessage());
            return false;
        }
    }
}
