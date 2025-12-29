<?php
/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login', 'register', 'forgotPassword', 'resetPassword', 'verifyEmail']]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed', // Add confirmed rule
            'role' => 'required|in:applicant,employer',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $verificationEnabled = \App\Models\SystemSetting::get('email_verification_enabled') == '1';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'location' => $request->location,
            'is_active' => !$verificationEnabled,
        ]);

        // Create initial profile with detailed info
        Profile::create([
            'user_id' => $user->id,
            'bio' => $request->bio,
            'industry' => $request->headline, 
            'skills' => $request->skills,
        ]);

        if ($verificationEnabled) {
            // Generate verification code & send email
            $code = rand(100000, 999999);
            \App\Models\SystemSetting::set('verify_code_' . $user->id, $code);
            
            // Send actual email
            \App\Services\MailService::sendVerificationCode($user, $code);
            
            return response()->json([
                'message' => 'Registration successful. Please verify your email.',
                'user' => $user,
                'verify_code' => $code, // Temporarily return for UI development
                'requires_verification' => true
            ], 201);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'User successfully registered',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) return response()->json(['error' => 'User not found'], 404);

        $storedCode = \App\Models\SystemSetting::get('verify_code_' . $user->id);
        if ($storedCode == $request->code) {
            $user->update(['is_active' => true, 'email_verified_at' => now()]);
            $token = JWTAuth::fromUser($user);
            return response()->json([
                'message' => 'Email verified successfully',
                'token' => $token,
                'user' => $user->load('profile')
            ]);
        }

        return response()->json(['error' => 'Invalid verification code'], 400);
    }


    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Incorrect email or password'], 401);
        }

        $user = auth('api')->user();
        if (!$user->is_active && \App\Models\SystemSetting::get('email_verification_enabled') == '1') {
            return response()->json(['error' => 'Please verify your email address'], 403);
        }

        return $this->respondWithToken($token);
    }


    public function me()
    {
        return response()->json(auth('api')->user()->load(['profile'])->loadCount(['connections', 'posts']));
    }


    public function logout()
    {
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function refresh()
    {
        return $this->respondWithToken(auth('api')->refresh());
    }

    public function updatePushToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $user = auth('api')->user();
        $user->update(['push_token' => $request->token]);

        return response()->json(['message' => 'Push token updated successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::where('email', $request->email)->first();
        if (!$user) return response()->json(['error' => 'No account found with this email'], 404);

        $code = rand(100000, 999999);
        \App\Models\SystemSetting::set('reset_code_' . $user->id, $code);

        // Send actual email
        \App\Services\MailService::sendPasswordResetCode($user, $code);

        return response()->json([
            'message' => 'Reset code sent to your email',
            'code' => $code // Remove in production
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) return response()->json(['error' => 'User not found'], 404);

        $storedCode = \App\Models\SystemSetting::get('reset_code_' . $user->id);
        if ($storedCode != $request->code) {
            return response()->json(['error' => 'Invalid or expired reset code'], 400);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Clear the code
        \App\Models\SystemSetting::set('reset_code_' . $user->id, null);

        return response()->json(['message' => 'Password reset successfully. You can now login.']);
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => auth('api')->user()->load(['profile'])->loadCount(['connections', 'posts'])
        ]);
    }

}
