<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexaWork Admin - Login</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); }
        .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-md">
        <div class="glass p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50">
            <div class="text-center mb-10">
                <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                    <i data-lucide="shield-check" class="text-white w-10 h-10"></i>
                </div>
                <h1 class="text-3xl font-extrabold text-indigo-950 mb-2">Central Control</h1>
                <p class="text-slate-500">NexaWork Management Suite</p>
            </div>

            @if($errors->any())
            <div class="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3">
                <i data-lucide="alert-circle" class="w-5 h-5"></i>
                {{ $errors->first() }}
            </div>
            @endif

            <form action="{{ url('/admin/login') }}" method="POST" class="space-y-6">
                @csrf
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Administrator Email</label>
                    <div class="relative">
                        <i data-lucide="mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                        <input type="email" name="email" required 
                            class="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" 
                            placeholder="admin@nexawork.com">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Master Password</label>
                    <div class="relative">
                        <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                        <input type="password" name="password" required 
                            class="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" 
                            placeholder="••••••••">
                    </div>
                </div>

                <button type="submit" class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]">
                    Authorize Access
                </button>
            </form>

            <p class="mt-8 text-center text-xs text-slate-400 font-medium uppercase tracking-widest">
                Secure Environment System v2.0
            </p>
        </div>
    </div>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>
