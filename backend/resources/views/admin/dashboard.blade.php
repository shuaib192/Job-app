@extends('admin.layout')

@section('title', 'Dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
    <p class="text-slate-500 mt-1">Real-time application performance and statistics.</p>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
    <!-- Stat Card: Users -->
    <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                <i data-lucide="users" class="w-6 h-6 text-indigo-600 group-hover:text-white"></i>
            </div>
            <span class="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
        </div>
        <p class="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Users</p>
        <h3 class="text-3xl font-extrabold text-slate-900 mt-1">{{ $stats['users'] }}</h3>
    </div>

    <!-- Stat Card: Jobs -->
    <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-all">
                <i data-lucide="briefcase" class="w-6 h-6 text-amber-600 group-hover:text-white"></i>
            </div>
            <span class="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+5%</span>
        </div>
        <p class="text-slate-500 text-sm font-semibold uppercase tracking-wider">Active Jobs</p>
        <h3 class="text-3xl font-extrabold text-slate-900 mt-1">{{ $stats['jobs'] }}</h3>
    </div>

    <!-- Stat Card: Applications -->
    <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-all">
                <i data-lucide="file-text" class="w-6 h-6 text-emerald-600 group-hover:text-white"></i>
            </div>
            <span class="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+18%</span>
        </div>
        <p class="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Applications</p>
        <h3 class="text-3xl font-extrabold text-slate-900 mt-1">{{ $stats['applications'] ?? 0 }}</h3>
    </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
    <a href="{{ route('admin.export.users') }}" class="bg-indigo-600 p-6 rounded-[2rem] shadow-sm hover:shadow-lg transition-all flex items-center justify-between group">
        <div>
            <h3 class="text-white text-xl font-bold">Export User Data</h3>
            <p class="text-indigo-100 text-sm">Download full user directory as CSV</p>
        </div>
        <div class="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
            <i data-lucide="download" class="text-white w-6 h-6"></i>
        </div>
    </a>
    <a href="{{ route('admin.export.jobs') }}" class="bg-emerald-600 p-6 rounded-[2rem] shadow-sm hover:shadow-lg transition-all flex items-center justify-between group">
        <div>
            <h3 class="text-white text-xl font-bold">Export Job Data</h3>
            <p class="text-emerald-100 text-sm">Download all job listings as CSV</p>
        </div>
        <div class="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
            <i data-lucide="download" class="text-white w-6 h-6"></i>
        </div>
    </a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Chart Section -->
    <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-xl font-bold text-slate-900">User Growth</h2>
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-indigo-500"></span>
                <span class="text-xs font-bold text-slate-500 uppercase">Last 7 Days</span>
            </div>
        </div>
        <div class="h-[300px] w-full">
            <canvas id="growthChart"></canvas>
        </div>
    </div>

    <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-xl font-bold text-slate-900">Recent Activity</h2>
            <button class="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
        </div>
        <div class="space-y-6">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <i data-lucide="user-plus" class="w-5 h-5 text-slate-600"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-bold text-slate-900">New user registered</p>
                    <p class="text-xs text-slate-500">2 minutes ago</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <i data-lucide="plus-circle" class="w-5 h-5 text-indigo-600"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-bold text-slate-900">Senior Laravel Developer job posted</p>
                    <p class="text-xs text-slate-500">1 hour ago</p>
                </div>
            </div>
             <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-bold text-slate-900">System update completed</p>
                    <p class="text-xs text-slate-500">5 hours ago</p>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Push Broadcast Section -->
<div class="mt-10">
    <div class="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 right-0 p-8 opacity-10">
            <i data-lucide="megaphone" class="w-32 h-32 text-white"></i>
        </div>
        <div class="relative z-10 lg:flex items-center gap-10">
            <div class="lg:w-1/3 mb-8 lg:mb-0">
                <h2 class="text-3xl font-bold text-white mb-4">Push Broadcast</h2>
                <p class="text-indigo-200 leading-relaxed">Send a global push notification to all users. Use this for app updates or important system announcements.</p>
            </div>
            <div class="flex-1 bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
                <form action="{{ route('admin.broadcast') }}" method="POST" class="space-y-4">
                    @csrf
                    <div>
                        <label class="block text-sm font-bold text-indigo-100 mb-2">Notification Title</label>
                        <input type="text" name="title" required maxlength="100" placeholder="e.g. New Update Available!" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-indigo-100 mb-2">Message Body</label>
                        <textarea name="body" required maxlength="255" rows="2" placeholder="Describe the announcement briefly..." class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2">
                        <i data-lucide="send" class="w-5 h-5"></i>
                        Send Global Broadcast
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('growthChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: {!! json_encode($chartData['labels']) !!},
                datasets: [{
                    label: 'Registrations',
                    data: {!! json_encode($chartData['data']) !!},
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#4F46E5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#F1F5F9' },
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    });
</script>
@endsection
