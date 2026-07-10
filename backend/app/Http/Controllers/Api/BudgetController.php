<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Budget::where('user_id', $request->user()->id)->with('category')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'amount' => ['required', 'numeric'],
            'month' => ['required', 'integer'],
            'year' => ['required', 'integer'],
        ]);

        $budget = Budget::create(['user_id' => $request->user()->id, ...$data]);

        return response()->json($budget->load('category'), 201);
    }

    public function show(Request $request, Budget $budget)
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        return response()->json($budget->load('category'));
    }

    public function update(Request $request, Budget $budget)
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'amount' => ['required', 'numeric'],
            'month' => ['required', 'integer'],
            'year' => ['required', 'integer'],
        ]);

        $budget->update($data);

        return response()->json($budget->load('category'));
    }

    public function destroy(Request $request, Budget $budget)
    {
        abort_unless($budget->user_id === $request->user()->id, 403);
        $budget->delete();

        return response()->json(['message' => 'Budget deleted']);
    }
}
