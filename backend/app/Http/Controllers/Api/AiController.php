<?php
/**
 * Code by shuaibu abdulmumini (08122598372 / 07049906420) shuaibabdul192@gmail.com
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    /**
     * Get AI configuration for mobile app
     */
    public function config()
    {
        $enabled = SystemSetting::get('ai_enabled', '0') == '1';
        
        if (!$enabled) {
            return response()->json([
                'enabled' => false,
            ]);
        }

        return response()->json([
            'enabled' => true,
            'name' => SystemSetting::get('ai_name', 'NexaBot'),
            'greeting' => SystemSetting::get('ai_greeting', 'Hi! I\'m NexaBot, your personal career assistant. How can I help you today?'),
            'suggested_prompts' => [
                'How do I find jobs on NexaWork?',
                'Help me improve my profile',
                'How do I connect with professionals?',
                'What features does NexaWork have?',
            ],
        ]);
    }

    /**
     * Chat with AI assistant
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'history' => 'nullable|array',
        ]);

        $enabled = SystemSetting::get('ai_enabled', '0') == '1';
        if (!$enabled) {
            return response()->json(['error' => 'AI Assistant is currently disabled.'], 400);
        }

        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-2.5-flash-preview-05-20');
        $apiKey = SystemSetting::get('ai_api_key');
        $systemPrompt = SystemSetting::get('ai_system_prompt', $this->getDefaultSystemPrompt());

        if (empty($apiKey)) {
            return response()->json(['error' => 'AI API key not configured. Please contact support.'], 500);
        }

        try {
            $response = match ($provider) {
                'gemini' => $this->callGemini($apiKey, $model, $systemPrompt, $request->message, $request->history ?? []),
                'openai' => $this->callOpenAI($apiKey, $model, $systemPrompt, $request->message, $request->history ?? []),
                'groq' => $this->callGroq($apiKey, $model, $systemPrompt, $request->message, $request->history ?? []),
                default => throw new \Exception('Unknown AI provider'),
            };

            return response()->json([
                'response' => $response,
                'model' => $model,
            ]);
        } catch (\Exception $e) {
            \Log::error('AI Chat Error: ' . $e->getMessage());
            return response()->json(['error' => 'Sorry, I encountered an issue. Please try again later.'], 500);
        }
    }

    private function callGemini($apiKey, $model, $systemPrompt, $message, $history)
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        // Build contents array with history
        $contents = [];
        
        // Add history
        foreach ($history as $msg) {
            $contents[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'model',
                'parts' => [['text' => $msg['content']]],
            ];
        }

        // Add current message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $message]],
        ];

        $response = Http::timeout(60)->post($url, [
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 1024,
            ],
        ]);

        if (!$response->successful()) {
            \Log::error('Gemini API Error: ' . $response->body());
            throw new \Exception('Gemini API error: ' . $response->status());
        }

        $data = $response->json();
        return $data['candidates'][0]['content']['parts'][0]['text'] ?? 'I couldn\'t generate a response.';
    }

    private function callOpenAI($apiKey, $model, $systemPrompt, $message, $history)
    {
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content'],
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
        ])->timeout(60)->post('https://api.openai.com/v1/chat/completions', [
            'model' => $model,
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 1024,
        ]);

        if (!$response->successful()) {
            \Log::error('OpenAI API Error: ' . $response->body());
            throw new \Exception('OpenAI API error: ' . $response->status());
        }

        $data = $response->json();
        return $data['choices'][0]['message']['content'] ?? 'I couldn\'t generate a response.';
    }

    private function callGroq($apiKey, $model, $systemPrompt, $message, $history)
    {
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content'],
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
        ])->timeout(60)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => $model,
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 1024,
        ]);

        if (!$response->successful()) {
            \Log::error('Groq API Error: ' . $response->body());
            throw new \Exception('Groq API error: ' . $response->status());
        }

        $data = $response->json();
        return $data['choices'][0]['message']['content'] ?? 'I couldn\'t generate a response.';
    }

    private function getDefaultSystemPrompt()
    {
        return <<<EOT
You are NexaBot, the official AI assistant for NexaWork - a professional networking and job discovery mobile app built by Shuaibu Abdulmumini.

**About NexaWork:**
NexaWork is a comprehensive mobile platform designed for Nigerian professionals. It offers:

1. **Job Discovery**: Browse and apply to curated job listings from verified employers. Filter by location, salary, and job type.

2. **Professional Networking (Linkup)**: A Tinder-style swiping feature to discover and connect with other professionals in your industry. When both users swipe right, they match and can start chatting.

3. **Real-time Messaging**: Direct messaging with your connections including support for images, files, and emoji reactions.

4. **Profile Management**: Create a detailed professional profile showcasing your skills, experience, bio, and portfolio. Add profile pictures and keep your information updated.

5. **Job Posting** (for Employers): Employers can post job listings, manage applications, and connect with potential candidates.

6. **Push Notifications**: Get instant alerts for new job matches, connection requests, and messages.

**Your Role:**
- Help users navigate the app and discover its features
- Provide tips for improving profiles and standing out to employers
- Answer questions about job searching in Nigeria
- Be friendly, encouraging, and professional
- Keep responses concise (under 150 words unless more detail is needed)
- If you don't know something specific about a user's account, politely explain they should check the app directly

**Important Notes:**
- Always be positive and supportive
- Encourage users to complete their profiles
- Remind users that networking increases their chances of finding opportunities
- If asked about technical issues, suggest contacting support
EOT;
    }
}
