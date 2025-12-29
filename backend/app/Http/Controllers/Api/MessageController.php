<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\SystemSetting;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Get list of conversations
            $conversations = Message::where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id)
                ->with(['sender', 'receiver'])
                ->latest()
                ->get()
                ->groupBy(function ($message) use ($user) {
                    return $message->sender_id === $user->id 
                        ? $message->receiver_id 
                        : $message->sender_id;
                })
                ->map(function ($messages, $otherUserId) use ($user) {
                    $lastMessage = $messages->first();
                    $unreadCount = $messages->where('receiver_id', $user->id)
                                           ->where('is_read', false)
                                           ->count();
                    $otherUser = $lastMessage->sender_id === $user->id 
                        ? $lastMessage->receiver 
                        : $lastMessage->sender;

                    // Better preview text for non-text messages
                    $previewText = $lastMessage->message;
                    if ($lastMessage->type === 'image') {
                        $previewText = '📷 [Image]';
                    } elseif ($lastMessage->type === 'file') {
                        $previewText = '📄 [File]';
                    }

                    return [
                        'other_user' => $otherUser,
                        'last_message' => [
                            'id' => $lastMessage->id,
                            'message' => $previewText,
                            'type' => $lastMessage->type,
                            'created_at' => $lastMessage->created_at,
                        ],
                        'unread_count' => $unreadCount,
                        'updated_at' => $lastMessage->created_at
                    ];
                })
                ->values()
                ->sortByDesc('updated_at')
                ->values();

            return response()->json($conversations);
        } catch (\Exception $e) {
            \Log::error('Message Index Error: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }

    public function show(Request $request, User $user)
    {
        $currentUser = $request->user();

        $messages = Message::where(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $currentUser->id)->where('receiver_id', $user->id);
        })->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $user->id)->where('receiver_id', $currentUser->id);
        })->oldest()->get();

        // Mark as read
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $currentUser->id)
            ->update(['is_read' => true]);

        // Also mark notifications as read
        Notification::where('user_id', $currentUser->id)
            ->where('type', 'message')
            ->where('data->from_id', $user->id)
            ->update(['read' => true]);

        return response()->json($messages);
    }

    public function store(Request $request, User $user = null)
    {
        $receiverId = $user ? $user->id : $request->receiver_id;

        $validator = Validator::make($request->all(), [
            'message' => 'nullable|string',
            'image' => 'nullable|string',
            'file' => 'nullable', // Can be a string (base64) or a File object
            'type' => 'nullable|string',
        ]);

        if (!$receiverId) {
             return response()->json(['receiver_id' => ['The receiver id field is required.']], 400);
        }

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $fileUrl = null;
        $imageUrl = $request->input('image'); // Can still be base64 from legacy/simple calls
        $type = $request->input('type', 'text');

        // Handle Image File Upload
        if ($request->hasFile('image_file')) {
            $image = $request->file('image_file');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $storagePath = public_path('storage/messages/images');
            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0777, true);
            }
            $image->move($storagePath, $imageName);
            $imageUrl = url('storage/messages/images/' . $imageName);
        }

        // Handle File Upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $storagePath = public_path('storage/messages/files');
            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0777, true);
            }
            $file->move($storagePath, $fileName);
            $fileUrl = url('storage/messages/files/' . $fileName);
        }

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $receiverId,
            'message' => SystemSetting::filterContent($request->message),
            'image' => $imageUrl,
            'file_url' => $fileUrl,
            'type' => $type,
        ]);

        // Create Notification
        Notification::create([
            'user_id' => $receiverId,
            'type' => 'message',
            'data' => [
                'from_id' => $request->user()->id,
                'from_name' => $request->user()->name,
                'message' => SystemSetting::filterContent($request->message) ?: ($type === 'audio' ? 'Sent a voice message' : 'Sent a file'),
                'has_image' => !!$request->image,
                'has_file' => !!$fileUrl,
                'type' => $type
            ],
            'read' => false
        ]);

        return response()->json($message->load(['sender', 'receiver']), 201);
    }


    public function unreadCount(Request $request)
    {
        $count = Message::where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    public function destroy(Request $request, Message $message)
    {
        // Only the sender can delete their own messages
        if ($message->sender_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->delete();
        return response()->json(['message' => 'Message deleted']);
    }
}

