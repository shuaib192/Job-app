<?php
/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\SystemSetting;
use App\Models\User;
use App\Models\Job;
use App\Models\Post;
use App\Models\Application;
use App\Models\Skill;
use App\Models\Industry;
use Response;

class AdminWebController extends Controller
{
    public function settings()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');
        return view('admin.settings', compact('settings'));
    }

    public function updateSettings(Request $request)
    {
        $settings = $request->except('_token');
        
        foreach ($settings as $key => $value) {
            SystemSetting::set($key, $value);
        }

        return redirect()->back()->with('success', 'Settings updated successfully');
    }

    public function dashboard()
    {
        $stats = [
            'users' => User::count(),
            'jobs' => Job::count(),
            'posts' => Post::count(),
            'applications' => Application::count(),
        ];

        // Chart Data: Registrations over last 7 days
        $chartData = [
            'labels' => [],
            'data' => []
        ];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $chartData['labels'][] = $date->format('M d');
            $chartData['data'][] = User::whereDate('created_at', $date->toDateString())->count();
        }

        return view('admin.dashboard', compact('stats', 'chartData'));
    }

    public function users()
    {
        $users = User::withCount(['posts', 'jobs', 'applications'])->paginate(20);
        return view('admin.users', compact('users'));
    }

    public function blockUser(Request $request, User $user)
    {
        $user->is_active = !$user->is_active;
        
        if (!$user->is_active) {
            $user->ban_reason = $request->input('ban_reason', 'Violation of community guidelines');
            $user->banned_at = now();
        } else {
            $user->ban_reason = null;
            $user->banned_at = null;
        }
        
        $user->save();
        $status = $user->is_active ? 'unblocked' : 'blocked';
        return redirect()->back()->with('success', "User has been {$status} successfully.");
    }

    public function changeRole(Request $request, User $user)
    {
        $request->validate(['role' => 'required|in:user,employer,admin']);
        $user->update(['role' => $request->role]);
        return redirect()->back()->with('success', "User role updated to {$request->role}.");
    }

    public function deleteUser(User $user)
    {
        $user->delete();
        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    public function jobs()
    {
        $jobs = Job::with('employer')->withCount('applications')->paginate(20);
        return view('admin.jobs', compact('jobs'));
    }

    public function deleteJob(Job $job)
    {
        $job->delete();
        return redirect()->back()->with('success', 'Job deleted successfully.');
    }

    public function posts()
    {
        $posts = Post::with('user')->withCount(['comments', 'likes'])->paginate(20);
        return view('admin.posts', compact('posts'));
    }

    public function deletePost(Post $post)
    {
        $post->delete();
        return redirect()->back()->with('success', 'Post deleted successfully.');
    }

    public function directories()
    {
        $skills = Skill::orderBy('name')->get();
        $industries = Industry::orderBy('name')->get();
        return view('admin.directories', compact('skills', 'industries'));
    }

    public function addSkill(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:skills,name']);
        Skill::create(['name' => $request->name]);
        return redirect()->back()->with('success', 'Skill added successfully.');
    }

    public function deleteSkill(Skill $skill)
    {
        $skill->delete();
        return redirect()->back()->with('success', 'Skill deleted successfully.');
    }

    public function addIndustry(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:industries,name']);
        Industry::create(['name' => $request->name]);
        return redirect()->back()->with('success', 'Industry added successfully.');
    }

    public function deleteIndustry(Industry $industry)
    {
        $industry->delete();
        return redirect()->back()->with('success', 'Industry deleted successfully.');
    }

    public function exportUsers()
    {
        $users = User::all();
        $csvHeader = ['ID', 'Name', 'Email', 'Role', 'Location', 'Joined At'];
        $callback = function() use ($users, $csvHeader) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $csvHeader);
            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->role,
                    $user->location,
                    $user->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=nexawork_users_export_" . date('Ymd_His') . ".csv"
        ]);
    }

    public function exportJobs()
    {
        $jobs = Job::with('employer')->get();
        $csvHeader = ['ID', 'Title', 'Employer', 'Location', 'Type', 'Applicants', 'Posted At'];
        $callback = function() use ($jobs, $csvHeader) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $csvHeader);
            foreach ($jobs as $job) {
                fputcsv($file, [
                    $job->id,
                    $job->title,
                    $job->employer->name ?? 'N/A',
                    $job->location,
                    $job->type,
                    $job->applications()->count(),
                    $job->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=nexawork_jobs_export_" . date('Ymd_His') . ".csv"
        ]);
    }

    public function broadcastPush(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:100',
            'body' => 'required|string|max:255',
        ]);

        \App\Services\PushNotificationService::broadcast($request->title, $request->body);

        return redirect()->back()->with('success', 'Notification broadcast sent to all users!');
    }
}
