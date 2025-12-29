<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\User;

class DummyPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) return;

        $posts = [
            [
                'content' => "Excited to share that I've started a new position as Senior Software Architect! looking forward to the journey ahead. #newjob #career",
                'type' => 'announcement',
                'images' => [
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
                    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800'
                ]
            ],
            [
                'content' => "Just finished a productive networking session with some of the best minds in Tech. Collaboration is key! 🚀",
                'type' => 'general',
                'images' => [
                    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800'
                ]
            ],
            [
                'content' => "We are hiring! Looking for passionate React Native developers to join our growing team. DM me for more details. #hiring #reactnative",
                'type' => 'vacancy',
                'images' => [
                    'https://images.unsplash.com/photo-1515187081133-548ae0139bc9?q=80&w=800'
                ]
            ],
            [
                'content' => "Pro tip for junior developers: Never stop learning. The tech landscape evolves daily, stay curious! 🧠 #coding #tips",
                'type' => 'tip',
                'images' => []
            ],
            [
                'content' => "Great morning at the annual NexaWork Summit! amazing energy and professional insights.",
                'type' => 'announcement',
                'images' => [
                    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800',
                    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800',
                    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800'
                ]
            ]
        ];

        foreach ($posts as $postData) {
            $user = $users->random();
            Post::create([
                'user_id' => $user->id,
                'content' => $postData['content'],
                'type' => $postData['type'],
                'images' => $postData['images'],
            ]);
        }
    }
}
