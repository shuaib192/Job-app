<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\ProfileGallery;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user()->load('profile'));
    }

    public function candidates(Request $request)
    {
        $query = User::where('id', '!=', $request->user()->id)
                    ->where('role', '!=', 'admin') // Hide Admin Profiles
                    ->with('profile')
                    ->latest();
        
        return response()->json($query->get()); // Assuming you want to return all matching candidates
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'headline' => 'nullable|string',
            'industry' => 'nullable|string',
            'skills' => 'nullable|array',
            'education' => 'nullable|array',
            'experience' => 'nullable|array',
            'is_open_to_work' => 'nullable|boolean',
            'location' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Update user name if provided
        if ($request->has('name')) {
            $user->update(['name' => $request->name]);
        }

        // Update user location if provided
        if ($request->has('location')) {
            $user->update(['location' => $request->location]);
        }

        // Map headline to industry field
        $profileData = $request->only(['bio', 'skills', 'education', 'experience', 'is_open_to_work']);
        if ($request->has('headline')) {
            $profileData['industry'] = $request->headline;
        }
        if ($request->has('industry')) {
            $profileData['industry'] = $request->industry;
        }

        $profile->update($profileData);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()->load('profile')
        ]);
    }

    public function publicProfile($slug)
    {
        $profile = \App\Models\Profile::where('profile_link_slug', $slug)->with('user')->firstOrFail();
        if ($profile->user->role === 'admin') {
            abort(404);
        }
        return response()->json($profile);
    }

    public function showById($id)
    {
        $user = \App\Models\User::with('profile')->findOrFail($id);
        $authUser = auth('api')->user();
        
        $mutualConnections = [];
        if ($authUser && $authUser->id !== $user->id) {
            $myConnections = \App\Models\Connection::where(function($query) use ($authUser) {
                $query->where('user_id', $authUser->id)->orWhere('connection_id', $authUser->id);
            })->where('status', 'accepted')->get()->map(function($c) use ($authUser) {
                return $c->user_id == $authUser->id ? $c->connection_id : $c->user_id;
            })->toArray();

            $theirConnections = \App\Models\Connection::where(function($query) use ($user) {
                $query->where('user_id', $user->id)->orWhere('connection_id', $user->id);
            })->where('status', 'accepted')->get()->map(function($c) use ($user) {
                return $c->user_id == $user->id ? $c->connection_id : $c->user_id;
            })->toArray();

            $mutualIds = array_intersect($myConnections, $theirConnections);
            $mutualConnections = \App\Models\User::whereIn('id', $mutualIds)->limit(3)->get();
        }

        if ($user->role === 'admin') {
            return response()->json(['error' => 'Profile not found'], 404);
        }

        return response()->json([
            'user' => $user,
            'profile' => $user->profile,
            'mutual_connections' => $mutualConnections,
            'mutual_count' => count($mutualIds ?? [])
        ]);
    }

    public function addExperience(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'company' => 'required|string',
            'location' => 'nullable|string',
            'start_date' => 'required|string',
            'end_date' => 'nullable|string',
            'is_current' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $experience = $profile->experience ?? [];
        $experience[] = $request->all();
        
        $profile->update(['experience' => $experience]);

        return response()->json([
            'message' => 'Experience added successfully',
            'profile' => $profile->fresh()
        ], 201);
    }

    public function addEducation(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        $validator = Validator::make($request->all(), [
            'school' => 'required|string',
            'degree' => 'required|string',
            'field_of_study' => 'nullable|string',
            'start_date' => 'required|string',
            'end_date' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $education = $profile->education ?? [];
        $education[] = $request->all();
        
        $profile->update(['education' => $education]);

        return response()->json([
            'message' => 'Education added successfully',
            'profile' => $profile->fresh()
        ], 201);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|string', // base64 string
        ]);

        $user = $request->user();
        
        // Process base64 image
        $image = $request->avatar;
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, etc

            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                return response()->json(['error' => 'Invalid image type: ' . $type], 400);
            }

            $image = base64_decode($image);

            if ($image === false) {
                return response()->json(['error' => 'Base64 decode failed'], 400);
            }
        } else {
            return response()->json(['error' => 'Invalid image data (missing data:image/...)'], 400);
        }

        $fileName = 'avatar_' . $user->id . '_' . time() . '.' . $type;
        $publicPath = public_path('storage/avatars');
        $path = $publicPath . '/' . $fileName;

        if (!file_exists($publicPath)) {
            mkdir($publicPath, 0777, true);
        }

        file_put_contents($path, $image);

        // Remove old avatar if it exists and is local
        if ($user->avatar && str_contains($user->avatar, 'storage/avatars')) {
            $oldFile = public_path(str_replace(url('/'), '', $user->avatar));
            if (file_exists($oldFile)) {
                @unlink($oldFile);
            }
        }

        $avatarUrl = url('storage/avatars/' . $fileName);
        $user->update(['avatar' => $avatarUrl]);

        return response()->json([
            'message' => 'Avatar updated successfully',
            'avatar_url' => $avatarUrl,
            'user' => $user->fresh()
        ]);
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        // Delete related data manually to ensure full wipe
        \App\Models\Profile::where('user_id', $user->id)->delete();
        \App\Models\Post::where('user_id', $user->id)->delete();
        \App\Models\Job::where('employer_id', $user->id)->delete();
        \App\Models\Application::where('user_id', $user->id)->delete();
        \App\Models\Connection::where('user_id', $user->id)
                                ->orWhere('connection_id', $user->id)
                                ->delete();
        \App\Models\Message::where('sender_id', $user->id)
                                ->orWhere('receiver_id', $user->id)
                                ->delete();
        \App\Models\Notification::where('user_id', $user->id)->delete();

        $user->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }

    public function updatePrivacy(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile) {
            $profile = $user->profile()->create();
        }

        $profile->update([
            'privacy_settings' => $request->all()
        ]);

        return response()->json([
            'message' => 'Privacy settings updated successfully',
            'privacy_settings' => $profile->privacy_settings
        ]);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Incorrect current password'], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function getGallery(Request $request, $userId = null)
    {
        $id = $userId ?: $request->user()->id;
        $gallery = ProfileGallery::where('user_id', $id)->latest()->get();
        return response()->json($gallery);
    }

    public function uploadGallery(Request $request)
    {
        $request->validate([
            'image' => 'required|string', // base64
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $user = $request->user();
        $image = $request->image;

        // Reuse avatar logic for base64
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);
            $type = strtolower($type[1]);
            $image = base64_decode($image);
        } else {
            return response()->json(['error' => 'Invalid image data'], 400);
        }

        $fileName = 'gallery_' . $user->id . '_' . time() . '.' . $type;
        $publicPath = public_path('storage/gallery');
        if (!file_exists($publicPath)) {
            mkdir($publicPath, 0777, true);
        }

        file_put_contents($publicPath . '/' . $fileName, $image);
        $imageUrl = url('storage/gallery/' . $fileName);

        $item = ProfileGallery::create([
            'user_id' => $user->id,
            'image_url' => $imageUrl,
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return response()->json($item, 201);
    }

    public function deleteGallery(Request $request, ProfileGallery $item)
    {
        if ($item->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete file
        $oldFile = public_path(str_replace(url('/'), '', $item->image_url));
        if (file_exists($oldFile)) {
            @unlink($oldFile);
        }

        $item->delete();
        return response()->json(['message' => 'Gallery item deleted']);
    }
}
