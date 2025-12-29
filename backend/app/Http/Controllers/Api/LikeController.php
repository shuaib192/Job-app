<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Models\Post;
use App\Models\Notification;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, Post $post)
    {
        $user = $request->user();
        $like = Like::where('user_id', $user->id)->where('post_id', $post->id)->first();

        if ($like) {
            $like->delete();
            return response()->json(['message' => 'Post unliked', 'liked' => false]);
        }

        Like::create([
            'user_id' => $user->id,
            'post_id' => $post->id
        ]);

        // Notify post owner if it's not the same user
        if ($post->user_id !== $user->id) {
            Notification::create([
                'user_id' => $post->user_id,
                'type' => 'post_liked',
                'data' => [
                    'from_id' => $user->id,
                    'from_name' => $user->name,
                    'post_id' => $post->id,
                    'message' => 'liked your post'
                ],
                'read' => false
            ]);
        }

        return response()->json(['message' => 'Post liked', 'liked' => true]);
    }
}
