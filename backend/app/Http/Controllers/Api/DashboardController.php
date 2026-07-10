<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $transactions = Transaction::where('user_id', $user->id)->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expense = $transactions->where('type', 'expense')->sum('amount');
        $balance = $income - $expense;

        $monthlyBudget = Budget::where('user_id', $user->id)->sum('amount');

        return response()->json([
            'summary' => [
                'total_income' => (float) $income,
                'total_expense' => (float) $expense,
                'balance' => (float) $balance,
                'monthly_budget' => (float) $monthlyBudget,
            ],
            'transactions' => $transactions->sortByDesc('transaction_date')->take(5)->values(),
        ]);
    }
}
