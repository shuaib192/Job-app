<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Company;
use App\Models\Job;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $companies = Company::withCount('owner')->get();
        return response()->json($companies);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'industry' => 'nullable|string',
            'description' => 'nullable|string',
            'website' => 'nullable|url',
            'location' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $company = Company::create(array_merge(
            $request->all(),
            ['owner_id' => $request->user()->id]
        ));

        return response()->json($company, 201);
    }

    public function show($id)
    {
        $company = Company::with(['owner'])->findOrFail($id);
        $jobs = Job::where('company_id', $id)->latest()->get();
        
        return response()->json([
            'company' => $company,
            'jobs' => $jobs
        ]);
    }

    public function update(Request $request, Company $company)
    {
        if ($company->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $company->update($request->all());

        return response()->json($company);
    }

    public function myCompanies(Request $request)
    {
        return response()->json(Company::where('owner_id', $request->user()->id)->get());
    }

    public function destroy(Request $request, Company $company)
    {
        if ($company->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $company->delete();
        return response()->json(['message' => 'Company deleted successfully']);
    }
}

