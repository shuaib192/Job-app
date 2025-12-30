@extends('admin.layout')

@section('title', 'Global Settings')

@section('content')
<div class="mb-8">
    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">System Configuration</h1>
    <p class="text-slate-500 mt-1">Manage global application variables and security settings.</p>
</div>

<div class="max-w-4xl">
    <form action="{{ route('admin.settings') }}" method="POST">
        @csrf
        <div class="space-y-8">
            <!-- Email Verification Section -->
            <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <i data-lucide="mail-check" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-slate-900">Security & Onboarding</h2>
                        <p class="text-sm text-slate-500">Enable or disable core security features.</p>
                    </div>
                </div>

                <div class="space-y-6">
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <p class="text-sm font-bold text-slate-900">Email Verification Required</p>
                            <p class="text-xs text-slate-500">Users must verify their email before using the app.</p>
                        </div>
                        <select name="email_verification_enabled" class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="1" {{ ($settings['email_verification_enabled'] ?? '') == '1' ? 'selected' : '' }}>Enabled</option>
                            <option value="0" {{ ($settings['email_verification_enabled'] ?? '') == '0' ? 'selected' : '' }}>Disabled</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">SMTP Host</label>
                            <input type="text" name="mail_host" value="{{ $settings['mail_host'] ?? 'smtp.hostinger.com' }}" placeholder="e.g. smtp.gmail.com" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">SMTP Port</label>
                            <input type="text" name="mail_port" value="{{ $settings['mail_port'] ?? '465' }}" placeholder="465 or 587" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">SMTP Username</label>
                            <input type="text" name="mail_username" value="{{ $settings['mail_username'] ?? '' }}" placeholder="your-email@domain.com" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">SMTP Password</label>
                            <input type="password" name="mail_password" value="{{ $settings['mail_password'] ?? '••••••••' }}" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                        </div>
                         <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Encryption</label>
                            <select name="mail_encryption" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                                <option value="ssl" {{ ($settings['mail_encryption'] ?? '') == 'ssl' ? 'selected' : '' }}>SSL (Port 465)</option>
                                <option value="tls" {{ ($settings['mail_encryption'] ?? '') == 'tls' ? 'selected' : '' }}>TLS (Port 587)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">From Name</label>
                            <input type="text" name="mail_from_name" value="{{ $settings['mail_from_name'] ?? 'NexaWork' }}" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Forbidden Keywords (CSV)</label>
                        <textarea name="forbidden_keywords" placeholder="e.g. scam, hate, gambling" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24">{{ $settings['forbidden_keywords'] ?? '' }}</textarea>
                        <p class="text-[10px] text-slate-400 mt-2 px-1 italic">Content containing these words will be automatically flagged or masked in chats and feed.</p>
                    </div>
                </div>
            </div>
            <!-- App Branding Section -->
            <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <i data-lucide="palette" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-slate-900">Branding & Content</h2>
                        <p class="text-sm text-slate-500">Customize the look and feel of NexaWork.</p>
                    </div>
                </div>

                <div class="space-y-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Support Email Address</label>
                        <input type="email" name="support_email" value="{{ $settings['support_email'] ?? 'support@nexawork.com' }}" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">App Version (Control)</label>
                        <input type="text" name="app_version" value="{{ $settings['app_version'] ?? '1.2.0' }}" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                    </div>
                </div>
            </div>

            <!-- AI Assistant Configuration Section -->
            <div class="bg-gradient-to-br from-violet-50 to-indigo-50 p-8 rounded-[2.5rem] border border-violet-200 shadow-sm">
                <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                        <i data-lucide="sparkles" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-slate-900">AI Assistant Configuration</h2>
                        <p class="text-sm text-slate-500">Power NexaWork with an intelligent assistant for your users.</p>
                    </div>
                </div>

                <div class="space-y-6">
                    <div class="flex items-center justify-between p-4 bg-white/70 rounded-2xl border border-violet-100">
                        <div>
                            <p class="text-sm font-bold text-slate-900">Enable AI Assistant</p>
                            <p class="text-xs text-slate-500">Allow users to chat with the NexaWork AI.</p>
                        </div>
                        <select name="ai_enabled" class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-violet-500 outline-none">
                            <option value="1" {{ ($settings['ai_enabled'] ?? '') == '1' ? 'selected' : '' }}>Enabled</option>
                            <option value="0" {{ ($settings['ai_enabled'] ?? '0') == '0' ? 'selected' : '' }}>Disabled</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">AI Provider</label>
                            <select name="ai_provider" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all">
                                <option value="gemini" {{ ($settings['ai_provider'] ?? 'gemini') == 'gemini' ? 'selected' : '' }}>Google Gemini</option>
                                <option value="openai" {{ ($settings['ai_provider'] ?? '') == 'openai' ? 'selected' : '' }}>OpenAI (GPT)</option>
                                <option value="groq" {{ ($settings['ai_provider'] ?? '') == 'groq' ? 'selected' : '' }}>Groq (Llama/Mixtral)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">AI Model</label>
                            <select name="ai_model" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all">
                                <optgroup label="Google Gemini">
                                    <option value="gemini-1.5-flash" {{ ($settings['ai_model'] ?? 'gemini-1.5-flash') == 'gemini-1.5-flash' ? 'selected' : '' }}>Gemini 1.5 Flash (Recommended)</option>
                                    <option value="gemini-1.5-pro" {{ ($settings['ai_model'] ?? '') == 'gemini-1.5-pro' ? 'selected' : '' }}>Gemini 1.5 Pro</option>
                                    <option value="gemini-2.0-flash-exp" {{ ($settings['ai_model'] ?? '') == 'gemini-2.0-flash-exp' ? 'selected' : '' }}>Gemini 2.0 Flash (Experimental)</option>
                                </optgroup>
                                <optgroup label="OpenAI">
                                    <option value="gpt-4o" {{ ($settings['ai_model'] ?? '') == 'gpt-4o' ? 'selected' : '' }}>GPT-4o</option>
                                    <option value="gpt-4o-mini" {{ ($settings['ai_model'] ?? '') == 'gpt-4o-mini' ? 'selected' : '' }}>GPT-4o Mini</option>
                                    <option value="gpt-4-turbo" {{ ($settings['ai_model'] ?? '') == 'gpt-4-turbo' ? 'selected' : '' }}>GPT-4 Turbo</option>
                                </optgroup>
                                <optgroup label="Groq">
                                    <option value="llama-3.3-70b-versatile" {{ ($settings['ai_model'] ?? '') == 'llama-3.3-70b-versatile' ? 'selected' : '' }}>Llama 3.3 70B</option>
                                    <option value="mixtral-8x7b-32768" {{ ($settings['ai_model'] ?? '') == 'mixtral-8x7b-32768' ? 'selected' : '' }}>Mixtral 8x7B</option>
                                </optgroup>
                            </select>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">API Key</label>
                            <input type="password" name="ai_api_key" value="{{ $settings['ai_api_key'] ?? '' }}" placeholder="Enter your API key (e.g., AIza...)" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all font-mono">
                            <p class="text-[10px] text-slate-400 mt-2 px-1 italic">Get your Gemini key from <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-violet-600 underline">Google AI Studio</a>.</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Assistant Name</label>
                            <input type="text" name="ai_name" value="{{ $settings['ai_name'] ?? 'NexaBot' }}" placeholder="e.g., Nova, NexaBot" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Greeting Message</label>
                            <input type="text" name="ai_greeting" value="{{ $settings['ai_greeting'] ?? 'Hi! I am NexaBot, your personal career assistant. How can I help you today?' }}" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">System Prompt (Personality)</label>
                        <textarea name="ai_system_prompt" placeholder="Describe the AI's personality and knowledge..." class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all h-32 font-mono text-sm">{{ $settings['ai_system_prompt'] ?? 'You are NexaBot, the official AI assistant for NexaWork - a professional networking and job discovery mobile app. You help users find jobs, improve their profiles, connect with professionals, and navigate the platform. Be friendly, professional, and concise. Always encourage users to explore NexaWork features.' }}</textarea>
                        <p class="text-[10px] text-slate-400 mt-2 px-1 italic">This instructs the AI on how to behave and what it knows. Customize to match your brand.</p>
                    </div>
                </div>
            </div>

            <div class="flex justify-end pt-4">
                <button type="submit" class="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-3">
                    <i data-lucide="save" class="w-5 h-5"></i>
                    Sync System Variables
                </button>
            </div>
        </div>
    </form>
</div>
@endsection
