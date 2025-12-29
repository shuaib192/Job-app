<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\Application;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Job::with(['employer.profile', 'company'])->withCount('applications')->latest();

            if ($request->has('my_jobs')) {
                $query->where('employer_id', $request->user()->id);
            }


            if ($request->has('location')) {
                $query->where('location', 'like', '%' . $request->location . '%');
            }

            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('skills', 'like', "%{$search}%")
                      ->orWhereHas('company', function($c) use ($search) {
                          $c->where('name', 'like', "%{$search}%");
                      });
                });
            }

            $jobs = $query->paginate(15);
            
            $jobs->getCollection()->transform(function($job) use ($request) {
                $user = $request->user();
                $job->has_bookmarked = $user ? \App\Models\Bookmark::where('user_id', $user->id)
                    ->where('bookmarkable_id', $job->id)
                    ->where('bookmarkable_type', Job::class)
                    ->exists() : false;
                return $job;
            });

            return response()->json($jobs);
        } catch (\Exception $e) {
            \Log::error('Job Index Error: ' . $e->getMessage());
            return response()->json([
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'total' => 0
            ]);
        }
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'employer' && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'skills' => 'nullable|array',
            'location' => 'nullable|string',
            'salary_range' => 'nullable|string',
            'type' => 'nullable|string',
            'company_id' => 'nullable|exists:companies,id', // Made optional
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $job = Job::create([
            'employer_id' => $request->user()->id,
            'company_id' => $request->company_id, // Can be null now

            'title' => $request->title,
            'description' => $request->description,
            'skills' => $request->skills,
            'location' => $request->location,
            'salary_range' => $request->salary_range,
            'type' => $request->type,
        ]);

        return response()->json($job, 201);
    }

    public function show(Request $request, Job $job)
    {
        $job->load(['employer.profile', 'company', 'applications.user']);
        
        $job->has_applied = \App\Models\Application::where('user_id', $request->user()->id)
                                                    ->where('job_id', $job->id)
                                                    ->exists();
        
        $job->has_bookmarked = \App\Models\Bookmark::where('user_id', $request->user()->id)
                                                    ->where('bookmarkable_id', $job->id)
                                                    ->where('bookmarkable_type', Job::class)
                                                    ->exists();

        return response()->json($job);
    }


    public function apply(Request $request, Job $job)
    {
        if ($request->user()->role !== 'applicant') {
            return response()->json(['error' => 'Only applicants can apply for jobs'], 403);
        }

        $exist = Application::where('user_id', $request->user()->id)
                            ->where('job_id', $job->id)
                            ->first();
        
        if ($exist) {
            return response()->json(['error' => 'Already applied for this job'], 400);
        }

        Application::create([
            'user_id' => $request->user()->id,
            'job_id' => $job->id,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Application submitted successfully']);
    }

    public function myApplications(Request $request)
    {
        return response()->json($request->user()->applications()->with('job.employer')->get());
    }

    public function myPostedJobs(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'employer' && $user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $jobs = \App\Models\Job::where('employer_id', $user->id)
            ->withCount('applications')
            ->latest()
            ->get();

        return response()->json($jobs);
    }

    // Employer Features
    public function jobApplicants(Request $request, Job $job)
    {
        if ($job->employer_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($job->applications()->with('user.profile')->get());
    }

    public function updateApplicationStatus(Request $request, Application $application)
    {
        $job = $application->job;

        if ($job->employer_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:reviewed,shortlisted,rejected,accepted',
            'feedback' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $previousStatus = $application->status;
        $application->update($request->only(['status', 'feedback']));

        if ($previousStatus !== $request->status) {
            // Create Notification
            \App\Models\Notification::create([
                'user_id' => $application->user_id,
                'type' => 'application_status',
                'data' => [
                    'job_id' => $job->id,
                    'job_title' => $job->title,
                    'status' => $request->status,
                    'message' => "Your application for '{$job->title}' has been {$request->status}."
                ],
                'read' => false
            ]);

            // Automated message if accepted or shortlisted
            if ($request->status === 'accepted' || $request->status === 'shortlisted') {
                \App\Models\Message::create([
                    'sender_id' => $request->user()->id,
                    'receiver_id' => $application->user_id,
                    'message' => "Congratulations! Your application for '{$job->title}' has been " . ($request->status === 'accepted' ? "accepted" : "shortlisted") . ". I would like to discuss the next steps with you.",
                    'type' => 'text'
                ]);
            }
        }

        return response()->json(['message' => 'Application status updated', 'application' => $application]);
    }

    public function toggleBookmark(Request $request, Job $job)
    {
        $user = $request->user();
        $bookmark = \App\Models\Bookmark::where('user_id', $user->id)
            ->where('bookmarkable_id', $job->id)
            ->where('bookmarkable_type', Job::class)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            return response()->json(['message' => 'Bookmark removed', 'is_bookmarked' => false]);
        }

        \App\Models\Bookmark::create([
            'user_id' => $user->id,
            'bookmarkable_id' => $job->id,
            'bookmarkable_type' => Job::class,
        ]);

        return response()->json(['message' => 'Job bookmarked', 'is_bookmarked' => true]);
    }

    public function bookmarkedJobs(Request $request)
    {
        $jobIds = \App\Models\Bookmark::where('user_id', $request->user()->id)
            ->where('bookmarkable_type', Job::class)
            ->pluck('bookmarkable_id');

        $jobs = Job::whereIn('id', $jobIds)->with('employer')->get();

        return response()->json($jobs);
    }

    public function destroy(Request $request, Job $job)
    {
        if ($job->employer_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete related bookmarks and applications first if necessary
        // Application::where('job_id', $job->id)->delete();
        $job->delete();

        return response()->json(['message' => 'Job deleted successfully']);
    }
}

