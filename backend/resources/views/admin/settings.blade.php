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
