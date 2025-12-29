<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Block;
use App\Models\User;

class BlockController extends Controller
{
    public function store(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['error' => 'You cannot block yourself'], 400);
        }

        Block::updateOrCreate([
            'user_id' => $request->user()->id,
            'blocked_user_id' => $user->id
        ]);

        // Automatically remove connection if it exists
        \App\Models\Connection::where(function($query) use ($request, $user) {
            $query->where('user_id', $request->user()->id)->where('connection_id', $user->id);
        })->orWhere(function($query) use ($request, $user) {
            $query->where('user_id', $user->id)->where('connection_id', $request->user()->id);
        })->delete();

        return response()->json(['message' => 'User blocked successfully']);
    }

    public function destroy(Request $request, User $user)
    {
        Block::where('user_id', $request->user()->id)
             ->where('blocked_user_id', $user->id)
             ->delete();

        return response()->json(['message' => 'User unblocked successfully']);
    }

    public function index(Request $request)
    {
        $blockedUsers = Block::where('user_id', $request->user()->id)
                            ->with('blockedUser')
                            ->get();
        return response()->json($blockedUsers);
    }
}

