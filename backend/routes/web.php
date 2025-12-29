<?php
/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Admin Authentication
Route::get('/admin/login', [\App\Http\Controllers\AdminAuthController::class, 'showLoginForm'])->name('login');
Route::post('/admin/login', [\App\Http\Controllers\AdminAuthController::class, 'login']);
Route::post('/admin/logout', [\App\Http\Controllers\AdminAuthController::class, 'logout'])->name('logout');

// Admin Panel Routes (Protected)
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\AdminWebController::class, 'dashboard']);
    
    // User Management
    Route::get('/users', [\App\Http\Controllers\AdminWebController::class, 'users'])->name('admin.users');
    Route::post('/users/{user}/block', [\App\Http\Controllers\AdminWebController::class, 'blockUser'])->name('admin.users.block');
    Route::post('/users/{user}/role', [\App\Http\Controllers\AdminWebController::class, 'changeRole'])->name('admin.users.role');
    Route::delete('/users/{user}', [\App\Http\Controllers\AdminWebController::class, 'deleteUser'])->name('admin.users.delete');

    // Job Management
    Route::get('/jobs', [\App\Http\Controllers\AdminWebController::class, 'jobs'])->name('admin.jobs');
    Route::delete('/jobs/{job}', [\App\Http\Controllers\AdminWebController::class, 'deleteJob'])->name('admin.jobs.delete');

    // Directory Management (Skills/Industries)
    Route::get('/directories', [\App\Http\Controllers\AdminWebController::class, 'directories'])->name('admin.directories');
    Route::post('/directories/skills', [\App\Http\Controllers\AdminWebController::class, 'addSkill'])->name('admin.skills.add');
    Route::delete('/directories/skills/{skill}', [\App\Http\Controllers\AdminWebController::class, 'deleteSkill'])->name('admin.skills.delete');
    Route::post('/directories/industries', [\App\Http\Controllers\AdminWebController::class, 'addIndustry'])->name('admin.industries.add');
    Route::delete('/directories/industries/{industry}', [\App\Http\Controllers\AdminWebController::class, 'deleteIndustry'])->name('admin.industries.delete');

    // Export Management
    Route::get('/export/users', [\App\Http\Controllers\AdminWebController::class, 'exportUsers'])->name('admin.export.users');
    Route::get('/export/jobs', [\App\Http\Controllers\AdminWebController::class, 'exportJobs'])->name('admin.export.jobs');

    // Settings
    Route::get('/settings', [\App\Http\Controllers\AdminWebController::class, 'settings'])->name('admin.settings');
    Route::post('/settings', [\App\Http\Controllers\AdminWebController::class, 'updateSettings']);

    // Broadcast
    Route::post('/broadcast', [\App\Http\Controllers\AdminWebController::class, 'broadcastPush'])->name('admin.broadcast');
});
