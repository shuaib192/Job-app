<?php
/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ConnectionController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\BlockController;
use App\Http\Controllers\Api\CompanyController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'me']);
    Route::post('verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('push-token', [AuthController::class, 'updatePushToken']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});


Route::middleware('auth:api')->group(function () {
    // Profile Routes
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    Route::post('profile/experience', [ProfileController::class, 'addExperience']);
    Route::post('profile/education', [ProfileController::class, 'addEducation']);
    Route::get('users/{id}/profile', [ProfileController::class, 'showById']);
    Route::get('profile/{slug}', [ProfileController::class, 'publicProfile']);

    // Connection Routes
    Route::get('connections', [ConnectionController::class, 'index']);
    Route::get('connections/pending', [ConnectionController::class, 'pendingRequests']);
    Route::post('connections/send/{user}', [ConnectionController::class, 'sendRequest']);
    Route::post('connections/{connection}/accept', [ConnectionController::class, 'acceptRequest']);
    Route::post('connections/{connection}/ignore', [ConnectionController::class, 'ignoreRequest']);
    Route::delete('connections/{user}/cancel', [ConnectionController::class, 'cancelRequest']);
    Route::delete('connections/{user}/remove', [ConnectionController::class, 'removeConnection']);

    Route::post('/profile/experience', [ProfileController::class, 'addExperience']);
    Route::post('/profile/education', [ProfileController::class, 'addEducation']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::put('/settings/privacy', [ProfileController::class, 'updatePrivacy']);
    Route::post('/settings/change-password', [ProfileController::class, 'changePassword']);

    // Profile Gallery
    Route::get('/profile/gallery/{userId?}', [ProfileController::class, 'getGallery']);
    Route::post('/profile/gallery', [ProfileController::class, 'uploadGallery']);
    Route::delete('/profile/gallery/{item}', [ProfileController::class, 'deleteGallery']);

    // Job Routes
    Route::get('/jobs', [JobController::class, 'index']);
    Route::post('/jobs', [JobController::class, 'store']);
    Route::get('/jobs/bookmarked', [JobController::class, 'bookmarkedJobs']);
    Route::get('/jobs/my-posted-jobs', [JobController::class, 'myPostedJobs']);
    Route::get('/jobs/my-applications', [JobController::class, 'myApplications']);
    Route::get('/jobs/{job}', [JobController::class, 'show']);
    Route::delete('/jobs/{job}', [JobController::class, 'destroy']);
    Route::post('/jobs/{job}/apply', [JobController::class, 'apply']);
    Route::post('/jobs/{job}/bookmark', [JobController::class, 'toggleBookmark']);
    Route::get('/jobs/{job}/applicants', [JobController::class, 'jobApplicants']);
    Route::put('applications/{application}/status', [JobController::class, 'updateApplicationStatus']);

    // Feed & Matching Routes
    Route::get('feed', [FeedController::class, 'index']);
    Route::post('feed', [FeedController::class, 'store']);
    Route::get('feed/matching', [FeedController::class, 'matching']);
    Route::get('feed/candidates', [FeedController::class, 'candidates']);
    Route::get('feed/nearby', [FeedController::class, 'nearby']);
    Route::get('feed/search', [FeedController::class, 'search']);
    Route::get('posts/{post}', [FeedController::class, 'show']);
    Route::delete('posts/{post}', [FeedController::class, 'destroy']);
    Route::post('posts/{post}/like', [\App\Http\Controllers\Api\LikeController::class, 'toggle']);
    Route::get('posts/{post}/comments', [\App\Http\Controllers\Api\CommentController::class, 'index']);
    Route::post('posts/{post}/comments', [\App\Http\Controllers\Api\CommentController::class, 'store']);



    // Message Routes
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('/messages/{user}', [MessageController::class, 'show']);
    Route::post('messages/{user}', [MessageController::class, 'store']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);


    // Notification Routes
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/delete-all', [NotificationController::class, 'deleteAll']);

    // Block Routes
    Route::get('blocks', [BlockController::class, 'index']);
    Route::post('blocks/{user}', [BlockController::class, 'store']);
    // Company Routes
    Route::get('companies', [CompanyController::class, 'index']);
    Route::post('companies', [CompanyController::class, 'store']);
    Route::get('companies/my', [CompanyController::class, 'myCompanies']);
    Route::get('companies/{id}', [CompanyController::class, 'show']);
    Route::put('companies/{company}', [CompanyController::class, 'update']);
    Route::delete('companies/{company}', [CompanyController::class, 'destroy']);
});


