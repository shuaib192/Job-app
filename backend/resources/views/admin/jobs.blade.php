@extends('admin.layout')

@section('title', 'Manage Jobs')

@section('content')
<div class="mb-8 flex items-center justify-between">
    <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Job Portal Management</h1>
        <p class="text-slate-500 mt-1">Review all active opportunities and delete as necessary.</p>
    </div>
</div>

<div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100">
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Job Opportunity</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Employer</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Details</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Applicants</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                @foreach($jobs as $job)
                <tr class="hover:bg-slate-50/50 transition-all group">
                    <td class="px-6 py-4">
                        <div>
                            <p class="text-sm font-bold text-slate-900">{{ $job->title }}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 uppercase">{{ $job->type }}</span>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase">{{ $job->location }}</span>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                {{ substr($job->employer->name ?? '?', 0, 1) }}
                            </div>
                            <p class="text-sm font-medium text-slate-700">{{ $job->employer->name ?? 'Unknown' }}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <p class="text-xs font-bold text-emerald-600">{{ $job->salary_range ?? 'Not specified' }}</p>
                        <p class="text-[10px] text-slate-400 mt-0.5">Posted {{ $job->created_at->diffForHumans() }}</p>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                            {{ $job->applications_count }}
                        </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                             <a href="#" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Details">
                                <i data-lucide="eye" class="w-5 h-5"></i>
                            </a>
                            <form action="{{ route('admin.jobs.delete', $job->id) }}" method="POST" onsubmit="return confirm('Delete this job posting?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Remove">
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
        {{ $jobs->links() }}
    </div>
</div>
@endsection
