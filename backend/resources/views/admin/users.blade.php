@extends('admin.layout')

@section('title', 'Manage Users')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
        <p class="text-slate-500 mt-1">Audit, block, or remove users from the system.</p>
    </div>
    <div class="flex gap-3">
        <button class="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2">
            <i data-lucide="download" class="w-4 h-4"></i> Export CSV
        </button>
    </div>
</div>

<div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100">
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Activity</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                @foreach($users as $user)
                <tr class="hover:bg-slate-50/50 transition-all group">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 border border-indigo-100">
                                @if($user->avatar)
                                    <img src="{{ $user->avatar }}" class="w-full h-full rounded-full object-cover">
                                @else
                                    {{ substr($user->name, 0, 1) }}
                                @endif
                            </div>
                            <div>
                                <p class="text-sm font-bold text-slate-900">{{ $user->name }}</p>
                                <p class="text-xs text-slate-500">{{ $user->email }}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <form action="{{ route('admin.users.role', $user->id) }}" method="POST" class="flex items-center gap-2">
                            @csrf
                            <select name="role" onchange="this.form.submit()" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                                <option value="user" {{ $user->role === 'user' ? 'selected' : '' }}>USER</option>
                                <option value="employer" {{ $user->role === 'employer' ? 'selected' : '' }}>EMPLOYER</option>
                                <option value="admin" {{ $user->role === 'admin' ? 'selected' : '' }}>ADMIN</option>
                            </select>
                        </form>
                    </td>
                    <td class="px-6 py-4">
                        @if($user->is_active)
                        <span class="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                        @else
                        <div>
                            <span class="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Blocked
                            </span>
                            @if($user->ban_reason)
                                <p class="text-[10px] text-slate-400 mt-1 italic w-32 truncate" title="{{ $user->ban_reason }}">{{ $user->ban_reason }}</p>
                            @endif
                        </div>
                        @endif
                    </td>
                    <td class="px-6 py-4">
                         <div class="flex justify-center gap-4 text-slate-400">
                            <div class="text-center" title="Posts">
                                <span class="block text-xs font-bold text-slate-700">{{ $user->posts_count }}</span>
                                <i data-lucide="rss" class="w-3 h-3 mx-auto"></i>
                            </div>
                            <div class="text-center" title="Jobs">
                                <span class="block text-xs font-bold text-slate-700">{{ $user->jobs_count }}</span>
                                <i data-lucide="briefcase" class="w-3 h-3 mx-auto"></i>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <form action="{{ route('admin.users.block', $user->id) }}" method="POST" id="block-form-{{ $user->id }}">
                                @csrf
                                <input type="hidden" name="ban_reason" id="ban-reason-{{ $user->id }}">
                                <button type="button" 
                                    onclick="blockWithReason('{{ $user->id }}', {{ $user->is_active ? 'true' : 'false' }})"
                                    class="p-2 {{ $user->is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50' }} rounded-lg transition-all" 
                                    title="{{ $user->is_active ? 'Block with Reason' : 'Unblock' }}">
                                    <i data-lucide="{{ $user->is_active ? 'slash' : 'check-circle' }}" class="w-5 h-5"></i>
                                </button>
                            </form>
                            <form action="{{ route('admin.users.delete', $user->id) }}" method="POST" onsubmit="return confirm('Permanently delete this user?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    
    <div class="p-6 bg-slate-50/50 border-t border-slate-100">
        {{ $users->links() }}
    </div>
</div>
@endsection

<script>
    function blockWithReason(userId, isActive) {
        if (isActive) {
            const reason = prompt("Enter a reason for blocking this user:", "Violation of community guidelines");
            if (reason === null) return; // User cancelled
            document.getElementById('ban-reason-' + userId).value = reason;
        }
        document.getElementById('block-form-' + userId).submit();
    }
</script>
