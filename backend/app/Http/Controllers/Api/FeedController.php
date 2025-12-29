<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Job;
use App\Models\Connection;
use App\Models\Block;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Validator;
use App\Models\SystemSetting;

class FeedController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['data' => [], 'message' => 'Please login'], 401);
        }

        // Filter for My Posts
        if ($request->has('my_posts')) {
            $myPosts = Post::with(['user.profile', 'comments.user', 'likes'])
                ->where('user_id', $user->id)
                ->latest()
                ->paginate(20);
            
            return response()->json($myPosts);
        }
        
        // Get Blocked Users (Both blocked by me and who blocked me)

        $blockedIds = Block::where('user_id', $user->id)->pluck('blocked_user_id')->toArray();
        $blockedByIds = Block::where('blocked_user_id', $user->id)->pluck('user_id')->toArray();
        $excludeIds = array_unique(array_merge($blockedIds, $blockedByIds, [$user->id]));

        // Get user connections (1st degree)
        $connectionIds = Connection::where(function($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('connection_id', $user->id);
        })->where('status', 'accepted')
        ->get()
        ->map(function($c) use ($user) {
            return $c->user_id == $user->id ? $c->connection_id : $c->user_id;
        })
        ->unique()
        ->toArray();

        // Remove excluded IDs from connections
        $connectionIds = array_diff($connectionIds, $excludeIds);

        // Get user's industry for interest-based matching
        $userProfile = $user->profile;
        $userIndustry = $userProfile ? $userProfile->industry : null;
        
        // LinkedIn-style Algorithm:
        // Recent posts from connections (Priority 1)
        $connectionPosts = Post::with(['user.profile', 'comments.user', 'likes'])
            ->whereIn('user_id', $connectionIds)
            ->whereNotIn('user_id', $excludeIds)
            ->latest()
            ->take(15)
            ->get();
        
        // Priority 2: Related to Profile (Industry OR Skills)
        $userSkills = $userProfile ? ($userProfile->skills ?? []) : [];
        if (!is_array($userSkills)) {
            $userSkills = json_decode($userSkills, true) ?? [];
        }

        $relatedPosts = collect();
        if ($userIndustry || !empty($userSkills)) {
            $relatedUserIds = \App\Models\Profile::where(function($q) use ($userIndustry, $userSkills) {
                    if ($userIndustry) {
                        $q->where('industry', 'LIKE', "%$userIndustry%");
                    }
                    if (!empty($userSkills)) {
                        foreach ($userSkills as $skill) {
                            $q->orWhere('skills', 'LIKE', "%$skill%");
                        }
                    }
                })
                ->whereNotIn('user_id', array_merge($connectionIds, $excludeIds))
                ->pluck('user_id')
                ->toArray();
            
            $relatedPosts = Post::with(['user.profile', 'comments.user', 'likes'])
                ->whereIn('user_id', $relatedUserIds)
                ->whereNotIn('user_id', $excludeIds)
                ->latest()
                ->take(15) // Increased from 10
                ->get();
        }
        
        // Discovery / Trending (Priority 3) - "See Everything" fallback
        // Fetch MORE to ensure the feed isn't empty if user has no connections/interests
        $discoveryPosts = Post::with(['user.profile', 'comments.user', 'likes'])
            ->whereNotIn('user_id', array_merge($connectionIds, $excludeIds))
            // ->withCount('likes') // Removed heavy sort for performance, rely on latest + some randomization if needed
            ->latest()
            ->take(20) // Increased from 10
            ->get();
        
        // Combine and sort by "Weight"
        // Weight = Score (Connection=10, Related=5, Others=1) + (Likes * 0.2) - (Recency * 0.1)
        $allPosts = $connectionPosts->map(fn($p) => ['post' => $p, 'score' => 10])
            ->concat($relatedPosts->map(fn($p) => ['post' => $p, 'score' => 5]))
            ->concat($discoveryPosts->map(fn($p) => ['post' => $p, 'score' => 1]))
            ->unique(fn($item) => $item['post']->id)
            ->map(function($item) use ($user) {
                $post = $item['post'];
                $postArray = $post->toArray();
                $postArray['liked_by_user'] = $post->likes->contains('user_id', $user->id);
                $postArray['likes_count'] = $post->likes->count();
                
                // Final weight calculation for sorting
                $recencyBonus = (time() - strtotime($post->created_at)) / 3600; // hours ago
                $item['final_score'] = $item['score'] + ($postArray['likes_count'] * 0.2) - ($recencyBonus * 0.1);
                
                return array_merge($postArray, ['final_score' => $item['final_score']]);
            })
            ->sortByDesc('final_score')
            ->values()
            ->take(50); // Increased total feed size to 50

        
        return response()->json([
            'data' => $allPosts,
            'current_page' => 1,
            'last_page' => 1,
        ]);
    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'type' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string', // Base64 or URL
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => SystemSetting::filterContent($request->content),
            'images' => $request->images ?? [],
            'type' => $request->type ?? 'general',
        ]);

        return response()->json($post->load('user'), 201);
    }

    public function show(Request $request, Post $post)
    {
        $post->load(['user.profile', 'comments.user', 'likes']);
        
        $response = $post->toArray();
        $response['liked_by_user'] = $post->likes->contains('user_id', $request->user()->id);
        $response['likes_count'] = $post->likes->count();
        $response['comments'] = $post->comments;
        
        return response()->json($response);
    }

    public function destroy(Request $request, Post $post)
    {
        // Only post owner or admin can delete
        if ($post->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete related comments and likes first
        $post->comments()->delete();
        $post->likes()->delete();
        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }


    public function matching(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['recommended_jobs' => [], 'recommended_people' => []], 401);
            }
            $user->load('profile');
            $userSkills = $user->profile?->skills ?? [];

            // Simple skill-based matching for jobs
            $jobs = Job::where('status', 'open')
                ->get()
                ->map(function ($job) use ($userSkills) {
                    $jobSkills = $job->skills ?? [];
                    $intersect = array_intersect($userSkills, $jobSkills);
                    $job->match_percentage = count($jobSkills) > 0 ? (count($intersect) / count($jobSkills)) * 100 : 0;
                    return $job;
                })
                ->sortByDesc('match_percentage')
                ->values()
                ->take(5);

            // Simple skill-based matching for people
            $people = \App\Models\Profile::where('user_id', '!=', $user->id)
                ->with('user')
                ->get()
                ->map(function ($profile) use ($userSkills) {
                    $profileSkills = $profile->skills ?? [];
                    if (!is_array($profileSkills)) {
                        $profileSkills = json_decode($profileSkills, true) ?? [];
                    }
                    if (!is_array($userSkills)) {
                        $userSkills = json_decode($userSkills, true) ?? [];
                    }
                    $intersect = array_intersect($userSkills, $profileSkills);
                    $profile->match_score = count($intersect);
                    return $profile;
                })
                ->sortByDesc('match_score')
                ->values()
                ->take(5);

            return response()->json([
                'recommended_jobs' => $jobs,
                'recommended_people' => $people
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'recommended_jobs' => [],
                'recommended_people' => []
            ]);
        }
    }

    public function candidates(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([], 401);
        }
        
        // Return users that are NOT the current user AND not already CONNECTED (accepted)
        $acceptedConnectionIds = Connection::where(function($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('connection_id', $user->id);
        })->where('status', 'accepted')->get()->map(function($c) use ($user) {
            return $c->user_id == $user->id ? $c->connection_id : $c->user_id;
        })->toArray();

        // Also get pending ones to mark them
        $pendingConnections = Connection::where(function($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('connection_id', $user->id);
        })->where('status', 'pending')->get();

        // Default search/discovery logic
        $query = \App\Models\User::where('id', '!=', $user->id)
            ->where('role', '!=', 'admin') // Strictly hide admins
            ->with(['profile', 'posts']);

        // When NOT searching, we only show non-connected candidates
        if (!$request->has('search')) {
            $query->whereNotIn('id', $acceptedConnectionIds);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('profile', function($p) use ($search) {
                      $p->where('current_position', 'like', "%{$search}%")
                        ->orWhere('industry', 'like', "%{$search}%")
                        ->orWhere('headline', 'like', "%{$search}%");
                  });
            });
        }

        $candidates = $query->limit(50)->get()->map(function($candidate) use ($user, $pendingConnections, $acceptedConnectionIds) {
            $pending = $pendingConnections->where('user_id', $user->id)->where('connection_id', $candidate->id)->first();
            $incoming = $pendingConnections->where('user_id', $candidate->id)->where('connection_id', $user->id)->first();
            $isAccepted = in_array($candidate->id, $acceptedConnectionIds);

            if ($isAccepted) {
                $candidate->connection_status = 'accepted';
            } elseif ($pending) {
                $candidate->connection_status = 'pending_sent';
            } elseif ($incoming) {
                $candidate->connection_status = 'pending_received';
            } else {
                $candidate->connection_status = 'none';
            }
            return $candidate;
        });

        // Sort by relevance (Industry Match -> Location Match)
        $userIndustry = $user->profile?->industry;
        $userLocation = $user->location;

        $sorted = $candidates->sortByDesc(function ($candidate) use ($userIndustry, $userLocation) {
            $score = 0;
            // People we haven't interacted with yet get higher score than pending
            if ($candidate->connection_status === 'none') $score += 20;

            if ($userIndustry && stripos($candidate->profile?->industry, $userIndustry) !== false) {
                $score += 10;
            }
            if ($userLocation && stripos($candidate->location, $userLocation) !== false) {
                $score += 5;
            }
            // Boost completed profiles
            if ($candidate->profile?->bio) $score += 2;
            if ($candidate->avatar) $score += 2;
            
            return $score;
        })->values();

        return response()->json($sorted->take(20));

    }

    public function nearby(Request $request)
    {
        $user = $request->user();
        if (!$user->location) {
            return response()->json([]);
        }

        $connectedUserIds = Connection::where(function($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('connection_id', $user->id);
        })->get()->map(function($c) use ($user) {
            return $c->user_id == $user->id ? $c->connection_id : $c->user_id;
        })->toArray();

        $nearby = \App\Models\User::where('id', '!=', $user->id)
            ->where('location', 'like', '%' . $user->location . '%')
            ->whereNotIn('id', $connectedUserIds)
            ->with('profile')
            ->get();

        return response()->json($nearby);
    }

    public function search(Request $request)
    {
        $query = $request->query('q');
        $type = $request->query('type', 'people');

        if ($type === 'jobs') {
            $results = Job::where('title', 'like', "%$query%")
                ->orWhere('description', 'like', "%$query%")
                ->with('employer')
                ->latest()
                ->get();
        } else {
            $results = \App\Models\User::where('name', 'like', "%$query%")
                ->with('profile')
                ->latest()
                ->get();
        }

        return response()->json($results);
    }
}
