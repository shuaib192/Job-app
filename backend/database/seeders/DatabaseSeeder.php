<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\Job;
use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create a few users if they don't exist
        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => Hash::make('password'),
                'role' => 'applicant',
                'location' => 'Lagos, Nigeria'
            ],
            [
                'name' => 'Jane Tech',
                'email' => 'jane@example.com',
                'password' => Hash::make('password'),
                'role' => 'applicant',
                'location' => 'Abuja, Nigeria'
            ],
            [
                'name' => 'NexaCorp Ltd',
                'email' => 'hr@nexacorp.com',
                'password' => Hash::make('password'),
                'role' => 'employer',
                'location' => 'Victoria Island, Lagos'
            ],
            [
                'name' => 'Global Soft',
                'email' => 'recruit@globalsoft.io',
                'password' => Hash::make('password'),
                'role' => 'employer',
                'location' => 'Remote'
            ],
        ];

        foreach ($users as $userData) {
            $user = User::updateOrCreate(['email' => $userData['email']], $userData);
            
            // Create profile for each user
            Profile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'bio' => 'Building the future of recruitment in Africa.',
                    'industry' => $user->role === 'employer' ? 'Technology' : 'Software Engineering',
                    'skills' => ['Laravel', 'React Native', 'AWS', 'PHP', 'Tailwind'],
                    'experience' => '5 years of professional experience.',
                    'education' => 'B.Sc. Computer Science',
                    'is_open_to_work' => true
                ]
            );
        }

        // 2. Create sample Jobs
        $employers = User::where('role', 'employer')->get();
        foreach ($employers as $employer) {
            Job::create([
                'employer_id' => $employer->id,
                'title' => 'Senior Backend Developer',
                'description' => 'We are looking for a Laravel expert to join our team in Lagos. Requirements: 5+ years of PHP, Laravel, and MySQL experience.',
                'skills' => ['PHP', 'Laravel', 'MySQL', 'Redis'],
                'location' => $employer->location,
                'salary_range' => '₦500,000 - ₦800,000',
                'type' => 'Full-time',
                'status' => 'open'
            ]);

            Job::create([
                'employer_id' => $employer->id,
                'title' => 'Mobile App Engineer',
                'description' => 'Help us build the next generation of professional networking apps. Requirements: Strong experience with React Native and Expo.',
                'skills' => ['React Native', 'Expo', 'TypeScript'],
                'location' => 'Remote',
                'salary_range' => '$3,000 - $5,000',
                'type' => 'Contract',
                'status' => 'open'
            ]);
        }

        // 3. Create sample Posts
        $allUsers = User::all();
        foreach ($allUsers as $user) {
            Post::create([
                'user_id' => $user->id,
                'content' => "Just joined NexaWork! Rebuilding my professional network in " . ($user->location ?? 'Nigeria') . ". #Networking #Tech",
                'type' => 'general'
            ]);
        }
    }
}
