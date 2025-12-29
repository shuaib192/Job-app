<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    public function store(Request $request, Post $post)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'post_id' => $post->id,
            'content' => $request->content
        ]);

        // Notify post owner
        if ($post->user_id !== $request->user()->id) {
            Notification::create([
                'user_id' => $post->user_id,
                'type' => 'post_commented',
                'data' => [
                    'from_id' => $request->user()->id,
                    'from_name' => $request->user()->name,
                    'post_id' => $post->id,
                    'message' => 'commented on your post'
                ],
                'read' => false
            ]);
        }

        return response()->json($comment->load('user'), 201);
    }

    public function index(Post $post)
    {
        return response()->json($post->comments()->with('user')->get());
    }
}
