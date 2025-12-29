<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexaWork Admin - @yield('title')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #F8FAFC; }
        .sidebar-link.active { background-color: #EEF2FF; color: #4F46E5; border-right: 4px solid #4F46E5; }
        .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }
    </style>
</head>
<body class="text-slate-800">
    <div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
            <div class="p-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <i data-lucide="layout-dashboard" class="text-white w-6 h-6"></i>
                    </div>
                    <span class="text-xl font-bold tracking-tight text-indigo-900">NexaWork</span>
                </div>
            </div>

            <nav class="flex-1 px-4 space-y-1 mt-4">
                <a href="{{ url('/admin/dashboard') }}" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all {{ request()->is('admin/dashboard') ? 'active' : '' }}">
                    <i data-lucide="pie-chart" class="w-5 h-5"></i>
                    <span class="font-medium">Dashboard</span>
                </a>
                <a href="{{ route('admin.users') }}" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all {{ request()->is('admin/users') ? 'active' : '' }}">
                    <i data-lucide="users" class="w-5 h-5"></i>
                    <span class="font-medium">Manage Users</span>
                </a>
                <a href="{{ route('admin.jobs') }}" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all {{ request()->is('admin/jobs') ? 'active' : '' }}">
                    <i data-lucide="briefcase" class="w-5 h-5"></i>
                    <span class="font-medium">Manage Jobs</span>
                </a>
                <a href="{{ route('admin.directories') }}" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all {{ request()->is('admin/directories') ? 'active' : '' }}">
                    <i data-lucide="folder-tree" class="w-5 h-5"></i>
                    <span class="font-medium">App Directories</span>
                </a>
                <a href="{{ route('admin.settings') }}" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all {{ request()->is('admin/settings') ? 'active' : '' }}">
                    <i data-lucide="settings" class="w-5 h-5"></i>
                    <span class="font-medium">App Settings</span>
                </a>
            </nav>

            <div class="p-4 border-t border-slate-100">
                <form action="{{ route('logout') }}" method="POST">
                    @csrf
                    <button type="submit" class="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                        <span class="font-semibold">Logout</span>
                    </button>
                </form>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <!-- Top Navbar -->
            <header class="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-8 z-10">
                <div class="md:hidden">
                     <i data-lucide="menu" class="w-6 h-6 text-slate-600"></i>
                </div>
                <div class="flex-1"></div>
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <p class="text-sm font-bold text-slate-900">{{ Auth::user()->name ?? 'Admin' }}</p>
                        <p class="text-xs text-slate-500">Super Administrator</p>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200">
                        @if(Auth::user()->avatar)
                            <img src="{{ Auth::user()->avatar }}" class="w-full h-full object-cover">
                        @else
                            <span class="text-indigo-600 font-bold text-lg">{{ substr(Auth::user()->name ?? 'A', 0, 1) }}</span>
                        @endif
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <div class="flex-1 overflow-y-auto p-8">
                @if(session('success'))
                <div class="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3">
                    <i data-lucide="check-circle" class="w-5 h-5"></i>
                    {{ session('success') }}
                </div>
                @endif

                @if(session('error'))
                <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                    <i data-lucide="alert-circle" class="w-5 h-5"></i>
                    {{ session('error') }}
                </div>
                @endif

                @yield('content')
            </div>
        </main>
    </div>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>
