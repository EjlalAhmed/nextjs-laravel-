<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function monthly(Request $request)
    {
        $userId = $request->user()->id;

        $data = Transaction::where('user_id', $userId)
            ->select(DB::raw("DATE_FORMAT(transaction_date, '%Y-%m') as month"), DB::raw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income'), DB::raw('SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json($data);
    }

    public function yearly(Request $request)
    {
        $userId = $request->user()->id;

        $data = Transaction::where('user_id', $userId)
            ->select(DB::raw("YEAR(transaction_date) as year"), DB::raw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income'), DB::raw('SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense'))
            ->groupBy('year')
            ->orderBy('year')
            ->get();

        return response()->json($data);
    }

    public function categoryWise(Request $request)
    {
        $userId = $request->user()->id;

        $data = Transaction::where('user_id', $userId)
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name as category', DB::raw('SUM(amount) as total'))
            ->groupBy('categories.name')
            ->orderByDesc('total')
            ->get();

        return response()->json($data);
    }
}
