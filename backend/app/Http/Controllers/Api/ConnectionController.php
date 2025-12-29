<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Connection;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class ConnectionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $connections = Connection::where(function($query) use ($request) {
                $query->where('user_id', $request->user()->id)
                      ->orWhere('connection_id', $request->user()->id);
            })->where('status', 'accepted')->with(['user', 'connection'])->get();

            return response()->json($connections);
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    public function sendRequest(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['error' => 'Cannot connect with yourself'], 400);
        }

        // Check if the other user already sent a request to me
        $incoming = Connection::where('user_id', $user->id)
                             ->where('connection_id', $request->user()->id)
                             ->where('status', 'pending')
                             ->first();

        if ($incoming) {
            $incoming->update(['status' => 'accepted']);
            
            // Notification for both
            Notification::create([
                'user_id' => $user->id,
                'type' => 'connection_accepted',
                'data' => [
                    'from_id' => $request->user()->id,
                    'from_name' => $request->user()->name,
                    'message' => 'matched with you! It\'s a Linkup!'
                ],
                'read' => false
            ]);

            return response()->json([
                'message' => 'It\'s a match!',
                'status' => 'accepted',
                'is_match' => true
            ]);
        }

        $exist = Connection::where(function($query) use ($request, $user) {
            $query->where('user_id', $request->user()->id)->where('connection_id', $user->id);
        })->first();

        if ($exist) {
            return response()->json(['message' => 'Connection already exists or requested', 'status' => $exist->status]);
        }

        Connection::create([
            'user_id' => $request->user()->id,
            'connection_id' => $user->id,
            'status' => 'pending'
        ]);

        // Create Notification
        Notification::create([
            'user_id' => $user->id,
            'type' => 'connection_request',
            'data' => [
                'from_id' => $request->user()->id,
                'from_name' => $request->user()->name,
                'message' => 'wants to connect with you'
            ],
            'read' => false
        ]);

        return response()->json(['message' => 'Connection request sent']);
    }

    public function acceptRequest(Request $request, Connection $connection)
    {
        if ($connection->connection_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $connection->update(['status' => 'accepted']);

        // Create Notification for the person who sent the request
        Notification::create([
            'user_id' => $connection->user_id,
            'type' => 'connection_accepted',
            'data' => [
                'from_id' => $request->user()->id,
                'from_name' => $request->user()->name,
                'message' => 'accepted your connection request'
            ],
            'read' => false
        ]);

        return response()->json(['message' => 'Connection request accepted']);
    }

    public function ignoreRequest(Request $request, Connection $connection)
    {
        if ($connection->connection_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $connection->update(['status' => 'rejected']);

        return response()->json(['message' => 'Connection request ignored']);
    }

    public function cancelRequest(Request $request, User $user)
    {
        Connection::where('user_id', $request->user()->id)
                  ->where('connection_id', $user->id)
                  ->where('status', 'pending')
                  ->delete();

        return response()->json(['message' => 'Connection request cancelled']);
    }

    public function removeConnection(Request $request, User $user)
    {
        Connection::where(function($query) use ($request, $user) {
            $query->where('user_id', $request->user()->id)->where('connection_id', $user->id);
        })->orWhere(function($query) use ($request, $user) {
            $query->where('user_id', $user->id)->where('connection_id', $request->user()->id);
        })->delete();

        return response()->json(['message' => 'Connection removed']);
    }

    public function pendingRequests(Request $request)
    {
        return response()->json(Connection::where('connection_id', $request->user()->id)
                                    ->where('status', 'pending')
                                    ->with('user')
                                    ->get());
    }
}
