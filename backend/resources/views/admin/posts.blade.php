@extends('admin.layout')

@section('title', 'Manage Posts')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Social Feed Management</h1>
        <p class="text-slate-500 mt-1">Monitor and moderate community content.</p>
    </div>
</div>

<div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100">
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Post Content</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Author</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Engagement</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Posted</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                @foreach($posts as $post)
                <tr class="hover:bg-slate-50/50 transition-all group">
                    <td class="px-6 py-4 max-w-md">
                        <div class="flex items-center gap-3">
                            @if($post->image)
                                <div class="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                                    <img src="{{ $post->image }}" class="w-full h-full object-cover">
                                </div>
                            @endif
                            <div class="line-clamp-2 text-sm text-slate-700">
                                {{ $post->content }}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                             <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-100">
                                {{ substr($post->user->name ?? '?', 0, 1) }}
                            </div>
                            <p class="text-sm font-medium text-slate-700">{{ $post->user->name ?? 'Unknown' }}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <div class="flex items-center justify-center gap-4 text-slate-400">
                            <div class="flex items-center gap-1" title="Likes">
                                <i data-lucide="heart" class="w-3.5 h-3.5"></i>
                                <span class="text-xs font-bold text-slate-600">{{ $post->likes_count }}</span>
                            </div>
                            <div class="flex items-center gap-1" title="Comments">
                                <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                                <span class="text-xs font-bold text-slate-600">{{ $post->comments_count }}</span>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ $post->created_at->format('M d, Y') }}</p>
                        <p class="text-[10px] text-slate-400">{{ $post->created_at->format('H:i') }}</p>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                             <a href="#" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Source">
                                <i data-lucide="external-link" class="w-5 h-5"></i>
                            </a>
                            <form action="{{ route('admin.posts.delete', $post->id) }}" method="POST" onsubmit="return confirm('Permanently remove this post?')">
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
        {{ $posts->links() }}
    </div>
</div>
@endsection
