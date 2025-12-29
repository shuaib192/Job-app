@extends('admin.layout')

@section('title', 'Manage Directories')

@section('content')
<div class="mb-8">
    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">App Directories</h1>
    <p class="text-slate-500 mt-1">Manage Skills and Industries used across the platform.</p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Skills Management -->
    <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="award" class="w-6 h-6 text-indigo-600"></i> Skills Directory
            </h2>
        </div>

        <form action="{{ route('admin.skills.add') }}" method="POST" class="mb-6">
            @csrf
            <div class="flex gap-2">
                <input type="text" name="name" placeholder="Add new skill (e.g. React Native)..." required
                    class="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400">
                <button type="submit" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i> Add
                </button>
            </div>
        </form>

        <div class="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto pr-2">
            @foreach($skills as $skill)
            <div class="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full group transition-all hover:bg-indigo-100">
                <span class="text-sm font-bold text-indigo-700">{{ $skill->name }}</span>
                <form action="{{ route('admin.skills.delete', $skill->id) }}" method="POST" class="flex items-center">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="text-indigo-300 hover:text-rose-600 transition-colors" onclick="return confirm('Delete this skill?')">
                        <i data-lucide="x-circle" class="w-4 h-4"></i>
                    </button>
                </form>
            </div>
            @endforeach
        </div>
    </div>

    <!-- Industries Management -->
    <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="building-2" class="w-6 h-6 text-amber-600"></i> Industries Directory
            </h2>
        </div>

        <form action="{{ route('admin.industries.add') }}" method="POST" class="mb-6">
            @csrf
            <div class="flex gap-2">
                <input type="text" name="name" placeholder="Add new industry (e.g. Fintech)..." required
                    class="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-400">
                <button type="submit" class="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i> Add
                </button>
            </div>
        </form>

        <div class="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto pr-2">
            @foreach($industries as $industry)
            <div class="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full group transition-all hover:bg-amber-100">
                <span class="text-sm font-bold text-amber-900">{{ $industry->name }}</span>
                <form action="{{ route('admin.industries.delete', $industry->id) }}" method="POST" class="flex items-center">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="text-amber-300 hover:text-rose-600 transition-colors" onclick="return confirm('Delete this industry?')">
                        <i data-lucide="x-circle" class="w-4 h-4"></i>
                    </button>
                </form>
            </div>
            @endforeach
        </div>
    </div>
</div>
@endsection
